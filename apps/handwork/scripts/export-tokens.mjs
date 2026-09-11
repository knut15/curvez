#!/usr/bin/env node
/**
 * 토큰 내보내기 — Figma 로 가는 유일한 경로.
 *
 * **Figma 에는 코드에서 컴포넌트를 만들 수 없다.** REST API 는 노드 쓰기 자체가 없고,
 * Variables 쓰기 엔드포인트는 Enterprise org 의 Full seat 전용이다. 그래서 이 스크립트는
 * Figma 를 부르지 않는다. 사람이 Tokens Studio 같은 플러그인으로 가져갈 파일만 만든다.
 *
 * 형식은 Tokens Studio 의 단일 파일 형태다. `light` · `dark` 두 세트가 Figma 에서
 * 한 컬렉션의 두 모드가 된다. W3C DTCG 는 아직 모드를 표준화하지 않아, 순수 DTCG 로 쓰면
 * 어느 도구도 두 테마를 한 컬렉션으로 읽지 못한다.
 *
 * 입력은 globals.css 하나다 — `apps/handwork/design/tokens.md` 는 스스로 사본이라고 적어 둔 문서다.
 *
 * 사용: node apps/handwork/scripts/export-tokens.mjs [--check]
 *   --check 를 붙이면 쓰지 않고 기존 파일과 같은지만 본다. 다르면 exit 1.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { readTokens, toHexAlpha } from "./lib/tokens.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// 디자인 자산은 앱 안에 있다. 저장소 루트를 거치지 않는다 —
// handwork 의 디자인 시스템은 curvez 의 `.curvez/design/` 과 무관하다.
const DESIGN = join(HERE, "..", "design");
const OUT = join(DESIGN, "tokens.figma.json");

/** 앱이 쓰지 않는 토큰. 내보내면 Figma 에 쓰이지 않는 변수가 쌓인다. */
const SKIP = /^--(sidebar|chart)/;

function group(tokens) {
  const color = {};
  const dimension = {};

  for (const [name, raw] of Object.entries(tokens)) {
    if (SKIP.test(name)) continue;
    const key = name.replace(/^--/, "");

    if (name === "--radius") {
      dimension[key] = { $type: "dimension", $value: raw };
      continue;
    }
    // 알파가 섞인 값(다크의 --border·--input)은 8자리 hex 로 낸다. 건너뛰면 그 변수가
    // 다크 모드 값을 갖지 못해, Figma 에서 라이트 값이 그대로 새어 나온다.
    color[key] = { $type: "color", $value: toHexAlpha(raw) };
  }
  return { color, dimension };
}

const { light, dark } = readTokens();
// `.dark` 에 없는 토큰은 재정의되지 않는다는 뜻이다. 라이트 값이 그대로 상속된다.
const darkFull = { ...light, ...dark };

const payload = {
  $metadata: { tokenSetOrder: ["light", "dark"] },
  $themes: [],
  light: group(light),
  dark: group(darkFull),
};

const json = JSON.stringify(payload, null, 2) + "\n";

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    console.log(`없음: ${OUT}`);
    process.exit(1);
  }
  if (current !== json) {
    console.log(
      `어긋남: ${OUT} 가 globals.css 와 다르다. --check 없이 다시 돌려라.`,
    );
    process.exit(1);
  }
  console.log("tokens.figma.json 이 globals.css 와 일치한다");
  process.exit(0);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, json, "utf8");

const n = (set) =>
  Object.keys(set.color).length + Object.keys(set.dimension).length;
console.log(`${OUT}`);
console.log(`  light ${n(payload.light)}개 · dark ${n(payload.dark)}개`);
