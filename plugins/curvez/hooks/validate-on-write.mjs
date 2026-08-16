#!/usr/bin/env node
/**
 * PostToolUse(Write|Edit) 훅.
 *
 * 방금 고친 파일이 에이전트 정의나 스킬이면 해당 검증기를 즉시 돌린다.
 *
 * 이유: 규약 위반은 쓰는 시점에 알려줘야 고쳐진다. 나중에 doctor 로 한꺼번에 잡으면
 * 어느 편집이 원인이었는지 되짚어야 하고, 그 사이에 위반된 정의가 팀 실행에 투입될 수 있다.
 *
 * 이 훅은 **차단하지 않는다**(exit 2 를 쓰지 않는다). 편집을 되돌릴 수단이 없는 시점이라
 * 차단해도 파일은 이미 바뀐 뒤다. 대신 stderr 로 결과를 알려 다음 턴에 고치게 한다.
 */

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");

function readInput() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    process.exit(0);
  }
}

const input = readInput();
const filePath = input?.tool_input?.file_path;
if (typeof filePath !== "string" || !filePath.endsWith(".md")) process.exit(0);

/** 어떤 검증기를 어떤 인자로 돌릴지 정한다. 대상이 아니면 null. */
function pickValidator(p) {
  if (/[/\\]agents[/\\][^/\\]+\.md$/.test(p)) {
    return { script: "validate-agents.mjs", target: p, label: "에이전트" };
  }
  if (/[/\\]skills[/\\]/.test(p)) {
    // SKILL.md 든 references/*.md 든 스킬 디렉터리 단위로 검사한다.
    const m = p.match(/^(.*[/\\]skills[/\\][^/\\]+)[/\\]/);
    if (m) return { script: "validate-skills.mjs", target: m[1], label: "스킬" };
  }
  return null;
}

const pick = pickValidator(filePath);
if (!pick) process.exit(0);

const result = spawnSync(
  process.execPath,
  [join(PLUGIN_ROOT, "scripts", pick.script), pick.target],
  { encoding: "utf8" }
);

if (result.status === 0) process.exit(0);

const out = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
process.stderr.write(
  `curvez ${pick.label} 검증 실패 — 방금 편집한 파일이 규약을 어긴다.\n${out}\n` +
    `위 오류를 고친 뒤 다음 명령으로 재확인하라:\n` +
    `  node "$CLAUDE_PLUGIN_ROOT/scripts/${pick.script}" ${pick.target}\n`
);
process.exit(0);
