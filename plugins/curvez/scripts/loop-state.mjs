#!/usr/bin/env node
/**
 * 게이트 루프 상태 기록기와 판정기 — `.curvez/loop.json` 을 쓰고, 계속·통과·멈춤을 판정한다.
 *
 * 사용법:
 *   node loop-state.mjs init --plan "<승인받은 루프 계획 한 줄>" [--dir <프로젝트 루트>]
 *   node loop-state.mjs record --gate <quality-gate --json 출력 파일> [--dir ...]
 *   node loop-state.mjs resume [--dir ...]            세션이 바뀌어 이어 갈 때 먼저 부른다
 *   node loop-state.mjs stop --reason "<이유>" [--dir ...]   사람이 멈추라고 했을 때
 *   node loop-state.mjs status [--dir ...]
 *
 * `curvez:gate-loop` 스킬의 판정을 코드로 옮긴 것이다. 스킬이 절차의 정본이고, 상한 값은
 * `lib/spec.mjs` 의 `LOOP_*` 가 정본이다.
 *
 * 판정을 모델이 아니라 스크립트가 하는 이유: 계속할지 멈출지는 반복 횟수·시간·실패 결과로
 * 답할 수 있는 질문이다. 모델이 판정하면 "한 번만 더" 가 끝없이 이어지고, 상한을 넘겨도
 * 그 사실이 기록에 남지 않는다.
 *
 * 모든 명령은 판정 결과를 JSON 한 줄로 출력한다.
 * exit code: 0 = 판정을 냈다(계속·통과·멈춤 모두), 2 = 입력이 잘못됐다(파일 없음, 루프 없음 등).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  LOOP_MAX_FIX,
  LOOP_MAX_MINUTES,
  LOOP_NO_PROGRESS,
} from "./lib/spec.mjs";

const argv = process.argv.slice(2);
const cmd = argv[0];
const arg = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? undefined : argv[i + 1];
};
const ROOT = resolve(arg("--dir") ?? process.cwd());
const STATE = join(ROOT, ".curvez", "loop.json");
const now = () => Date.now();

function fail(msg) {
  console.log(JSON.stringify({ error: msg }));
  process.exit(2);
}

function load() {
  if (!existsSync(STATE))
    fail(`${STATE} 가 없다. init 으로 루프를 먼저 시작한다`);
  return JSON.parse(readFileSync(STATE, "utf8"));
}

function save(s) {
  mkdirSync(join(ROOT, ".curvez"), { recursive: true });
  writeFileSync(STATE, JSON.stringify(s, null, 2) + "\n");
}

const limits = () => ({
  maxFix: LOOP_MAX_FIX,
  maxMinutes: LOOP_MAX_MINUTES,
  noProgress: LOOP_NO_PROGRESS,
});

// 경과 시간은 루프가 실제로 돈 시간만 센다. 세션 사이 공백(밤사이 등)은 resume 이 잘라 낸다.
// 이유: 시계 시간으로 재면 다음 날 이어 갈 때 시작하자마자 시간 상한에 닿는다
function tickElapsed(s) {
  const t = now();
  s.elapsedMs += Math.max(0, t - s.lastAt);
  s.lastAt = t;
}

function summary(s, extra = {}) {
  const fixes = Math.max(0, s.iterations.length - 1);
  return {
    status: s.status,
    reason: s.reason ?? null,
    iteration: s.iterations.length,
    fixesUsed: fixes,
    fixesLeft: Math.max(0, s.limits.maxFix - fixes),
    minutesUsed: Math.floor(s.elapsedMs / 60_000),
    minutesLeft: Math.max(
      0,
      s.limits.maxMinutes - Math.floor(s.elapsedMs / 60_000),
    ),
    ...extra,
  };
}

// 게이트 결과 하나를 한 줄 서명으로 만든다. 같은 실패가 반복되는지 비교하는 데 쓴다
function signature(gate) {
  return (gate.verification ?? [])
    .filter((v) => !v.passed)
    .map((v) => `${v.command} => ${v.result}`)
    .sort()
    .join("\n");
}

function judge(s, gate) {
  if (gate.blocked)
    return { status: "stopped", reason: `blocked: ${gate.blocked}` };
  const zero = (gate.verification ?? []).find((v) =>
    /테스트 0개 실행/.test(v.result ?? ""),
  );
  if (zero) return { status: "stopped", reason: `blocked: ${zero.result}` };
  if (gate.ok) {
    // test 가 돌지 않은 통과는 통과가 아니다. 안 돌린 게이트를 통과로 적지 않는다(quality-gate 원칙)
    const testNotRun = (gate.notRun ?? []).some((n) => n.gate === "test");
    if (testNotRun)
      return {
        status: "stopped",
        reason:
          "blocked: test 게이트가 돌지 않았다. profile.json 의 commands.test 를 확인한다",
      };
    return { status: "passed", reason: null };
  }
  const fixes = s.iterations.length - 1;
  if (fixes >= s.limits.maxFix)
    return { status: "stopped", reason: `max-fix: 수정 ${fixes}회에 닿았다` };
  if (s.elapsedMs >= s.limits.maxMinutes * 60_000) {
    return {
      status: "stopped",
      reason: `time: ${Math.floor(s.elapsedMs / 60_000)}분이 상한 ${s.limits.maxMinutes}분에 닿았다`,
    };
  }
  const last = s.iterations.slice(-s.limits.noProgress).map((i) => i.signature);
  if (last.length === s.limits.noProgress && last.every((x) => x === last[0])) {
    return {
      status: "stopped",
      reason: `no-progress: 같은 실패가 ${s.limits.noProgress}번 연속 나왔다`,
    };
  }
  return { status: "running", reason: null };
}

if (cmd === "init") {
  const plan = arg("--plan");
  if (!plan)
    fail("--plan 이 필요하다. 사용자가 승인한 루프 계획을 한 줄로 적는다");
  if (existsSync(STATE) && load().status === "running") {
    fail(
      "이미 도는 루프가 있다. 이어 가려면 resume, 끝내려면 사람의 지시를 받아 stop 을 부른다",
    );
  }
  const t = now();
  const s = {
    version: 1,
    plan,
    approvedAt: new Date(t).toISOString(),
    limits: limits(),
    status: "running",
    reason: null,
    elapsedMs: 0,
    lastAt: t,
    iterations: [],
  };
  save(s);
  console.log(JSON.stringify(summary(s, { limits: s.limits })));
} else if (cmd === "record") {
  const file = arg("--gate");
  if (!file || !existsSync(file))
    fail("--gate 에 quality-gate --json 출력 파일을 준다");
  const s = load();
  if (s.status !== "running")
    fail(`루프가 이미 끝났다 (${s.status}: ${s.reason ?? ""})`);
  let gate;
  try {
    gate = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    fail(
      `${file} 가 JSON 이 아니다. quality-gate.mjs --json 의 출력을 그대로 저장한다`,
    );
  }
  tickElapsed(s);
  const failed = (gate.verification ?? [])
    .filter((v) => !v.passed)
    .map((v) => ({ command: v.command, result: v.result }));
  s.iterations.push({
    at: new Date(now()).toISOString(),
    ok: gate.ok === true,
    failed,
    signature: signature(gate),
  });
  const v = judge(s, gate);
  s.status = v.status;
  s.reason = v.reason;
  save(s);
  console.log(
    JSON.stringify(
      summary(s, {
        verdict:
          v.status === "running"
            ? "continue"
            : v.status === "passed"
              ? "pass"
              : "stop",
        failed,
      }),
    ),
  );
} else if (cmd === "resume") {
  const s = load();
  s.lastAt = now(); // 세션 사이 공백은 세지 않는다
  save(s);
  console.log(JSON.stringify(summary(s, { plan: s.plan })));
} else if (cmd === "stop") {
  const reason = arg("--reason");
  if (!reason) fail("--reason 이 필요하다");
  const s = load();
  tickElapsed(s);
  s.status = "stopped";
  s.reason = `user: ${reason}`;
  save(s);
  console.log(JSON.stringify(summary(s)));
} else if (cmd === "status") {
  const s = load();
  console.log(
    JSON.stringify(
      summary(s, {
        plan: s.plan,
        limits: s.limits,
        last: s.iterations.at(-1)?.failed ?? [],
      }),
    ),
  );
} else {
  fail("명령: init | record | resume | stop | status");
}
