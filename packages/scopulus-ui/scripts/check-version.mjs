#!/usr/bin/env node
/**
 * 버전 게이트 (G4).
 *
 * `package.json` 의 `version` 과 `CHANGELOG.md` 최상단 항목이 같은지 본다.
 *
 * **왜 필요한가:** 변경 이력을 손으로 쓰기로 했다. 손으로 쓰는 것은 잊힌다 — 버전만 올리고
 * 이력을 안 적거나, 이력만 적고 버전을 안 올린다. 둘 중 어느 쪽이든 "이 버전이 무엇을 담았나"
 * 를 판정할 근거가 사라진다. 그 판정을 사람 기억이 아니라 명령에 맡긴다.
 *
 * 사용: node packages/scopulus-ui/scripts/check-version.mjs
 * 종료 코드: 같으면 0, 다르거나 형식이 어긋나면 1.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");

/** `## [0.1.0] - 2026-09-11` 의 첫 등장. Keep a Changelog 가 최신을 위에 둔다. */
const entry = changelog.match(
  /^##\s*\[(\d+\.\d+\.\d+)\]\s*-\s*(\d{4}-\d{2}-\d{2})\s*$/m,
);

const fail = (msg) => {
  console.log(msg);
  process.exit(1);
};

if (!entry) {
  fail(
    "CHANGELOG.md 에서 `## [x.y.z] - YYYY-MM-DD` 형식의 항목을 찾지 못했다.\n" +
      "  Keep a Changelog 형식을 지켜라 — 이 형식이 아니면 어느 것이 최신인지 기계가 못 고른다.",
  );
}

const [, version, date] = entry;

if (version !== pkg.version) {
  fail(
    `버전이 어긋난다.\n` +
      `  package.json  ${pkg.version}\n` +
      `  CHANGELOG.md  ${version}  (${date})\n` +
      `  둘 중 하나만 올린 것이다. 올린 쪽에 맞춰 나머지를 고쳐라.`,
  );
}

console.log(`버전 일치: ${version} (${date})`);
