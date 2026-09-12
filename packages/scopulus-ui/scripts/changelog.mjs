#!/usr/bin/env node
/**
 * `CHANGELOG.md` 의 `## [Unreleased]` 절을 커밋에서 만든다.
 *
 * **왜 커밋인가:** 이 저장소의 커밋 제목은 이미 "변경 내용 한 문장" 이다
 * (`git log --format=%s` 로 확인). 손으로 다시 적으면 같은 문장이 두 곳에 생기고,
 * 한쪽만 고쳐질 때 어느 것이 사실인지 판정할 근거가 사라진다.
 *
 * **범위는 이 패키지와 문서 사이트다.** 다른 앱의 커밋은 이 라이브러리의 변경이 아니다.
 *
 * **발행된 절은 건드리지 않는다.** `## [x.y.z]` 로 시작하는 절은 그대로 두고
 * `## [Unreleased]` 만 다시 쓴다. 발행한 이력을 나중에 바꾸면 그것을 읽고 판단한 사람의
 * 근거가 소리 없이 달라진다.
 *
 * 사용:
 *   node packages/scopulus-ui/scripts/changelog.mjs          미리 보기(파일을 고치지 않는다)
 *   node packages/scopulus-ui/scripts/changelog.mjs --write  CHANGELOG.md 에 쓴다
 *   node packages/scopulus-ui/scripts/changelog.mjs --check  쓸 것이 남았으면 1로 끝난다
 *
 * 종료 코드: 0 정상. `--check` 에서 갱신이 필요하면 1.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const REPO = join(ROOT, "..", "..");
const FILE = join(ROOT, "CHANGELOG.md");

/** 이 라이브러리의 변경으로 치는 경로. 여기 밖의 커밋은 이력에 넣지 않는다. */
const PATHS = ["packages/scopulus-ui", "apps/scopulus-ui"];

const HEADING = "## [Unreleased]";

const git = (...args) =>
  execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trim();

/**
 * 어디서부터 셀지 정한다.
 *
 * 태그(`scopulus-ui@x.y.z`)가 있으면 그것을, 없으면 최상단 발행 절의 날짜를 쓴다.
 * 날짜를 쓰면 같은 날 커밋이 섞일 수 있다 — 그래서 태그가 먼저다.
 */
function since(md) {
  const tags = git("tag", "--list", "scopulus-ui@*", "--sort=-v:refname")
    .split("\n")
    .filter(Boolean);
  if (tags.length > 0) return { kind: "tag", value: tags[0] };

  const entry = md.match(
    /^##\s*\[(\d+\.\d+\.\d+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/m,
  );
  if (!entry) return { kind: "all", value: null };
  return { kind: "date", value: entry[2], version: entry[1] };
}

function commits(from) {
  const args = ["log", "--no-merges", "--format=%s\t%h"];
  if (from.kind === "tag") args.push(`${from.value}..HEAD`);
  // `--since` 는 그 날짜의 00:00 부터다. 발행 절과 같은 날 커밋은 이미 그 절에 들어 있으므로
  // 하루 뒤부터 센다.
  else if (from.kind === "date") args.push(`--since=${from.value} 23:59:59`);
  args.push("--", ...PATHS);

  return (
    git(...args)
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [subject, hash] = line.split("\t");
        return { subject, hash };
      })
      // 이력을 손본 커밋은 변경 내용이 아니다.
      .filter(({ subject }) => !/^(CHANGELOG|changelog)\b/.test(subject))
  );
}

function block(list, from) {
  if (list.length === 0) return "";
  const origin =
    from.kind === "tag"
      ? from.value
      : from.kind === "date"
        ? `${from.version} (${from.value})`
        : "저장소 전체";
  return [
    HEADING,
    "",
    `<!-- ${origin} 이후 커밋에서 만든다. \`scripts/changelog.mjs\` -->`,
    "",
    ...list.map(({ subject, hash }) => `- ${subject} (\`${hash}\`)`),
    "",
  ].join("\n");
}

/** 발행된 절은 남기고 `## [Unreleased]` 만 갈아 끼운다. */
function apply(md, next) {
  const start = md.indexOf(HEADING);
  if (start >= 0) {
    const after = md.indexOf("\n## ", start + HEADING.length);
    const tail = after < 0 ? "" : md.slice(after + 1);
    return md.slice(0, start) + next + (next ? "\n" : "") + tail;
  }
  if (!next) return md;
  const first = md.search(/^##\s*\[/m);
  if (first < 0) return md.trimEnd() + "\n\n" + next;
  return md.slice(0, first) + next + "\n" + md.slice(first);
}

const md = readFileSync(FILE, "utf8");
const from = since(md);
const list = commits(from);
const next = block(list, from);
const updated = apply(md, next);

const mode = process.argv[2];

if (mode === "--write") {
  if (updated === md) {
    console.log("바뀐 것 없음. 커밋 0건.");
  } else {
    writeFileSync(FILE, updated);
    console.log(
      `CHANGELOG.md 갱신 — 커밋 ${list.length}건 (${from.kind}: ${from.value ?? "-"})`,
    );
  }
} else if (mode === "--check") {
  if (updated !== md) {
    console.log(
      `CHANGELOG.md 가 커밋과 다르다. 커밋 ${list.length}건이 반영되지 않았다.\n` +
        "  node packages/scopulus-ui/scripts/changelog.mjs --write",
    );
    process.exit(1);
  }
  console.log(`CHANGELOG.md 최신 — 미반영 커밋 0건.`);
} else {
  console.log(next || `${from.kind}: ${from.value ?? "-"} 이후 커밋 0건.`);
}
