#!/usr/bin/env node
/**
 * 대비 게이트 (G3).
 *
 * 두 가지를 본다.
 *
 *   1. 쌍 검사 — 디자인 문서의 `## 대비 검증` 목록을 읽어 WCAG 대비를 계산하고,
 *      `min=` 기준과 문서가 적어 둔 `→ 값` 양쪽에 대조한다.
 *   2. 동기 검사 — `tokens.css` 의 색 토큰을 hex 로 바꿔 `tokens.md` 의 `## 색` 표와 맞춘다.
 *
 * **2번이 없으면 1번은 자기 자신만 검사한다.** 문서의 hex 쌍끼리 계산하는 것이라,
 * CSS 가 바뀌고 문서가 안 바뀐 상태에서도 전부 통과한다. 그때 통과는 "색이 맞다" 가 아니라
 * "문서가 자기와 일관된다" 일 뿐이다.
 *
 * 사용: node packages/scopulus-ui/scripts/check-contrast.mjs
 * 종료 코드: 실패 0건이면 0, 하나라도 있으면 1.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { contrast, isOpaqueColor, readTokens, toHex } from "./lib/tokens.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// 디자인 문서는 라이브러리 안에 있다. 앱도 저장소 루트도 거치지 않는다.
const DESIGN = join(HERE, "..", "design");

const PAIR_DOCS = [join(DESIGN, "tokens.md")];
const COLOR_TABLE_DOC = join(DESIGN, "tokens.md");

/** `- fg=#... bg=#... mode=light min=4.5 # 설명 → 15.82` */
const PAIR_RE =
  /^-\s*fg=(#[0-9a-fA-F]{3,8})\s+bg=(#[0-9a-fA-F]{3,8})\s+mode=(\w+)\s+min=([\d.]+)\s*(?:#\s*(.*))?$/;

function readPairs() {
  const pairs = [];
  for (const path of PAIR_DOCS) {
    if (!existsSync(path)) continue;
    const section = sectionOf(readFileSync(path, "utf8"), "## 대비 검증");
    if (!section) continue;
    for (const line of section.split("\n")) {
      const m = line.trim().match(PAIR_RE);
      if (!m) continue;
      const [, fg, bg, mode, min, note = ""] = m;
      const stated = note.match(/→\s*([\d.]+)/);
      pairs.push({
        path,
        fg,
        bg,
        mode,
        min: Number(min),
        note: note.trim(),
        stated: stated ? Number(stated[1]) : null,
      });
    }
  }
  return pairs;
}

function sectionOf(md, heading) {
  const start = md.indexOf(heading);
  if (start === -1) return null;
  const after = md.indexOf("\n## ", start + heading.length);
  return md.slice(start, after === -1 ? undefined : after);
}

/** `| --background | #F7F9F8 | #0B100F | 용도 |` 행을 읽는다. */
function readColorTable() {
  const section = sectionOf(readFileSync(COLOR_TABLE_DOC, "utf8"), "## 색");
  const out = {};
  if (!section) return out;
  for (const line of section.split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 5) continue;
    const [, name, light, dark] = cells;
    if (!name.startsWith("--")) continue;
    out[name] = { light, dark };
  }
  return out;
}

const failures = [];
let checked = 0;

// ── 1. 쌍 검사 ──────────────────────────────────────────────────────────────
const pairs = readPairs();
for (const p of pairs) {
  checked++;
  const ratio = contrast(p.fg, p.bg);
  const shown = ratio.toFixed(2);
  if (ratio < p.min) {
    failures.push(
      `대비 미달  fg=${p.fg} bg=${p.bg} ${p.mode} → ${shown} < ${p.min}  ${p.note}`,
    );
  } else if (p.stated !== null && Math.abs(ratio - p.stated) > 0.05) {
    failures.push(
      `문서 불일치 fg=${p.fg} bg=${p.bg} ${p.mode} 계산=${shown} 문서=${p.stated.toFixed(2)}  ${p.note}`,
    );
  }
}

// ── 2. 동기 검사 ────────────────────────────────────────────────────────────
const { light, dark } = readTokens();
const table = readColorTable();
let synced = 0;
for (const [name, doc] of Object.entries(table)) {
  for (const [mode, css] of [
    ["light", light[name]],
    ["dark", dark[name] ?? light[name]],
  ]) {
    const want = doc[mode];
    if (!want || !want.startsWith("#")) continue; // 알파값 등은 문서가 rgba 로 적어 뒀다
    if (!css || !isOpaqueColor(css)) continue;
    synced++;
    const got = toHex(css);
    if (got.toUpperCase() !== want.toUpperCase()) {
      failures.push(
        `토큰 어긋남 ${name} (${mode}) css=${got} 문서=${want.toUpperCase()}`,
      );
    }
  }
}

// ── 보고 ────────────────────────────────────────────────────────────────────
console.log(`대비 쌍 ${checked}건 검사`);
console.log(`토큰 hex 동기 ${synced}건 검사`);
if (failures.length === 0) {
  console.log("실패 0건");
  process.exit(0);
}
console.log(`\n실패 ${failures.length}건`);
for (const f of failures) console.log("  " + f);
process.exit(1);
