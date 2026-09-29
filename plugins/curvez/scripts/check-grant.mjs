#!/usr/bin/env node
/**
 * 자율 권한 판정기.
 *
 * 사용법 (저장소 루트에서):
 *   node check-grant.mjs --stage team  --target <머지 대상 브랜치>
 *   node check-grant.mjs --stage merge --target <머지 대상 브랜치> --base <비교 기준 ref>
 *
 * team  — `.curvez/grant.md` 가 유효하고 대상이 같으면 exit 0. 오케스트레이터가 팀 구성 승인을 건너뛸 때 쓴다.
 * merge — team 조건에 더해, `--base...HEAD` diff 에 멈춤 경로(GRANT_STOP_PATTERNS)가 없고,
 *         분기점 이후의 핸드오프에 머지 증거(아래)가 모두 있으면 exit 0.
 * 하나라도 아니면 exit 1 과 이유 한 줄. 사용법이 틀리면 exit 2.
 *
 * 머지 증거 (분기점 커밋 이후 타임스탬프의 핸드오프만 센다)
 *   - curvez-reviewer 의 최신 핸드오프가 있고, status 가 blocked 가 아니고, blocker 지적이 0 이다
 *   - curvez-qa 의 최신 핸드오프가 done 이고, verification 이 있고, passed:false 가 없다
 *   - profile.json 에 crossReview 가 있으면 curvez-cross-reviewer 의 최신 핸드오프가 done 이다
 *
 * 왜 증거까지 보는가: 2026-09-28 종단 실행에서 권한만 보고 머지가 열렸다. 메인 세션이 플레이북을
 * 줄여 넘기고 오케스트레이터가 리뷰어를 띄우지 않았는데도 막는 곳이 없었다. 단계는 에이전트가
 * 줄일 수 있지만, 이 판정은 줄일 수 없다.
 *
 * grant.md 형식
 *   ---
 *   target: release
 *   expires: 2026-10-05
 *   ---
 *   > <사용자 원문>
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readMarkdown } from "./lib/frontmatter.mjs";
import {
  GRANT_REQUIRED_FIELDS,
  GRANT_STOP_PATTERNS,
  GRANT_STAGES,
} from "./lib/spec.mjs";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
}

function deny(reason) {
  console.log(`DENY ${reason}`);
  return 1;
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

/** 권한 파일 자체를 판정한다. 문제가 있으면 이유 문자열, 없으면 null. */
function checkGrantFile(target) {
  const file = join(process.cwd(), ".curvez", "grant.md");
  if (!existsSync(file))
    return { why: "자율 권한이 없다 (.curvez/grant.md 없음)" };

  const { frontmatter, body } = readMarkdown(file);
  if (!frontmatter) return { why: "grant.md 에 프론트매터가 없다" };
  for (const field of GRANT_REQUIRED_FIELDS) {
    if (!frontmatter[field]) return { why: `grant.md 에 \`${field}\` 가 없다` };
  }
  // 이유: 권한의 근거는 사용자가 한 말이다. 원문 인용이 없으면 누가 준 권한인지 확인할 수 없다.
  if (!/^>\s*\S/m.test(body))
    return { why: "grant.md 에 사용자 원문 인용(> …)이 없다" };

  const expires = new Date(`${frontmatter.expires}T23:59:59`);
  if (Number.isNaN(expires.getTime())) {
    return {
      why: `expires(${frontmatter.expires}) 를 날짜로 읽을 수 없다. YYYY-MM-DD 로 쓴다`,
    };
  }
  if (Date.now() > expires.getTime())
    return { why: `권한이 ${frontmatter.expires} 에 끝났다` };
  if (frontmatter.target !== target) {
    return {
      why: `권한의 대상은 ${frontmatter.target} 인데 머지 대상은 ${target} 이다`,
    };
  }
  return { expires: frontmatter.expires };
}

/** `<from>.<YYYYMMDD-HHmmss>.json` 의 타임스탬프를 초 단위로. 형식이 아니면 null. */
function handoffTime(name) {
  const m = name.match(/\.(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.json$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}`).getTime() / 1000;
}

/** 분기점 이후의 핸드오프 가운데 from 별 최신 것. */
function latestHandoffs(sinceSec) {
  const dir = join(process.cwd(), ".curvez", "handoff");
  const latest = new Map();
  if (!existsSync(dir)) return latest;
  for (const name of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const t = handoffTime(name);
    if (t === null || t < sinceSec) continue;
    let data;
    try {
      data = JSON.parse(readFileSync(join(dir, name), "utf8"));
    } catch {
      continue;
    }
    const prev = latest.get(data.from);
    if (!prev || prev.t < t) latest.set(data.from, { t, data, name });
  }
  return latest;
}

/** 머지 증거를 판정한다. 빠진 것의 목록을 돌려준다. */
function missingEvidence(sinceSec) {
  const hs = latestHandoffs(sinceSec);
  const missing = [];

  const reviewer = hs.get("curvez-reviewer")?.data;
  if (!reviewer) missing.push("curvez-reviewer 핸드오프 없음");
  else if (reviewer.status === "blocked")
    missing.push("curvez-reviewer 가 blocked");
  else if ((reviewer.findings ?? []).some((f) => f.severity === "blocker")) {
    missing.push("curvez-reviewer 의 blocker 가 남아 있음");
  }

  const qa = hs.get("curvez-qa")?.data;
  if (!qa) missing.push("curvez-qa 핸드오프 없음");
  else if (qa.status !== "done") missing.push(`curvez-qa 가 ${qa.status}`);
  else if (!(qa.verification ?? []).length)
    missing.push("curvez-qa 의 verification 이 비었음");
  else if (qa.verification.some((v) => v.passed === false)) {
    missing.push("curvez-qa 의 verification 에 실패가 있음");
  }

  let profile = {};
  try {
    profile = JSON.parse(
      readFileSync(join(process.cwd(), ".curvez", "profile.json"), "utf8"),
    );
  } catch {
    /* profile 이 없으면 교차 검토 요구도 없다. 다른 증거가 이미 막는다 */
  }
  if (profile.crossReview) {
    const cross = hs.get("curvez-cross-reviewer")?.data;
    if (!cross)
      missing.push("curvez-cross-reviewer 핸드오프 없음 (crossReview 설정됨)");
    else if (cross.status !== "done")
      missing.push(`curvez-cross-reviewer 가 ${cross.status}`);
  }
  return missing;
}

function main() {
  const stage = arg("--stage");
  const target = arg("--target");
  const base = arg("--base");
  if (
    !GRANT_STAGES.includes(stage) ||
    !target ||
    (stage === "merge" && !base)
  ) {
    console.error(
      "사용법: node check-grant.mjs --stage team --target <브랜치>\n" +
        "        node check-grant.mjs --stage merge --target <브랜치> --base <ref>",
    );
    return 2;
  }

  const grant = checkGrantFile(target);
  if (grant.why) return deny(grant.why);
  if (stage === "team") {
    console.log(`ALLOW ${target} 팀 구성 — 권한 만료 ${grant.expires}`);
    return 0;
  }

  let files;
  let sinceSec;
  try {
    files = git("diff", "--name-only", `${base}...HEAD`)
      .split("\n")
      .filter(Boolean);
    sinceSec = Number(
      git("log", "-1", "--format=%ct", git("merge-base", base, "HEAD")),
    );
  } catch {
    return deny(`${base} 와 HEAD 의 분기점을 읽지 못했다`);
  }
  const stopped = files.filter((f) =>
    GRANT_STOP_PATTERNS.some((re) => re.test(f)),
  );
  if (stopped.length > 0)
    return deny(`권한이 있어도 멈추는 변경이 있다: ${stopped.join(", ")}`);

  const missing = missingEvidence(sinceSec);
  if (missing.length > 0)
    return deny(`머지 증거가 부족하다: ${missing.join("; ")}`);

  console.log(
    `ALLOW ${target} 머지 — 권한 만료 ${grant.expires}, 리뷰·QA 증거 확인`,
  );
  return 0;
}

process.exit(main());
