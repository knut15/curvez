#!/usr/bin/env node
/**
 * 스킬 정의 검증기.
 *
 * 사용법:
 *   node validate-skills.mjs                 # 기본 경로(플러그인 skills/, 프로젝트 .claude/skills/) 검사
 *   node validate-skills.mjs <경로> [...]     # 지정한 스킬 디렉터리 또는 SKILL.md 만 검사
 *
 * exit code: 오류 1건 이상이면 1.
 */

import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readMarkdown,
  extractSections,
  isSectionEmpty,
  hasKorean,
  hasLatinWord,
  extractQuotedTriggers,
  findTodoMarkers,
} from "./lib/frontmatter.mjs";
import { Report } from "./lib/report.mjs";
import {
  SKILL_REQUIRED_FIELDS,
  SKILL_REQUIRED_SECTIONS,
  SKILL_MAX_LINES,
  SECTION_SOFT_LIMIT,
  DESCRIPTION_MIN_LENGTH,
  MIN_QUOTED_TRIGGERS,
} from "./lib/spec.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");

function collectTargets(args) {
  if (args.length > 0) {
    const files = [];
    for (const arg of args) {
      const p = resolve(arg);
      if (!existsSync(p)) {
        console.error(`경로를 찾을 수 없다: ${p}`);
        process.exit(2);
      }
      if (statSync(p).isDirectory()) {
        const direct = join(p, "SKILL.md");
        if (existsSync(direct)) files.push(direct);
        else files.push(...listSkills(p));
      } else {
        files.push(p);
      }
    }
    return files;
  }

  const defaults = [
    join(PLUGIN_ROOT, "skills"),
    join(process.cwd(), ".claude", "skills"),
  ];
  return defaults.filter(existsSync).flatMap(listSkills);
}

/** 스킬 루트 아래의 SKILL.md 를 모은다. 한 단계 중첩(카테고리 디렉터리)까지 본다. */
function listSkills(root) {
  const found = [];
  for (const entry of readdirSync(root)) {
    const dir = join(root, entry);
    if (!statSync(dir).isDirectory()) continue;

    const skillFile = join(dir, "SKILL.md");
    if (existsSync(skillFile)) {
      found.push(skillFile);
      continue;
    }
    for (const nested of readdirSync(dir)) {
      const nestedDir = join(dir, nested);
      if (!statSync(nestedDir).isDirectory()) continue;
      const nestedSkill = join(nestedDir, "SKILL.md");
      if (existsSync(nestedSkill)) found.push(nestedSkill);
    }
  }
  return found;
}

function validateSkill(file, report) {
  report.track(file);

  const { frontmatter, body, bodyOffset, lines, raw } = readMarkdown(file);
  const skillDir = dirname(file);

  if (!frontmatter) {
    report.error(
      file,
      1,
      "skill/frontmatter-missing",
      "프론트매터(--- 블록)가 없다.",
    );
    return;
  }

  // 0. 스캐폴드 TODO 가 남아 있으면 미완성이다.
  //    이유: 호출은 되는데 절차가 비어 있는 스킬이 가장 나쁘다. 실행이 시작된 뒤에 멈춘다.
  for (const todo of findTodoMarkers(raw)) {
    report.error(
      file,
      todo.line,
      "skill/todo-remaining",
      `스캐폴드 TODO 가 남아 있다: ${todo.text}`,
    );
  }

  // references 안의 TODO 도 함께 잡는다. 포인터를 따라간 곳이 비어 있으면 절차가 끊긴다.
  const refDirForTodo = join(skillDir, "references");
  if (existsSync(refDirForTodo)) {
    for (const f of readdirSync(refDirForTodo).filter((n) =>
      n.endsWith(".md"),
    )) {
      const refPath = join(refDirForTodo, f);
      for (const todo of findTodoMarkers(readFileSync(refPath, "utf8"))) {
        report.error(
          file,
          null,
          "skill/todo-remaining",
          `references/${f}:${todo.line} 에 TODO 가 남아 있다.`,
        );
      }
    }
  }

  // 1. 필수 필드
  for (const field of SKILL_REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      report.error(
        file,
        2,
        "skill/field-required",
        `프론트매터에 \`${field}\` 가 없거나 비었다.`,
      );
    }
  }

  // 2. name 이 디렉터리명과 일치해야 한다.
  //    이유: 스킬은 디렉터리 이름으로 호출된다. name 과 다르면 호출 이름과 문서 정체성이 어긋난다.
  const expectedName = basename(skillDir);
  if (frontmatter.name && frontmatter.name !== expectedName) {
    report.error(
      file,
      2,
      "skill/name-mismatch",
      `name(\`${frontmatter.name}\`) 이 디렉터리명(\`${expectedName}\`) 과 다르다.`,
    );
  }

  // 3. 분량 제한
  //    이유: 길어질수록 주의가 옅어져 뒷부분 지시가 실행되지 않는다. 조건부 상세는 references 로 내린다.
  if (lines.length > SKILL_MAX_LINES) {
    report.error(
      file,
      lines.length,
      "skill/too-long",
      `${lines.length}줄로 상한 ${SKILL_MAX_LINES}줄을 넘었다. 조건부 상세·도메인 분기·긴 예시를 references/ 로 분리하라.`,
    );
  }

  // 4. description 품질 — 호출 신호
  const desc = frontmatter.description ?? "";
  if (desc && desc.length < DESCRIPTION_MIN_LENGTH) {
    report.error(
      file,
      2,
      "skill/description-short",
      `description 이 ${desc.length}자로 너무 짧다. 최소 ${DESCRIPTION_MIN_LENGTH}자.`,
    );
  }
  const triggers = extractQuotedTriggers(desc);
  if (desc && triggers.length < MIN_QUOTED_TRIGGERS) {
    report.error(
      file,
      2,
      "skill/triggers-few",
      `description 의 따옴표 트리거가 ${triggers.length}개다. 최소 ${MIN_QUOTED_TRIGGERS}개를 적어라. 사용자가 실제로 말할 표현을 그대로 넣어야 호출된다.`,
    );
  }
  if (desc && !hasKorean(desc)) {
    report.error(
      file,
      2,
      "skill/description-korean",
      "description 에 한글 트리거가 없다. 한글 발화에서 호출되지 않는다.",
    );
  }
  if (desc && !hasLatinWord(desc)) {
    report.error(
      file,
      2,
      "skill/description-latin",
      "description 에 영어 트리거가 없다. 영어 발화에서 호출되지 않는다.",
    );
  }

  // 5. 트리거 경계 섹션
  //    이유: "언제 쓰는가"만 있으면 인접 스킬과 경계가 겹쳐 엉뚱한 상황에서 호출된다.
  const sections = extractSections(body, bodyOffset).filter(
    (s) => s.level === 2,
  );
  const headings = sections.map((s) => s.heading);
  for (const required of SKILL_REQUIRED_SECTIONS) {
    if (!headings.includes(required)) {
      report.error(
        file,
        null,
        "skill/section-missing",
        `필수 섹션 \`## ${required}\` 이 없다.`,
      );
    }
  }
  for (const section of sections) {
    if (
      SKILL_REQUIRED_SECTIONS.includes(section.heading) &&
      isSectionEmpty(section)
    ) {
      report.error(
        file,
        section.line,
        "skill/section-empty",
        `\`## ${section.heading}\` 이 비었다.`,
      );
    }
  }

  // 6. 섹션 비대 경고
  for (const section of sections) {
    if (section.contentLines.length > SECTION_SOFT_LIMIT) {
      report.warn(
        file,
        section.line,
        "skill/section-bloat",
        `\`## ${section.heading}\` 이 ${section.contentLines.length}줄이다. ${SECTION_SOFT_LIMIT}줄을 넘으면 references/ 분리를 검토하라.`,
      );
    }
  }

  // 7. references 링크 유효성
  //    이유: 깨진 포인터는 조용히 실패한다. 에이전트가 읽지 못하고도 읽은 것처럼 진행한다.
  const linkRe = /\]\(([^)]+\.md)\)/g;
  let m;
  while ((m = linkRe.exec(body)) !== null) {
    const target = m[1];
    if (/^https?:/.test(target)) continue;
    const resolved = resolve(skillDir, target.split("#")[0]);
    if (!existsSync(resolved)) {
      const lineNo = bodyOffset + body.slice(0, m.index).split("\n").length;
      report.error(
        file,
        lineNo,
        "skill/broken-reference",
        `참조 파일이 없다: ${target}`,
      );
    }
  }

  // 8. references 디렉터리 고아 파일 경고
  const refDir = join(skillDir, "references");
  if (existsSync(refDir)) {
    for (const f of readdirSync(refDir).filter((f) => f.endsWith(".md"))) {
      if (!body.includes(f)) {
        report.warn(
          file,
          null,
          "skill/orphan-reference",
          `references/${f} 를 본문에서 가리키지 않는다. 포인터 없는 참조는 도달하지 않는다.`,
        );
      }
    }
  }

  // 9. why-first — 금지 규칙에 이유가 붙어 있는가
  //    이유: 이유를 모르면 문서에 없는 엣지 케이스에서 판단을 이어갈 수 없다.
  const hasProhibition =
    /(하지 ?마라|하지 ?않는다|금지|쓰지 ?마라|안 ?된다|절대)/.test(body);
  const hasReason = /(이유:|왜냐|때문이다|근거:)/.test(body);
  if (hasProhibition && !hasReason) {
    report.error(
      file,
      null,
      "skill/why-missing",
      "금지 규칙이 있는데 이유가 없다. `이유:` 를 붙여 왜 안 되는지 적어라.",
    );
  }

  // 10. 문체 — 명령형
  //     이유: 설명조는 선택지처럼 읽혀 실행되지 않는다.
  const politeCount = (
    body.match(/(합니다|입니다|하세요|해주세요|습니다)/g) ?? []
  ).length;
  if (politeCount > 0) {
    report.warn(
      file,
      null,
      "skill/tone-not-imperative",
      `존댓말·설명조 표현이 ${politeCount}건 있다. \`~하라\`, \`~한다\` 명령형으로 고쳐라.`,
    );
  }
}

function main() {
  const targets = collectTargets(process.argv.slice(2));
  const report = new Report("스킬 검증");

  if (targets.length === 0) {
    console.log(
      "검사할 스킬이 없다. (skills/ 디렉터리가 비었거나 존재하지 않는다)",
    );
    return 0;
  }

  for (const file of targets) validateSkill(file, report);
  return report.print();
}

process.exit(main());
