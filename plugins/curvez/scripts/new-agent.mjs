#!/usr/bin/env node
/**
 * 에이전트 스캐폴더.
 *
 * 사용법:
 *   node new-agent.mjs <name> [옵션]
 *
 * 옵션:
 *   --dir <경로>      출력 디렉터리 (기본: 현재 프로젝트의 .claude/agents)
 *   --model <값>      opus | sonnet | haiku | inherit (기본: sonnet)
 *   --readonly        쓰기 도구를 disallowedTools 에 넣는다 (리뷰·조사 계열)
 *   --force           기존 파일을 덮어쓴다
 *
 * 뼈대는 채워 넣을 자리를 `<!-- TODO: ... -->` 로 남긴다.
 * validate-agents.mjs 는 빈 섹션을 오류로 잡으므로, TODO 를 지우지 않고 두면 검증이 통과하지 않는다.
 * 이것이 의도다: 뼈대만 만들고 방치한 에이전트가 팀에 투입되면 계약이 비어 있는 채로 실행된다.
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { ALLOWED_MODELS, WRITE_TOOLS } from "./lib/spec.mjs";

function parseArgs(argv) {
  const opts = { model: "sonnet", readonly: false, force: false, dir: null, name: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir") opts.dir = argv[++i];
    else if (arg === "--model") opts.model = argv[++i];
    else if (arg === "--readonly") opts.readonly = true;
    else if (arg === "--force") opts.force = true;
    else if (!arg.startsWith("--") && !opts.name) opts.name = arg;
  }
  return opts;
}

function template({ name, model, readonly }) {
  const tools = readonly
    ? "Read, Grep, Glob, Bash, WebFetch, WebSearch"
    : "Read, Write, Edit, Grep, Glob, Bash";
  const disallowed = readonly ? WRITE_TOOLS.join(", ") : "none";

  return `---
name: ${name}
description: <!-- TODO: 이 에이전트를 언제 부르는지 한 문장. 한글 트리거와 영어 트리거를 함께 넣어라. 40자 이상. -->
tools: ${tools}
disallowedTools: ${disallowed}
model: ${model}
---

## 핵심 역할

<!-- TODO: 이 에이전트가 책임지는 단 하나의 것. 그리고 무엇을 하지 않는지. -->

**하지 않는 것:** <!-- TODO: 인접 에이전트에게 넘기는 범위. -->

## 판단 기준

<!-- TODO: 결정할 때 무엇을 보는가. 우선순위가 충돌할 때의 tie-break 규칙까지. -->

| 상황 | 판단 | 이유 |
|---|---|---|
| <!-- TODO --> | | |

## 입출력 프로토콜

**입력**

| 경로 | 필수 | 없을 때 |
|---|---|---|
| \`.curvez/profile.json\` | O | blocked 로 보고하고 중단 |
| <!-- TODO --> | | |

**출력**

\`.curvez/handoff/${name}.<timestamp>.json\` 에 핸드오프를 남긴다. 스키마는 \`agent-contract\` 스킬을 따른다.

<!-- TODO: 이 에이전트가 추가로 만드는 산출물의 경로와 형식. -->

## 팀 통신 프로토콜

| 누구에게 | 무엇을 | 언제 |
|---|---|---|
| <!-- TODO: 대상 에이전트 name --> | | |

## 에러 핸들링

| 상황 | 행동 |
|---|---|
| 입력이 계약을 어김 | \`status: blocked\`, \`blocked_on\` 에 어느 필드가 왜 부족한지 적는다 |
| 필요한 정보가 없음 | 추측으로 채우지 않는다. 질문을 \`blocked_on\` 에 남긴다 |
| 자기 작업이 실패 | \`status: partial\`, 어디까지 됐고 무엇이 실패했는지 \`verification\` 에 명령과 실제 출력으로 남긴다 |
| <!-- TODO: 이 에이전트 고유의 실패 --> | |

## 협업과 팀 내 위치

- **선행:** <!-- TODO -->
- **후행:** <!-- TODO -->
- **병렬:** <!-- TODO -->
- **파일 소유권:** <!-- TODO: 이 에이전트만 쓰는 경로. 겹치면 오케스트레이터가 순차 실행으로 강등한다. -->

## 품질 자체 검증

완료를 선언하기 전에 아래를 실제로 돌리고 결과 수치를 \`verification\` 에 적는다.

<!-- TODO: 아래 코드블록을 이 에이전트가 실제로 돌릴 명령으로 바꿔라. -->

\`\`\`bash
pnpm typecheck && pnpm lint
\`\`\`

- [ ] <!-- TODO: 통과 기준을 수치로. "오류 0건" 처럼 판정 가능하게. -->
`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.name) {
    console.error("사용법: node new-agent.mjs <name> [--dir <경로>] [--model <값>] [--readonly] [--force]");
    return 2;
  }
  if (!/^[a-z][a-z0-9-]*$/.test(opts.name)) {
    console.error(`name \`${opts.name}\` 이 규칙에 맞지 않는다. 소문자 kebab-case 로 적어라.`);
    return 2;
  }
  if (!ALLOWED_MODELS.includes(opts.model)) {
    console.error(`model \`${opts.model}\` 은 허용값이 아니다. 허용: ${ALLOWED_MODELS.join(", ")}`);
    return 2;
  }

  const outDir = resolve(opts.dir ?? join(process.cwd(), ".claude", "agents"));
  mkdirSync(outDir, { recursive: true });

  const outFile = join(outDir, `${opts.name}.md`);
  if (existsSync(outFile) && !opts.force) {
    console.error(`이미 존재한다: ${outFile}\n덮어쓰려면 --force 를 붙여라.`);
    return 1;
  }

  writeFileSync(outFile, template(opts), "utf8");
  console.log(`생성: ${outFile}`);
  console.log(`다음: TODO 를 전부 채운 뒤 \`node ${join("scripts", "validate-agents.mjs")} ${outFile}\` 로 검증하라.`);
  return 0;
}

process.exit(main());
