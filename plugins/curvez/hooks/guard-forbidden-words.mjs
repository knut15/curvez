#!/usr/bin/env node
/**
 * PreToolUse(Write|Edit) 가드 — 금지어 '벽'.
 *
 * forbidden-words: allow  ← 이 파일 자신은 금지어를 정의해야 하므로 예외다.
 *
 * 규칙의 정본은 워크스페이스 CLAUDE.md 의 "'벽' 은 어떤 뜻으로도 쓰지 않는다" 조항이다.
 * 여기서는 그 조항을 기계로 강제하기만 한다.
 *
 * 왜 훅인가: 문서에 금지라고 적어 두고도 "이번엔 다른 뜻이니 괜찮겠지" 하고 다시 쓰는 일이
 * 실제로 반복됐다. 문서 규칙은 읽는 시점에만 작동하고 쓰는 시점에는 작동하지 않는다.
 *
 * 왜 PreToolUse 인가: 쓰이기 전에 막아야 되돌릴 것이 없다. PostToolUse 로 알리면 파일은
 * 이미 바뀐 뒤라 금지어가 들어간 커밋이 남을 수 있다.
 *
 * 판정: 한글 덩어리에서 조사를 뗀 어간이 정확히 '벽' 인 경우만 막는다.
 * 합성어(암벽등반·절벽·벽화)와 고유명사(이화벽화마을)는 통과한다 — CLAUDE.md 의 예외 규정과 같다.
 *
 * exit 2 = 차단(stderr 가 모델에게 전달된다). exit 0 = 통과.
 */

import { readFileSync } from "node:fs";

/** 이 문자열이 파일 어딘가에 있으면 그 파일 전체를 검사에서 제외한다. */
const ALLOW_MARKER = "forbidden-words: allow";

/**
 * 단독으로 쓰인 '벽' 만 잡는 정규식.
 *
 * 한글 덩어리(`[가-힣]+`)를 통째로 뽑은 뒤 이 패턴에 맞는 것만 위반으로 센다.
 * 앞뒤에 다른 한글이 붙은 덩어리는 합성어이므로 자동으로 빠진다.
 */
const JOSA =
  "은|는|이|가|을|를|에서|에는|에도|에|으로|로|과|와|도|만|까지|부터|의|처럼|보다|밖에|조차|마저|이나|나|이라는|이란|이라|이다|이었다|였다|입니다|라도|라는|들이|들을|들";
const STANDALONE = new RegExp(`^벽(?:${JOSA})?$`);
const HANGUL_CHUNK = /[가-힣]+/g;

function readInput() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    process.exit(0);
  }
}

/** 이 도구 호출에서 실제로 파일에 들어갈 텍스트. 검사 대상이 아니면 null. */
function textToCheck(input) {
  const t = input?.tool_input ?? {};
  if (typeof t.content === "string") return t.content; // Write
  if (typeof t.new_string === "string") return t.new_string; // Edit
  return null;
}

/** 파일이 예외로 표시돼 있는가. 새로 쓰는 내용과 디스크의 현재 내용을 모두 본다. */
function isExempt(filePath, text) {
  if (text.includes(ALLOW_MARKER)) return true;
  if (typeof filePath !== "string") return false;
  try {
    return readFileSync(filePath, "utf8").includes(ALLOW_MARKER);
  } catch {
    return false; // 새 파일이면 디스크에 없다
  }
}

const input = readInput();
const text = textToCheck(input);
if (text === null) process.exit(0);

const filePath = input?.tool_input?.file_path;
if (isExempt(filePath, text)) process.exit(0);

const hits = [];
text.split("\n").forEach((line, i) => {
  for (const chunk of line.match(HANGUL_CHUNK) ?? []) {
    if (STANDALONE.test(chunk)) {
      hits.push({ line: i + 1, text: line.trim() });
      break; // 한 줄에 여러 번 나와도 한 번만 보고한다
    }
  }
});

if (hits.length === 0) process.exit(0);

const shown = hits
  .slice(0, 5)
  .map((h) => `  ${h.line}행 │ ${h.text.slice(0, 100)}`)
  .join("\n");
const more = hits.length > 5 ? `\n  … ${hits.length - 5}곳 더` : "";

process.stderr.write(
  `curvez 금지어 — 단독 '벽' 은 뜻을 가리지 않고 금지다. ${hits.length}곳에서 걸렸다.\n` +
    `${shown}${more}\n` +
    `대체어: 목록·화면 → "목록에 실린다" / 장애물 → "문제·막힌 곳" / 한계 → "한계·상한" / 단절 → "단절·경계"\n` +
    `합성어(암벽등반·절벽·벽화)와 고유명사는 대상이 아니다. 걸렸다면 단독으로 쓴 것이다.\n` +
    `규칙 문서처럼 그 글자를 인용해야 하는 파일은 본문 어딘가에 ${ALLOW_MARKER} 를 넣는다.\n`,
);
process.exit(2);
