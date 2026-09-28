#!/usr/bin/env node
/**
 * 자율 권한 판정기.
 *
 * 사용법 (저장소 루트에서):
 *   node check-grant.mjs --target <머지 대상 브랜치> [--base <비교 기준 ref>]
 *
 * `.curvez/grant.md` 가 유효하고, 머지 대상이 권한의 대상과 같고, `--base...HEAD` diff 에
 * 멈춤 경로(spec.mjs 의 GRANT_STOP_PATTERNS)가 없으면 exit 0.
 * 하나라도 아니면 exit 1 과 함께 이유 한 줄을 낸다. 사용법이 틀리면 exit 2.
 *
 * 왜 스크립트인가: 권한이 유효한지는 날짜·문자열·파일 목록으로 정해지는 결정적인 판정이다.
 * 모델에게 읽혀 판단하게 하면 같은 파일을 두고 실행마다 다른 판정이 나올 수 있다.
 *
 * grant.md 형식
 *   ---
 *   target: release
 *   expires: 2026-10-05
 *   ---
 *   > <사용자 원문>
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readMarkdown } from "./lib/frontmatter.mjs";
import { GRANT_REQUIRED_FIELDS, GRANT_STOP_PATTERNS } from "./lib/spec.mjs";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
}

function deny(reason) {
  console.log(`DENY ${reason}`);
  return 1;
}

function main() {
  const target = arg("--target");
  const base = arg("--base");
  if (!target) {
    console.error(
      "사용법: node check-grant.mjs --target <브랜치> [--base <ref>]",
    );
    return 2;
  }

  const file = join(process.cwd(), ".curvez", "grant.md");
  if (!existsSync(file))
    return deny("자율 권한이 없다 (.curvez/grant.md 없음)");

  const { frontmatter, body } = readMarkdown(file);
  if (!frontmatter) return deny("grant.md 에 프론트매터가 없다");
  for (const field of GRANT_REQUIRED_FIELDS) {
    if (!frontmatter[field]) return deny(`grant.md 에 \`${field}\` 가 없다`);
  }
  // 이유: 권한의 근거는 사용자가 한 말이다. 원문 인용이 없으면 누가 준 권한인지 확인할 수 없다.
  if (!/^>\s*\S/m.test(body))
    return deny("grant.md 에 사용자 원문 인용(> …)이 없다");

  const expires = new Date(`${frontmatter.expires}T23:59:59`);
  if (Number.isNaN(expires.getTime())) {
    return deny(
      `expires(${frontmatter.expires}) 를 날짜로 읽을 수 없다. YYYY-MM-DD 로 쓴다`,
    );
  }
  if (Date.now() > expires.getTime())
    return deny(`권한이 ${frontmatter.expires} 에 끝났다`);

  if (frontmatter.target !== target) {
    return deny(
      `권한의 대상은 ${frontmatter.target} 인데 머지 대상은 ${target} 이다`,
    );
  }

  if (base) {
    let files;
    try {
      files = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], {
        encoding: "utf8",
      })
        .split("\n")
        .filter(Boolean);
    } catch {
      return deny(`git diff ${base}...HEAD 를 읽지 못했다`);
    }
    const stopped = files.filter((f) =>
      GRANT_STOP_PATTERNS.some((re) => re.test(f)),
    );
    if (stopped.length > 0) {
      return deny(`권한이 있어도 멈추는 변경이 있다: ${stopped.join(", ")}`);
    }
  }

  console.log(`ALLOW ${target} 머지 — 권한 만료 ${frontmatter.expires}`);
  return 0;
}

process.exit(main());
