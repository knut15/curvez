#!/usr/bin/env node
/**
 * 스킬 스캐폴더.
 *
 * 사용법:
 *   node new-skill.mjs <name> [옵션]
 *
 * 옵션:
 *   --dir <경로>          출력 루트 (기본: 현재 프로젝트의 .claude/skills)
 *   --with-references     references/ 디렉터리와 예시 참조 파일을 함께 만든다
 *   --force               기존 파일을 덮어쓴다
 *
 * 뼈대의 TODO 를 채우지 않으면 validate-skills.mjs 가 실패한다. 의도된 동작이다.
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

function parseArgs(argv) {
  const opts = { withReferences: false, force: false, dir: null, name: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir") opts.dir = argv[++i];
    else if (arg === "--with-references") opts.withReferences = true;
    else if (arg === "--force") opts.force = true;
    else if (!arg.startsWith("--") && !opts.name) opts.name = arg;
  }
  return opts;
}

function skillTemplate({ name, withReferences }) {
  const refSection = withReferences
    ? `
## 도메인 분기

대상 스택에 따라 아래를 읽는다. 본문에는 모든 분기에 공통인 것만 둔다.

- Next.js: [references/nextjs.md](references/nextjs.md)
- React Native: [references/react-native.md](references/react-native.md)
`
    : "";

  return `---
name: ${name}
description: <!-- TODO: 무엇을 하는지 한 문장 + 호출 트리거. 사용자가 실제로 말할 표현을 따옴표로 3개 이상 넣어라. 한글과 영어를 함께. 예) "리뷰해줘", "review this", "/${name}" -->
---

## 언제 이 스킬을 쓰는가

- <!-- TODO: 이 스킬이 담당하는 상황. 동사로 시작하라. -->

## 언제 쓰지 않는가

- <!-- TODO: 인접 스킬과 헷갈릴 지점을 직접 지목하라. "X 라면 <다른 스킬> 을 쓴다" 형태로. -->

**이유:** <!-- TODO: 경계를 이렇게 그은 근거. 경계가 흐리면 엉뚱한 상황에서 호출된다. -->

## 절차

1. <!-- TODO: 첫 단계. 무엇을 하고 무엇으로 끝났다고 판정하는가. -->
2. <!-- TODO -->
3. <!-- TODO -->

## 규칙

- <!-- TODO: 지켜야 할 것. 금지 규칙에는 반드시 \`이유:\` 를 붙여라. -->

**이유:** <!-- TODO -->

## 완료 기준

- [ ] <!-- TODO: 판정 가능한 조건. 실제로 돌린 명령과 나온 수치로 적어라. -->
${refSection}`;
}

function referenceTemplate(title) {
  return `# ${title}

<!-- TODO: 이 파일은 SKILL.md 본문에서 포인터로만 도달한다.
     조건부 상세·도메인 분기·긴 예시를 여기에 둔다.
     본문에 두면 모든 실행에서 읽히며 주의를 소모한다. -->
`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.name) {
    console.error("사용법: node new-skill.mjs <name> [--dir <경로>] [--with-references] [--force]");
    return 2;
  }
  if (!/^[a-z][a-z0-9-]*$/.test(opts.name)) {
    console.error(`name \`${opts.name}\` 이 규칙에 맞지 않는다. 소문자 kebab-case 로 적어라.`);
    return 2;
  }

  const root = resolve(opts.dir ?? join(process.cwd(), ".claude", "skills"));
  const skillDir = join(root, opts.name);
  const skillFile = join(skillDir, "SKILL.md");

  if (existsSync(skillFile) && !opts.force) {
    console.error(`이미 존재한다: ${skillFile}\n덮어쓰려면 --force 를 붙여라.`);
    return 1;
  }

  mkdirSync(skillDir, { recursive: true });
  writeFileSync(skillFile, skillTemplate(opts), "utf8");
  console.log(`생성: ${skillFile}`);

  if (opts.withReferences) {
    const refDir = join(skillDir, "references");
    mkdirSync(refDir, { recursive: true });
    for (const [file, title] of [
      ["nextjs.md", "Next.js 분기"],
      ["react-native.md", "React Native 분기"],
    ]) {
      const p = join(refDir, file);
      if (!existsSync(p) || opts.force) {
        writeFileSync(p, referenceTemplate(title), "utf8");
        console.log(`생성: ${p}`);
      }
    }
  }

  console.log(`다음: TODO 를 전부 채운 뒤 \`node ${join("scripts", "validate-skills.mjs")} ${skillDir}\` 로 검증하라.`);
  return 0;
}

process.exit(main());
