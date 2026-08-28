#!/usr/bin/env node
/**
 * Stop 훅 — 턴을 마치기 전에 핸드오프 계약을 점검한다.
 *
 * `.curvez/handoff/` 가 없으면 아무것도 하지 않는다(curvez 를 쓰지 않는 프로젝트).
 *
 * 이유: 검증 없는 `done` 은 수신 에이전트가 그것을 믿고 자기 작업을 시작하는 순간
 * 오염이 팀 전체로 퍼진다. 다음 라운드가 시작되기 전, 즉 턴이 끝나는 지점이
 * 이것을 잡을 마지막 기회다.
 *
 * 차단하지 않는다. 턴 종료를 막아도 이미 쓰인 파일은 그대로이고, 사용자가
 * 매번 막히면 훅을 꺼버린다. 경고로 남겨 다음 턴에 고치게 한다.
 */

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");

const handoffDir = join(process.cwd(), ".curvez", "handoff");
if (!existsSync(handoffDir)) process.exit(0);

const result = spawnSync(
  process.execPath,
  [join(PLUGIN_ROOT, "scripts", "validate-handoff.mjs"), handoffDir],
  { encoding: "utf8" },
);

if (result.status === 0) process.exit(0);

const out = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
process.stderr.write(
  `curvez 핸드오프 검증 실패 — 계약을 어긴 핸드오프가 남아 있다.\n${out}\n` +
    `\`status: done\` 인데 \`verification\` 이 비었다면, 검증을 실제로 돌려 채우거나 status 를 partial 로 낮춰라.\n`,
);
process.exit(0);
