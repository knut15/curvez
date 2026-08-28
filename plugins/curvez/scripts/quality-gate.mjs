#!/usr/bin/env node
/**
 * 품질 게이트 실행기 — 프로파일의 commands 를 실제로 돌려 결과를 수치로 낸다.
 *
 * 사용법:
 *   node quality-gate.mjs [--dir <프로젝트 루트>] [--json] [--only <게이트,...>] [--no-stop]
 *
 *   --json     verification[] 형태로 출력한다. 핸드오프에 그대로 넣을 수 있다
 *   --only     특정 게이트만 돌린다 (arch,typecheck,lint,test,build)
 *   --no-stop  앞 게이트가 실패해도 뒤를 계속 돌린다
 *
 * `curvez:quality-gate` 스킬의 절차를 그대로 옮긴 것이다. 스킬이 절차의 정본이다.
 *
 * 설계 원칙 셋:
 *   1. 명령을 하드코딩하지 않는다. `.curvez/profile.json` 의 `commands` 에서 읽는다
 *   2. 안 돌린 게이트는 verification 항목을 만들지 않는다 — 안 돌린 것을 통과로 적으면 안 된다
 *   3. "얼마나 검사했는가" 를 함께 낸다 — 검사 못 함과 위반 없음이 구분돼야 한다
 *
 * exit code: 0 = 전 게이트 통과, 1 = 하나 이상 실패, 2 = 진행 불가(프로파일 없음 등).
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const opt = {
  dir: process.cwd(),
  json: argv.includes("--json"),
  noStop: argv.includes("--no-stop"),
  only: null,
};
for (const [flag, key] of [
  ["--dir", "dir"],
  ["--only", "only"],
]) {
  const i = argv.indexOf(flag);
  if (i !== -1) {
    if (!argv[i + 1]) {
      console.error(`${flag} 다음에 값이 필요하다.`);
      process.exit(2);
    }
    opt[key] =
      key === "dir"
        ? resolve(argv[i + 1])
        : argv[i + 1].split(",").map((s) => s.trim());
  }
}

const ROOT = opt.dir;
const PROFILE = join(ROOT, ".curvez", "profile.json");
const ARCH = join(ROOT, ".curvez", "architecture.md");

/**
 * 실행 순서 — 빠르고 실패를 많이 잡는 것부터.
 *
 * arch 가 1번인 이유: grep 몇 초로 끝나는데, 경계 위반의 수정은 *파일을 옮기는 일*이라
 * 뒤 게이트 결과를 전부 무효로 만든다.
 */
const ORDER = ["arch", "typecheck", "lint", "test", "build"];

const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};

/** 셸을 거치되 현재 프로세스에 영향을 주지 않게 서브셸로 격리한다. */
function runCommand(cmd, cwd) {
  // `( ... )` 로 감싸는 이유: commands 값에 `cd` 나 `exit` 가 섞이면
  // 러너 자체가 죽거나 cwd 가 옮겨져 이후 게이트가 엉뚱한 곳에서 돈다.
  const r = spawnSync("bash", ["-c", `( ${cmd} )`], {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    status: r.status ?? -1,
    out: [r.stdout ?? "", r.stderr ?? ""].join("\n"),
  };
}

/** 출력에서 판정 가능한 수치를 뽑는다. 못 뽑으면 마지막 비어 있지 않은 줄. */
function summarize(out) {
  const pats = [
    /(\d+)\s+(?:errors?|problems?)/i,
    /(\d+)\s+passed[^\n]*?(\d+)\s+failed/i,
    /(\d+)\s+failed[^\n]*?(\d+)\s+passed/i,
    /Tests?:\s*[^\n]*/i,
    /Test Files\s+[^\n]*/i,
    /(\d+)\s+(?:tests?|specs?)\s+(?:passed|completed)/i,
  ];
  for (const re of pats) {
    const m = out.match(re);
    if (m) return m[0].trim().replace(/\s+/g, " ").slice(0, 120);
  }
  // 수치를 못 뽑았다. 마지막 의미 있는 줄을 쓰되, 명령 에코(`$ tsc --noEmit`)만 남은 경우를 걸러낸다.
  // tsc·eslint 는 성공 시 출력이 없어서, 에코를 결과로 적으면 "무엇이 나왔는지" 가 사라진다.
  const lines = out
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^\$\s/.test(l) && !/^>\s/.test(l));
  return lines.length
    ? lines[lines.length - 1].slice(0, 120)
    : "출력 없음 (성공 시 무출력인 도구)";
}

/**
 * 테스트가 0개 실행됐는지 본다.
 *
 * 0개 실행은 exit 0 이라 초록불과 구분되지 않는다. 경로 오타나 glob 불일치로
 * 스위트가 통째로 비어도 "실패 없음" 으로 보인다.
 * 숫자 경계가 필요한 이유: `0 passed` 패턴은 경계 없이 `10 passed` 에 걸린다.
 */
function looksZeroRun(out) {
  return (
    /no tests? (found|to run)/i.test(out) ||
    /(^|[^0-9])0 (tests?|passed)/i.test(out) ||
    /Tests?: *0( |$)/i.test(out) ||
    /Test Files\s+0 passed/i.test(out)
  );
}

// ── 게이트 1: 아키텍처 경계 ──────────────────────────────────────────
/**
 * `.curvez/architecture.md` 의 `## 금지 import` 표를 파싱해 위반을 센다.
 *
 * 표 행 형식: `| ARCH-001 | 검사 경로 | 금지 패턴(ERE) | 이유 |`
 * 3번째 필드가 패턴이다. 표 안에서 `|` 는 `\|` 로 이스케이프돼 있으므로 되돌려야 한다.
 * 되돌리지 않으면 정규식이 리터럴 백슬래시를 포함해 **전 규칙이 0건**으로 나온다 —
 * 파싱 실패가 "깨끗함" 으로 위장된다.
 */
function gateArch() {
  if (!existsSync(ARCH)) {
    return { skipped: true, reason: ".curvez/architecture.md 가 없다" };
  }

  const lines = readFileSync(ARCH, "utf8").split("\n");
  const rules = [];
  for (const line of lines) {
    if (!/^\|\s*ARCH-\d{3}\s*\|/.test(line)) continue;
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split(" | ")
      .map((c) => c.trim());
    if (cells.length < 3) continue;
    rules.push({
      id: cells[0],
      path: cells[1],
      pattern: cells[2].replace(/\\\|/g, "|"),
    });
  }

  if (rules.length === 0) {
    // 규칙 0개는 "위반 없음" 이 아니라 "검사 못 함" 이다. 반드시 구분한다.
    return {
      parsed: 0,
      violations: 0,
      unparsed: true,
      detail: "`## 금지 import` 표에서 규칙을 하나도 읽지 못했다",
    };
  }

  let total = 0;
  const hits = [];
  const unchecked = [];

  for (const rule of rules) {
    // 검사 경로에 공백이 있으면 zsh 에서 단어 분리가 안 돼 0건이 된다. 규칙 하나에 경로 하나가 원칙이다.
    const target = join(ROOT, rule.path.trim());
    if (!existsSync(target)) {
      unchecked.push(`${rule.id}(${rule.path})`);
      continue;
    }
    const r = spawnSync("grep", ["-rInE", rule.pattern, target], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
    const n = (r.stdout ?? "").split("\n").filter((l) => l.trim()).length;
    if (n > 0) {
      total += n;
      hits.push(`${rule.id} ${n}건`);
    }
  }

  return { parsed: rules.length, violations: total, hits, unchecked };
}

// ── main ────────────────────────────────────────────────────────────
function main() {
  const profile = readJson(PROFILE);
  if (!profile) {
    const msg = `.curvez/profile.json 이 없다. curvez:bootstrap 을 먼저 실행하라.`;
    if (opt.json)
      console.log(JSON.stringify({ ok: false, blocked: msg }, null, 2));
    else console.error(`BLOCKED: ${msg}`);
    return 2;
  }

  const commands = profile.commands ?? {};
  const verification = [];
  const notRun = [];
  let failed = 0;
  let stopped = null;

  for (const gate of ORDER) {
    if (opt.only && !opt.only.includes(gate)) continue;

    // 앞 게이트가 실패하면 뒤를 돌리지 않는다.
    // 타입이 깨진 상태의 테스트 실패는 컴파일 오류이지 결함 신호가 아니다.
    if (stopped && !opt.noStop) {
      notRun.push({ gate, why: `${stopped} 실패로 중단` });
      continue;
    }

    if (gate === "arch") {
      const a = gateArch();
      if (a.skipped) {
        notRun.push({ gate, why: a.reason });
        continue;
      }
      if (a.unparsed) {
        verification.push({
          command: "arch: `## 금지 import` 표 파싱",
          result: `규칙 0개 파싱 — ${a.detail}`,
          passed: false,
        });
        failed += 1;
        stopped = "arch";
        continue;
      }
      // 검사 경로가 하나도 없으면 "위반 없음" 이 아니라 "검사 못 함" 이다.
      // 아키텍처가 확정됐는데 소스 트리가 아직 그 구조가 아니면 전 규칙이 헛돈다.
      // 이때 PASS 를 내면 경계 검사가 통째로 무력한 채로 라운드가 done 으로 닫힌다.
      const checked = a.parsed - a.unchecked.length;
      const parts = [
        `규칙 ${a.parsed}개 파싱`,
        `검사 ${checked}개`,
        `위반 ${a.violations}건`,
      ];
      if (a.hits.length) parts.push(a.hits.join(", "));
      if (a.unchecked.length)
        parts.push(`경로 없음: ${a.unchecked.join(", ")}`);

      let ok = a.violations === 0;
      if (checked === 0) {
        ok = false;
        parts.push(
          "검사한 규칙이 0개다 — 위반 없음이 아니라 검사 못 함이다. 소스 트리가 아키텍처 구조와 맞는지 확인하라",
        );
      }
      verification.push({
        command: "arch: ARCH-NNN 규칙 검사",
        result: parts.join(" / "),
        passed: ok,
      });
      if (!ok) {
        failed += 1;
        stopped = "arch";
      }
      continue;
    }

    const cmd = commands[gate];
    if (!cmd) {
      // 없는 키는 "검사 없음" 이다. 값이 없다고 추정 실행하지 않는다.
      notRun.push({ gate, why: `profile.json 의 commands 에 ${gate} 가 없다` });
      continue;
    }

    const r = runCommand(cmd, ROOT);
    let result = summarize(r.out);
    let ok = r.status === 0;

    if (gate === "test" && ok && looksZeroRun(r.out)) {
      ok = false;
      result = `테스트 0개 실행 — ${result}. exit 0 이지만 통과 근거가 아니다`;
    }

    verification.push({ command: cmd, result, passed: ok });
    if (!ok) {
      failed += 1;
      stopped ??= gate;
    }
  }

  if (opt.json) {
    console.log(
      JSON.stringify({ ok: failed === 0, verification, notRun }, null, 2),
    );
    return failed === 0 ? 0 : 1;
  }

  for (const v of verification) {
    console.log(`${v.passed ? "PASS" : "FAIL"}  ${v.command}`);
    console.log(`      ${v.result}`);
  }
  for (const n of notRun) {
    console.log(`SKIP  ${n.gate} — ${n.why}`);
  }

  console.log(
    failed === 0
      ? `\nquality-gate 통과 — ${verification.length}개 게이트 실행, 실패 0건${notRun.length ? `, ${notRun.length}개 미실행` : ""}`
      : `\nquality-gate 실패 — ${failed}/${verification.length}개 게이트 실패${notRun.length ? `, ${notRun.length}개 미실행` : ""}`,
  );
  if (notRun.length) {
    console.log(
      "미실행 게이트는 verification 에 항목을 만들지 않는다. 안 돌린 것을 통과로 적지 마라.",
    );
  }
  return failed === 0 ? 0 : 1;
}

process.exit(main());
