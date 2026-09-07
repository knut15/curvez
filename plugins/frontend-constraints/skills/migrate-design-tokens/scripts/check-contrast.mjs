#!/usr/bin/env node
/**
 * check-contrast.mjs
 *
 * Parses a shadcn/ui theme file, pairs every `--x` token with its
 * `--x-foreground` counterpart, and computes the WCAG 2.1 contrast ratio in
 * both light (:root) and dark (.dark) modes.
 *
 * Supports oklch(), hex, rgb(), and hsl() token values, including the bare
 * `H S% L%` form Tailwind v3 themes use.
 *
 * Usage:
 *   node check-contrast.mjs <theme.css> [options]
 *
 * Options:
 *   --min <n>          Minimum ratio to pass (default: 4.5, WCAG AA body text)
 *   --large <n>        Minimum for large-text pairs (default: 3)
 *   --format json|text Output format (default: text)
 *   --pair a:b         Check an extra pair, e.g. --pair border:background
 *
 * Exit code is 1 when any pair fails, so it can gate CI.
 */

import { readFileSync } from "node:fs";

/* ---------------------------------------------------------------- color ---- */

const clamp01 = (n) => Math.min(1, Math.max(0, n));

function oklchToLinearRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(clamp01);
}

const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

function hslToLinearRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const seg = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][Math.floor(h / 60) % 6];
  return seg.map((v) => srgbToLinear(clamp01(v + m)));
}

const num = (t) => (t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t));

/** Returns linear-light RGB in [0,1], or null if the value isn't a color. */
function parseColor(raw) {
  if (!raw) return null;
  const v = raw.trim().replace(/;$/, "");

  let m = v.match(/^oklch\(\s*([^\s/]+)\s+([^\s/]+)\s+([^\s/)]+)/i);
  if (m) {
    const L = num(m[1]);
    const C = m[2].endsWith("%") ? parseFloat(m[2]) / 250 : parseFloat(m[2]);
    const h = parseFloat(m[3]) || 0;
    return oklchToLinearRgb(L, C, h);
  }

  m = v.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let hex = m[1];
    if (hex.length === 3 || hex.length === 4)
      hex = [...hex].map((c) => c + c).join("");
    const int = parseInt(hex.slice(0, 6), 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((c) =>
      srgbToLinear(c / 255),
    );
  }

  m = v.match(/^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)/i);
  if (m) {
    return m
      .slice(1, 4)
      .map((t) =>
        srgbToLinear(
          clamp01(t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t) / 255),
        ),
      );
  }

  m = v.match(/^hsla?\(\s*([\d.-]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i);
  if (m)
    return hslToLinearRgb(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));

  // Tailwind v3 bare form: `--background: 0 0% 100%;`
  m = v.match(/^([\d.-]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (m)
    return hslToLinearRgb(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));

  return null;
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/* ----------------------------------------------------------------- parse ---- */

/** Extracts custom properties from every `:root` / `.dark` block in the file. */
function extractBlocks(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks = { light: {}, dark: {} };

  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const selector = m[1].split(";").pop().trim();
    const body = m[2];
    let target = null;
    if (/(^|,)\s*:root\s*(,|$)/.test(selector)) target = "light";
    else if (/\.dark\b/.test(selector)) target = "dark";
    if (!target) continue;

    const decl = /--([\w-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = decl.exec(body)) !== null) {
      target && (blocks[target][d[1]] = d[2].trim());
    }
  }
  return blocks;
}

/** Resolves `var(--other)` one hop, falling back to the light block. */
function resolve(name, block, fallback, depth = 0) {
  const raw = block[name] ?? fallback[name];
  if (!raw || depth > 4) return raw ?? null;
  const m = raw.match(/^var\(\s*--([\w-]+)\s*\)$/);
  if (m) return resolve(m[1], block, fallback, depth + 1);
  return raw;
}

/* ------------------------------------------------------------------ main ---- */

function parseArgs(argv) {
  const o = { file: null, min: 4.5, large: 3, format: "text", pairs: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--min") o.min = Number(argv[++i]);
    else if (a === "--large") o.large = Number(argv[++i]);
    else if (a === "--format") o.format = argv[++i];
    else if (a === "--pair") o.pairs.push(argv[++i]);
    else if (!a.startsWith("--") && !o.file) o.file = a;
  }
  return o;
}

// Pairs where a lower bar is defensible: these tokens are used for large text,
// borders, and decorative surfaces rather than body copy.
const LARGE_TEXT_TOKENS = new Set(["muted", "border", "input", "ring"]);

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.file) {
    console.error(
      "usage: node check-contrast.mjs <theme.css> [--min 4.5] [--format json]",
    );
    process.exit(2);
  }

  const css = readFileSync(opts.file, "utf8");
  const blocks = extractBlocks(css);

  const names = new Set([
    ...Object.keys(blocks.light),
    ...Object.keys(blocks.dark),
  ]);
  const autoPairs = [...names]
    .filter((n) => n.endsWith("-foreground"))
    .map((fg) => [fg.replace(/-foreground$/, ""), fg]);
  if (names.has("background") && names.has("foreground")) {
    autoPairs.unshift(["background", "foreground"]);
  }

  const extraPairs = opts.pairs.map((p) => p.split(":"));
  const allPairs = [...autoPairs, ...extraPairs];

  const results = [];
  for (const mode of ["light", "dark"]) {
    const block = blocks[mode];
    if (!Object.keys(block).length) continue;
    for (const [bgName, fgName] of allPairs) {
      const bgRaw = resolve(bgName, block, blocks.light);
      const fgRaw = resolve(fgName, block, blocks.light);
      const bg = parseColor(bgRaw);
      const fg = parseColor(fgRaw);
      if (!bg || !fg) {
        results.push({
          mode,
          pair: `${bgName} / ${fgName}`,
          status: "skipped",
          reason: !bgRaw || !fgRaw ? "token missing" : "unparseable value",
        });
        continue;
      }
      const ratio = contrast(bg, fg);
      const threshold = LARGE_TEXT_TOKENS.has(bgName) ? opts.large : opts.min;
      results.push({
        mode,
        pair: `${bgName} / ${fgName}`,
        ratio: Math.round(ratio * 100) / 100,
        threshold,
        status: ratio >= threshold ? "pass" : "fail",
        background: bgRaw,
        foreground: fgRaw,
      });
    }
  }

  const failures = results.filter((r) => r.status === "fail");
  const skipped = results.filter((r) => r.status === "skipped");

  if (opts.format === "json") {
    console.log(
      JSON.stringify(
        {
          themeFile: opts.file,
          checked: results.length - skipped.length,
          failed: failures.length,
          skipped: skipped.length,
          results,
        },
        null,
        2,
      ),
    );
  } else {
    for (const mode of ["light", "dark"]) {
      const rows = results.filter((r) => r.mode === mode);
      if (!rows.length) continue;
      console.log(`\n${mode.toUpperCase()}`);
      for (const r of rows) {
        if (r.status === "skipped") {
          console.log(`  ---   ${r.pair.padEnd(42)} skipped (${r.reason})`);
        } else {
          const mark = r.status === "pass" ? "pass" : "FAIL";
          console.log(
            `  ${String(r.ratio).padStart(5)}  ${r.pair.padEnd(42)} ${mark} (needs ${r.threshold})`,
          );
        }
      }
    }
    console.log(
      `\n${failures.length} failing, ${skipped.length} skipped, ` +
        `${results.length - skipped.length - failures.length} passing\n`,
    );
  }

  process.exit(failures.length ? 1 : 0);
}

main();
