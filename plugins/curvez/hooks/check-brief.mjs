#!/usr/bin/env node
/**
 * PreToolUse(Agent|Task) 가드 — curvez 워커 지시서의 빈 칸.
 *
 * `subagent_type` 이 `curvez:` 로 시작하는 호출만 본다. 프롬프트에 지시서 칸
 * (spec.mjs 의 BRIEF_FIELDS)이 모두 있고 비어 있지 않은지 확인한다.
 * 칸의 뜻과 쓰는 법의 정본은 `skills/agent-contract/SKILL.md` 의 `## 지시서` 다.
 *
 * 왜 훅인가: 워커는 격리된 컨텍스트에서 돌고 중간에 되묻지 못한다. 칸이 빠진 지시서는
 * 워커가 조용히 추측으로 메우고, 그 추측은 핸드오프를 받은 뒤에야 드러난다. 문서 규칙은
 * 쓰는 시점에 작동하지 않으므로, 띄우기 직전에 기계로 막는다.
 *
 * 판정
 *   - 칸은 줄 맨 앞의 `칸이름:` 으로 시작하고, 다음 칸이 나오기 전까지가 값이다
 *   - 값이 비었으면 막는다
 *   - `없음: <이유>` 는 BRIEF_STRICT_FIELDS 가 아닌 칸에서만 허용한다. 이유가 비면 막는다
 *
 * exit 2 = 차단(stderr 가 모델에게 전달된다). exit 0 = 통과.
 */

import { readFileSync } from "node:fs";
import { BRIEF_FIELDS, BRIEF_STRICT_FIELDS } from "../scripts/lib/spec.mjs";

const SPAWN_TOOLS = ["Agent", "Task"];
const NONE = /^없음\s*:\s*(.*)$/s;

function readInput() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    process.exit(0);
  }
}

/** 프롬프트를 칸별 값으로 나눈다. 같은 칸이 두 번 나오면 뒤의 값을 이어 붙인다. */
function parseBrief(prompt) {
  const keyLine = new RegExp(`^(${BRIEF_FIELDS.join("|")})\\s*:\\s*(.*)$`);
  const values = {};
  let current = null;
  for (const line of prompt.split("\n")) {
    const m = line.match(keyLine);
    if (m) {
      current = m[1];
      values[current] = [values[current], m[2]].filter(Boolean).join("\n");
    } else if (current) {
      values[current] += `\n${line}`;
    }
  }
  return values;
}

/** 칸마다 문제를 찾는다. 문제가 없으면 빈 배열. */
function findProblems(prompt) {
  const values = parseBrief(prompt);
  const problems = [];
  for (const field of BRIEF_FIELDS) {
    const value = values[field]?.trim();
    if (value === undefined) {
      problems.push(`${field}: 칸이 없다`);
      continue;
    }
    if (!value) {
      problems.push(`${field}: 값이 비었다`);
      continue;
    }
    const none = value.match(NONE);
    if (!none) continue;
    if (BRIEF_STRICT_FIELDS.includes(field)) {
      problems.push(`${field}: \`없음\` 으로 비울 수 없는 칸이다`);
    } else if (!none[1].trim()) {
      problems.push(`${field}: \`없음:\` 뒤에 이유가 없다`);
    }
  }
  return problems;
}

const input = readInput();
if (!SPAWN_TOOLS.includes(input?.tool_name)) process.exit(0);

const { subagent_type: type, prompt } = input?.tool_input ?? {};
if (typeof type !== "string" || !type.startsWith("curvez:")) process.exit(0);

const problems = findProblems(typeof prompt === "string" ? prompt : "");
if (problems.length === 0) process.exit(0);

process.stderr.write(
  `curvez 지시서가 완성되지 않아 ${type} 을 띄우지 않았다.\n` +
    problems.map((p) => `  - ${p}`).join("\n") +
    `\n칸 목록과 쓰는 법은 skills/agent-contract/SKILL.md 의 \`## 지시서\` 를 따른다.\n` +
    `모든 칸을 채운 뒤 다시 띄운다. ${BRIEF_STRICT_FIELDS.join("·")} 가 아닌 칸은 \`없음: <이유>\` 로 비울 수 있다.\n`,
);
process.exit(2);
