/**
 * `src/tokens.css` 에서 색 토큰을 읽는다.
 *
 * **`src/tokens.css` 가 유일한 입력이다.** `design/tokens.md` 는 그 파일의 사본이라고
 * 스스로 적어 뒀다. 사본을 입력으로 삼으면 내보낸 값과 화면의 값이 조용히 어긋난다.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const CSS_PATH = join(HERE, "..", "..", "src", "tokens.css");

/** `:root { ... }` 와 `.dark { ... }` 블록의 `--이름: 값;` 을 뽑는다. */
export function readTokens(cssPath = CSS_PATH) {
  const css = readFileSync(cssPath, "utf8");
  return {
    light: block(css, ":root", cssPath),
    dark: block(css, ".dark", cssPath),
  };
}

// `cssPath` 는 오류 메시지에만 쓴다. 넘기지 않으면 여기서 스코프 밖 변수를 읽어
// ReferenceError 가 나는데, 그 경로는 블록을 못 찾았을 때만 타므로 평소엔 드러나지 않는다.
function block(css, selector, cssPath) {
  // 셀렉터 뒤 첫 `{` 부터 짝이 맞는 `}` 까지. 중첩이 없는 블록이라 깊이 세기로 충분하다.
  const start = css.indexOf(selector + " {");
  if (start === -1)
    throw new Error(`${selector} 블록을 찾지 못했다: ${cssPath}`);
  let depth = 0;
  let i = css.indexOf("{", start);
  const from = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) break;
  }
  const body = css.slice(from, i);

  const out = {};
  for (const line of body.split("\n")) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

/**
 * 색 토큰만 남긴다. `--radius` 같은 치수와 알파가 섞인 값은 대비 계산이 불가능하다.
 * 알파 위 실제 색은 뒤에 깔린 배경에 따라 달라져 고정 쌍으로 계산되지 않는다.
 */
export function isOpaqueColor(value) {
  if (/\/\s*[\d.]+%?\s*\)/.test(value)) return false; // oklch(... / 10%)
  if (/^rgba\(/.test(value)) return false;
  return /^(#|oklch\(|rgb\()/.test(value);
}

/** oklch / hex / rgb 를 sRGB 0~1 세 성분으로 바꾼다. */
export function toRgb(value) {
  const v = value.trim();
  if (v.startsWith("#")) return hexToRgb(v);
  if (v.startsWith("rgb(")) {
    const [r, g, b] = v
      .slice(4, -1)
      .split(/[\s,]+/)
      .map(Number);
    return [r / 255, g / 255, b / 255];
  }
  if (v.startsWith("oklch(")) return oklchToRgb(v);
  throw new Error(`해석할 수 없는 색 형식: ${value}`);
}

function hexToRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
}

function oklchToRgb(value) {
  const parts = value.slice(6, -1).trim().split(/[\s]+/);
  const L = pct(parts[0]);
  const C = Number(parts[1]);
  const H = Number(parts[2] ?? 0);

  // OKLab → LMS → linear sRGB. 계수는 Björn Ottosson 의 정의 그대로다.
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map(gamma).map((c) => Math.min(1, Math.max(0, c)));
}

function pct(token) {
  return token.endsWith("%") ? Number(token.slice(0, -1)) / 100 : Number(token);
}

function gamma(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** WCAG 2.x 상대 휘도. */
export function luminance(rgb) {
  const [r, g, b] = rgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 대비비. 1.0 ~ 21.0 */
export function contrast(a, b) {
  const [hi, lo] = [luminance(toRgb(a)), luminance(toRgb(b))].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

/** hex 사본. 문서에 옮겨 적을 때 쓴다. */
export function toHex(value) {
  return (
    "#" +
    toRgb(value)
      .map((c) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

/**
 * 알파를 살린 hex. 알파가 없으면 6자리, 있으면 8자리를 돌려준다.
 *
 * 대비 계산에는 쓰지 마라. 알파 위의 실제 색은 뒤에 깔린 배경에 따라 달라져
 * 고정 쌍으로 계산되지 않는다. 내보내기처럼 값을 그대로 옮기는 자리에만 쓴다.
 */
export function toHexAlpha(value) {
  const a = alphaOf(value);
  const base = toHex(stripAlpha(value));
  if (a === 1) return base;
  return (
    base +
    Math.round(a * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase()
  );
}

function alphaOf(value) {
  const slash = value.match(/\/\s*([\d.]+)(%?)\s*\)/);
  if (slash)
    return slash[2] === "%" ? Number(slash[1]) / 100 : Number(slash[1]);
  const rgba = value.match(/^rgba\(([^)]*)\)/);
  if (rgba) {
    const parts = rgba[1].split(/[\s,/]+/).filter(Boolean);
    return parts.length === 4 ? Number(parts[3]) : 1;
  }
  return 1;
}

function stripAlpha(value) {
  const v = value.trim();
  if (v.startsWith("rgba(")) {
    const parts = v
      .slice(5, -1)
      .split(/[\s,/]+/)
      .filter(Boolean)
      .slice(0, 3);
    return `rgb(${parts.join(" ")})`;
  }
  return v.replace(/\s*\/\s*[\d.]+%?\s*\)/, ")");
}
