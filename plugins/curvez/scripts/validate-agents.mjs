#!/usr/bin/env node
/**
 * 에이전트 정의 검증기.
 *
 * 사용법:
 *   node validate-agents.mjs                 # 기본 경로(플러그인 agents/, 프로젝트 .claude/agents/) 검사
 *   node validate-agents.mjs <경로> [...]     # 지정한 디렉터리 또는 파일만 검사
 *
 * exit code: 오류 1건 이상이면 1.
 */

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readMarkdown,
  extractSections,
  isSectionEmpty,
  hasKorean,
  hasLatinWord,
  findTodoMarkers,
} from "./lib/frontmatter.mjs";
import { Report } from "./lib/report.mjs";
import {
  AGENT_REQUIRED_FIELDS,
  AGENT_REQUIRED_SECTIONS,
  ALLOWED_MODELS,
  WRITE_TOOLS,
  DESCRIPTION_MIN_LENGTH,
  OWNS_NONE,
  OWNS_SYMBOLS,
  UNOWNED_PATHS,
  OWNS_SHARED_EXEMPT,
} from "./lib/spec.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");

/** 검사 대상 .md 파일 목록을 만든다. */
function collectTargets(args) {
  if (args.length > 0) {
    const files = [];
    for (const arg of args) {
      const p = resolve(arg);
      if (!existsSync(p)) {
        console.error(`경로를 찾을 수 없다: ${p}`);
        process.exit(2);
      }
      if (statSync(p).isDirectory()) files.push(...listMarkdown(p));
      else files.push(p);
    }
    return files;
  }

  const defaults = [
    join(PLUGIN_ROOT, "agents"),
    join(process.cwd(), ".claude", "agents"),
  ];
  return defaults.filter(existsSync).flatMap(listMarkdown);
}

function listMarkdown(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(dir, f));
}

/** 쉼표 구분 문자열 또는 배열을 배열로 정규화한다. */
function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function validateAgent(file, report) {
  report.track(file);

  const { frontmatter, body, bodyOffset, raw } = readMarkdown(file);

  if (!frontmatter) {
    report.error(
      file,
      1,
      "agent/frontmatter-missing",
      "프론트매터(--- 블록)가 없다.",
    );
    return;
  }

  // 0. 스캐폴드 TODO 가 남아 있으면 미완성이다.
  //    이유: 빈 계약을 든 에이전트는 실행 시점에 그 자리를 추측으로 메운다.
  const todos = findTodoMarkers(raw);
  for (const todo of todos) {
    report.error(
      file,
      todo.line,
      "agent/todo-remaining",
      `스캐폴드 TODO 가 남아 있다: ${todo.text}`,
    );
  }

  // 1. 필수 5필드
  for (const field of AGENT_REQUIRED_FIELDS) {
    const value = frontmatter[field];
    const empty =
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (empty) {
      report.error(
        file,
        2,
        "agent/field-required",
        `프론트매터에 \`${field}\` 가 없거나 비었다. 필수 5필드: ${AGENT_REQUIRED_FIELDS.join(", ")}`,
      );
    }
  }

  // 2. name 이 파일명과 일치해야 한다.
  //    이유: Claude Code 는 name 으로 에이전트를 부르고 사람은 파일명으로 찾는다. 둘이 다르면 추적이 끊긴다.
  const expectedName = basename(file, ".md");
  if (frontmatter.name && frontmatter.name !== expectedName) {
    report.error(
      file,
      2,
      "agent/name-mismatch",
      `name(\`${frontmatter.name}\`) 이 파일명(\`${expectedName}\`) 과 다르다.`,
    );
  }

  // 3. curvez 코어 에이전트는 이름 충돌을 피하려고 prefix 를 강제한다.
  const isCoreAgent = file.startsWith(join(PLUGIN_ROOT, "agents"));
  if (
    isCoreAgent &&
    frontmatter.name &&
    !frontmatter.name.startsWith("curvez-")
  ) {
    report.error(
      file,
      2,
      "agent/name-prefix",
      "curvez 코어 에이전트의 name 은 `curvez-` 로 시작해야 한다. 에이전트 이름은 전역 네임스페이스라 다른 플러그인과 충돌한다.",
    );
  }

  // 4. model 허용값
  if (frontmatter.model && !ALLOWED_MODELS.includes(frontmatter.model)) {
    report.error(
      file,
      2,
      "agent/model-invalid",
      `model \`${frontmatter.model}\` 은 허용값이 아니다. 허용: ${ALLOWED_MODELS.join(", ")}`,
    );
  }

  // 5. description 품질
  const desc = frontmatter.description ?? "";
  if (desc && desc.length < DESCRIPTION_MIN_LENGTH) {
    report.error(
      file,
      2,
      "agent/description-short",
      `description 이 ${desc.length}자로 너무 짧다. 최소 ${DESCRIPTION_MIN_LENGTH}자. 어떤 상황에서 이 에이전트를 부르는지 적어라.`,
    );
  }
  if (desc && !hasKorean(desc)) {
    report.warn(
      file,
      2,
      "agent/description-korean",
      "description 에 한글 트리거가 없다. 한글 발화에서 선택되지 않는다.",
    );
  }
  if (desc && !hasLatinWord(desc)) {
    report.warn(
      file,
      2,
      "agent/description-latin",
      "description 에 영어 트리거가 없다. 영어 발화에서 선택되지 않는다.",
    );
  }

  // 6. tools / disallowedTools 정합성
  //    같은 도구가 양쪽에 있으면 의도가 모순이다.
  const tools = toList(frontmatter.tools);
  const disallowed = toList(frontmatter.disallowedTools);
  const overlap = tools.filter((t) => disallowed.includes(t));
  if (overlap.length > 0) {
    report.error(
      file,
      2,
      "agent/tools-conflict",
      `tools 와 disallowedTools 에 같은 도구가 있다: ${overlap.join(", ")}`,
    );
  }
  if (disallowed.length === 0) {
    report.error(
      file,
      2,
      "agent/disallowed-empty",
      "disallowedTools 가 비었다. 금지할 도구가 없다면 `none` 이라고 명시적으로 적어 의도를 남겨라.",
    );
  }

  // 7. 읽기 전용 의도 검사: 리뷰 계열 에이전트는 쓰기 도구를 막아야 한다.
  //    이유: 리뷰어가 직접 고치기 시작하면 리뷰 대상과 리뷰 주체가 섞여 검증이 무의미해진다.
  const looksReviewer = /review|reviewer|audit|critic/i.test(
    frontmatter.name ?? "",
  );
  if (looksReviewer) {
    const missing = WRITE_TOOLS.filter((t) => !disallowed.includes(t));
    if (missing.length > 0) {
      report.error(
        file,
        2,
        "agent/reviewer-must-be-readonly",
        `리뷰 계열 에이전트는 쓰기 도구를 disallowedTools 에 넣어야 한다. 빠진 것: ${missing.join(", ")}`,
      );
    }
  }

  // 7-1. owns 형식 — 소유 경로 선언
  if (frontmatter.owns) {
    const ownsList = toList(frontmatter.owns);
    const isNone = ownsList.length === 1 && ownsList[0] === OWNS_NONE;

    if (!isNone) {
      for (const p of ownsList) {
        // 심볼은 정해진 것만 쓴다. 오타가 나면 아무와도 겹치지 않아 검사가 조용히 통과한다.
        if (p.startsWith("${") && !OWNS_SYMBOLS.includes(p)) {
          report.error(
            file,
            2,
            "agent/owns-symbol",
            `owns 의 \`${p}\` 는 허용된 심볼이 아니다. 허용: ${OWNS_SYMBOLS.join(", ")}`,
          );
        }
        // 소유자를 둘 수 없는 경로
        if (UNOWNED_PATHS.includes(p)) {
          report.error(
            file,
            2,
            "agent/owns-unowned",
            `\`${p}\` 는 소유자를 둘 수 없는 경로다. 한쪽 스택이 공유 시그니처를 바꾸면 다른 스택이 조용히 깨진다. 이 경로를 건드리는 작업은 순차로 강등한다.`,
          );
        }
        // 핸드오프는 파일명이 고유해 충돌하지 않는다. owns 에 넣으면 전원이 충돌로 잡힌다.
        if (OWNS_SHARED_EXEMPT.some((e) => p === e || p.startsWith(e))) {
          report.error(
            file,
            2,
            "agent/owns-shared",
            `\`${p}\` 는 owns 에 넣지 않는다. 파일명이 \`<from>.<timestamp>.json\` 으로 고유해 충돌하지 않으며, 넣으면 모든 에이전트가 서로 충돌로 잡힌다.`,
          );
        }
      }
    }

    // 쓰기 도구가 막힌 에이전트가 경로를 소유하면 모순이다.
    const writeBlocked = WRITE_TOOLS.every((t) => disallowed.includes(t));
    if (writeBlocked && !isNone) {
      report.error(
        file,
        2,
        "agent/owns-readonly",
        `쓰기 도구가 전부 막혀 있는데 owns 에 경로가 있다: ${ownsList.join(", ")}. 읽기 전용이면 \`none\` 으로 적어라.`,
      );
    }
    if (!writeBlocked && isNone) {
      report.warn(
        file,
        2,
        "agent/owns-none-writable",
        "owns 가 none 인데 쓰기 도구가 열려 있다. 어디에 쓰는지 선언하거나 쓰기 도구를 막아라.",
      );
    }
  }

  // 8. 본문 7섹션 — 존재·순서·내용
  const sections = extractSections(body, bodyOffset).filter(
    (s) => s.level === 2,
  );
  const headings = sections.map((s) => s.heading);

  for (const required of AGENT_REQUIRED_SECTIONS) {
    if (!headings.includes(required)) {
      report.error(
        file,
        null,
        "agent/section-missing",
        `필수 섹션 \`## ${required}\` 이 없다.`,
      );
    }
  }

  const presentRequired = headings.filter((h) =>
    AGENT_REQUIRED_SECTIONS.includes(h),
  );
  const expectedOrder = AGENT_REQUIRED_SECTIONS.filter((h) =>
    presentRequired.includes(h),
  );
  if (presentRequired.join("|") !== expectedOrder.join("|")) {
    report.error(
      file,
      null,
      "agent/section-order",
      `섹션 순서가 규약과 다르다. 규약 순서: ${AGENT_REQUIRED_SECTIONS.join(" → ")}`,
    );
  }

  for (const section of sections) {
    if (
      AGENT_REQUIRED_SECTIONS.includes(section.heading) &&
      isSectionEmpty(section)
    ) {
      report.error(
        file,
        section.line,
        "agent/section-empty",
        `\`## ${section.heading}\` 이 비었다. 빈 섹션은 규약을 지킨 것이 아니다.`,
      );
    }
  }

  // 9. 품질 자체 검증 섹션은 실행 가능한 명령을 담아야 한다.
  //    이유: "확인한다" 같은 문장은 검증이 아니다. 무엇을 돌려 어떤 값이 나오는지가 있어야 판정이 가능하다.
  const selfCheck = sections.find((s) => s.heading === "품질 자체 검증");
  if (selfCheck && !isSectionEmpty(selfCheck)) {
    const text = selfCheck.contentLines.join("\n");
    const hasCommand =
      /`[^`]*(pnpm|node|npx|tsc|eslint|vitest|jest|playwright|git)[^`]*`/.test(
        text,
      ) || /```/.test(text);
    if (!hasCommand) {
      report.error(
        file,
        selfCheck.line,
        "agent/self-check-not-executable",
        "`## 품질 자체 검증` 에 실행 가능한 명령이 없다. 백틱으로 감싼 명령이나 코드블록으로 적어라.",
      );
    }
  }
}

/** `owns` 값을 경로 배열로 정규화한다. `none` 은 빈 배열. */
function parseOwns(value) {
  const list = toList(value);
  if (list.length === 1 && list[0] === OWNS_NONE) return [];
  return list;
}

/** 두 경로가 겹치는지 본다. 같거나, 한쪽이 다른 쪽의 하위 경로면 겹친다. */
function pathsOverlap(a, b) {
  if (a === b) return true;
  const norm = (p) => (p.endsWith("/") ? p : p + "/");
  return norm(a).startsWith(norm(b)) || norm(b).startsWith(norm(a));
}

/**
 * 소유 경로가 겹치는 에이전트 쌍을 찾는다.
 *
 * 이 검사가 병렬 안전성의 핵심이다. 두 에이전트가 같은 경로를 쓰면 나중에 쓴 쪽이
 * 앞선 쪽을 조용히 지우고, 그 손실은 어디에도 기록되지 않는다.
 * 지금까지 이 판정은 정의 본문의 자연어를 사람이 눈으로 비교하는 데 의존했다.
 */
function checkOwnershipConflicts(targets, report) {
  const owned = [];

  for (const file of targets) {
    let fm;
    try {
      fm = readMarkdown(file).frontmatter;
    } catch {
      continue;
    }
    if (!fm?.owns) continue;
    for (const p of parseOwns(fm.owns)) {
      owned.push({ file, name: fm.name ?? basename(file, ".md"), path: p });
    }
  }

  for (let i = 0; i < owned.length; i++) {
    for (let j = i + 1; j < owned.length; j++) {
      const a = owned[i];
      const b = owned[j];
      if (a.name === b.name) continue;
      if (OWNS_SHARED_EXEMPT.some((e) => pathsOverlap(a.path, e))) continue;
      if (!pathsOverlap(a.path, b.path)) continue;

      const detail =
        a.path === b.path
          ? `둘 다 \`${a.path}\` 를 소유한다`
          : `\`${a.path}\` 와 \`${b.path}\` 가 겹친다`;
      report.error(
        a.file,
        2,
        "agent/owns-conflict",
        `${b.name} 과 소유 경로가 충돌한다 — ${detail}. 병렬 실행에서 나중에 쓴 쪽이 앞선 쪽을 조용히 지운다.`,
      );
      report.error(
        b.file,
        2,
        "agent/owns-conflict",
        `${a.name} 과 소유 경로가 충돌한다 — ${detail}. 병렬 실행에서 나중에 쓴 쪽이 앞선 쪽을 조용히 지운다.`,
      );
    }
  }
}

/**
 * 여러 디렉터리에 같은 `name` 이 있는지 본다.
 *
 * 이유: 에이전트 `name` 은 전역 네임스페이스다. 코어와 프로젝트에 같은 이름이 있으면
 * 어느 쪽이 로드될지 예측할 수 없고, 사람은 자기가 고친 파일이 실행된다고 믿는다.
 * 파일 단위 검사로는 원리적으로 보이지 않으므로 전체를 모아서 판정한다.
 */
function checkDuplicateNames(targets, report) {
  const byName = new Map();

  for (const file of targets) {
    let name;
    try {
      name = readMarkdown(file).frontmatter?.name;
    } catch {
      continue;
    }
    if (!name) continue;
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(file);
  }

  for (const [name, files] of byName) {
    if (files.length < 2) continue;
    for (const file of files) {
      const others = files.filter((f) => f !== file);
      report.error(
        file,
        2,
        "agent/name-duplicate",
        `name \`${name}\` 이 다른 파일과 겹친다: ${others.join(", ")}. 에이전트 이름은 전역이라 어느 쪽이 로드될지 예측할 수 없다.`,
      );
    }
  }
}

function main() {
  const targets = collectTargets(process.argv.slice(2));
  const report = new Report("에이전트 검증");

  if (targets.length === 0) {
    console.log(
      "검사할 에이전트 파일이 없다. (agents/ 디렉터리가 비었거나 존재하지 않는다)",
    );
    return 0;
  }

  for (const file of targets) validateAgent(file, report);
  checkDuplicateNames(targets, report);
  checkOwnershipConflicts(targets, report);
  return report.print();
}

process.exit(main());
