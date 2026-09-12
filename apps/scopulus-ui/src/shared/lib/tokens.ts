import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * 토큰 값을 빌드 시점에 `tokens.css` 와 `design/tokens.md` 에서 직접 읽는다.
 *
 * **사본을 만들지 않는다.** 값을 이 파일에 적어 두면 CSS 를 고칠 때 화면만 낡는다.
 * `/docs/tokens` 가 "정본은 CSS 다" 라고 말하는 화면이라, 그 화면이 사본을 들고 있으면
 * 자기 말을 어긴다.
 *
 * 서버에서만 돈다. `node:fs` 를 쓰므로 클라이언트 컴포넌트에서 import 하지 마라.
 */

const PKG = path.join(process.cwd(), "..", "..", "packages", "scopulus-ui");

function read(p: string) {
  return readFileSync(path.join(PKG, p), "utf8");
}

/** 셀렉터 블록 안의 `--이름: 값;` 을 순서대로 꺼낸다. */
function block(css: string, selector: string) {
  const start = css.indexOf(selector + " {");
  if (start === -1) throw new Error(`${selector} 블록이 없다: tokens.css`);
  let depth = 0;
  let i = css.indexOf("{", start);
  const from = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) break;
  }
  const out: { name: string; value: string }[] = [];
  for (const line of css.slice(from, i).split("\n")) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/);
    if (m) out.push({ name: m[1], value: m[2].trim() });
  }
  return out;
}

export type ColorToken = {
  name: string;
  light: string;
  dark: string;
  /** 면 토큰이면 그 위에 올리는 글자 토큰의 이름. 짝이 없으면 `null`. */
  on: string | null;
};

/**
 * 색 토큰을 라이트·다크 한 행으로 묶는다. `--radius` 같은 치수는 뺀다.
 *
 * 순서는 CSS 에 적힌 순서 그대로다. 이름순으로 정렬하면 `--card` 와 `--card-foreground` 가
 * 떨어지고, 면과 글자가 짝이라는 것이 화면에서 안 읽힌다.
 */
export function colorTokens(): ColorToken[] {
  const css = read("tokens.css");
  const light = block(css, ":root");
  const dark = new Map(block(css, ".dark").map((t) => [t.name, t.value]));
  const names = new Set(light.map((t) => t.name));

  return light
    .filter((t) => /^(oklch|#|rgb)/.test(t.value))
    .map((t) => ({
      name: t.name,
      light: t.value,
      dark: dark.get(t.name) ?? t.value,
      on: names.has(`${t.name}-foreground`) ? `${t.name}-foreground` : null,
    }));
}

/**
 * `--radius` 계열.
 *
 * **`@theme inline` 에서 읽는다.** `:root` 에는 기준값 `--radius` 하나뿐이고 단계는 거기서
 * `calc()` 로 파생된다. `:root` 만 보면 상자가 하나만 나온다.
 *
 * 값이 `calc()` 라 문자열로 계산하지 않는다. 화면에서 CSS 변수를 그대로 읽는다.
 */
export function radiusTokens() {
  const css = read("tokens.css");
  const base = block(css, ":root").filter((t) => t.name === "--radius");
  const steps = block(css, "@theme inline").filter((t) =>
    /^--radius-/.test(t.name),
  );
  return [...base, ...steps].map((t) => ({ name: t.name, value: t.value }));
}

export type ContrastPair = {
  fg: string;
  bg: string;
  mode: "light" | "dark";
  min: number;
  ratio: number;
  note: string;
};

/**
 * `design/tokens.md` 의 `## 대비 검증` 목록. `check-contrast.mjs` 가 읽는 것과 같은 줄이다.
 *
 * 형식: `- fg=#14201E bg=#F7F9F8 mode=light min=4.5 # 본문·h1/캔버스 → 15.82`
 */
export function contrastPairs(): ContrastPair[] {
  const md = read(path.join("design", "tokens.md"));
  const i = md.indexOf("## 대비 검증");
  if (i === -1) throw new Error("## 대비 검증 절이 없다: design/tokens.md");
  const section = md.slice(i, md.indexOf("\n## ", i + 3));

  const LINE =
    /^-\s*fg=(#[0-9a-fA-F]{3,8})\s+bg=(#[0-9a-fA-F]{3,8})\s+mode=(\w+)\s+min=([\d.]+)\s*(?:#\s*(.*))?$/;

  const out: ContrastPair[] = [];
  for (const line of section.split("\n")) {
    const m = line.trim().match(LINE);
    if (!m) continue;
    const note = (m[5] ?? "").trim();
    const arrow = note.lastIndexOf("→");
    out.push({
      fg: m[1],
      bg: m[2],
      mode: m[3] === "dark" ? "dark" : "light",
      min: Number(m[4]),
      ratio: arrow === -1 ? NaN : Number(note.slice(arrow + 1).trim()),
      note: arrow === -1 ? note : note.slice(0, arrow).trim(),
    });
  }
  return out;
}

/**
 * 간격·타이포 스케일. Tailwind 의 기본 스케일을 그대로 쓰므로 값은 여기서 정한다.
 *
 * **`tokens.css` 에 없는 값이다.** 색과 반경만 CSS 변수로 갖고, 간격과 타이포는 Tailwind 가
 * 이미 정한 스케일을 쓴다. 그래서 이 둘은 읽어 올 곳이 없다 — 화면에 보이는 것과 같은
 * 클래스를 여기 적고, 실제 렌더도 그 클래스로 한다. 값이 틀리면 화면에서 바로 드러난다.
 */
export const SPACING = [
  { step: "0.5", cls: "w-0.5", px: 2 },
  { step: "1", cls: "w-1", px: 4 },
  { step: "1.5", cls: "w-1.5", px: 6 },
  { step: "2", cls: "w-2", px: 8 },
  { step: "2.5", cls: "w-2.5", px: 10 },
  { step: "3", cls: "w-3", px: 12 },
  { step: "4", cls: "w-4", px: 16 },
  { step: "5", cls: "w-5", px: 20 },
  { step: "6", cls: "w-6", px: 24 },
  { step: "8", cls: "w-8", px: 32 },
  { step: "10", cls: "w-10", px: 40 },
  { step: "16", cls: "w-16", px: 64 },
] as const;

export const TYPE_SCALE = [
  { name: "text-xs", cls: "text-xs", px: 12 },
  { name: "text-sm", cls: "text-sm", px: 14 },
  { name: "text-base", cls: "text-base", px: 16 },
  { name: "text-lg", cls: "text-lg", px: 18 },
  { name: "text-2xl", cls: "text-2xl", px: 24 },
  { name: "text-4xl", cls: "text-4xl", px: 36 },
  { name: "text-5xl", cls: "text-5xl", px: 48 },
] as const;
