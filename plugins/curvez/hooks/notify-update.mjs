#!/usr/bin/env node
/**
 * SessionStart 훅 — 플러그인 버전이 바뀐 뒤 처음 여는 세션에서 한 번 알린다.
 *
 * 업데이트는 user scope 라 계정 전체에 한 번에 적용되는데, 각 프로젝트가 그 사실을
 * 알게 되는 시점이 없었다 — 마이그레이션 노트에 "프로젝트에서 할 일"이 있어도
 * 그 프로젝트를 여는 사람에게 닿지 않았다.
 *
 * 판정: 프로젝트별 마커(`.curvez/tmp/plugin-version`)와 플러그인 버전을 비교한다.
 *   - `.curvez/profile.json` 이 없는 저장소는 조용히 종료한다 — curvez 프로젝트가 아니다.
 *     훅은 user scope 라 모든 저장소에서 돌기 때문에 이 필터가 먼저다
 *   - 마커가 없으면 알림 없이 기록만 한다 — "업데이트됨"과 "이 기능이 처음 돎"을
 *     구분할 근거가 없어, 소음을 피하는 쪽으로 둔다
 *   - 마커와 버전이 다르면 stdout 으로 알린다. SessionStart 의 stdout 은 세션
 *     컨텍스트에 주입된다
 *
 * 마커가 `.curvez/tmp/` 인 이유: gitignore 대상이라 팀원 간 diff 를 만들지 않는다.
 * 어느 버전을 봤는가는 기계별 상태다. tmp 가 지워지면 알림이 한 번 더 뜨는 정도라 무해하다.
 *
 * exit 0 고정 — 알림의 실패가 세션 시작을 막으면 안 된다.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  /* stdin 이 없어도 cwd 로 동작한다 */
}
const ROOT = input.cwd ?? process.cwd();

if (!existsSync(join(ROOT, ".curvez", "profile.json"))) process.exit(0);

let version = null;
try {
  version =
    JSON.parse(
      readFileSync(
        new URL("../.claude-plugin/plugin.json", import.meta.url),
        "utf8",
      ),
    ).version ?? null;
} catch {
  /* 버전을 못 읽으면 비교할 것이 없다 */
}
if (!version) process.exit(0);

const marker = join(ROOT, ".curvez", "tmp", "plugin-version");
let seen = null;
try {
  seen = readFileSync(marker, "utf8").trim() || null;
} catch {
  /* 마커 없음 = 이 프로젝트에서 처음 돎 */
}

try {
  mkdirSync(join(ROOT, ".curvez", "tmp"), { recursive: true });
  writeFileSync(marker, version + "\n");
} catch {
  /* 기록에 실패해 알림이 반복되는 쪽이, 알림이 사라지는 쪽보다 낫다 */
}

if (seen === null || seen === version) process.exit(0);

console.log(
  `curvez 플러그인이 ${seen} → ${version} 으로 바뀌었다. ` +
    `마이그레이션 노트(플러그인 docs/migration.md 의 "${version}" 절)에서 ` +
    `"프로젝트에서 할 일"이 있는지 확인하라.`,
);
process.exit(0);
