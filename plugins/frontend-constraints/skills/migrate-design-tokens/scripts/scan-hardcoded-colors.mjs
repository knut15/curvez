#!/usr/bin/env node
/**
 * scan-hardcoded-colors.mjs
 *
 * Finds color values that bypass the design-token layer.
 *
 * Usage:
 *   node scan-hardcoded-colors.mjs <dir> [options]
 *
 * Options:
 *   --theme <path>     Token definition file to exclude (default: auto-detect)
 *   --format json|text Output format (default: text)
 *   --ignore <glob>    Extra path substring to skip (repeatable)
 *   --max <n>          Cap findings printed in text mode (default: 60)
 *
 * Exit code is 1 when any finding is reported, so it can gate CI.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";

const SCAN_EXT = new Set([
  ".tsx",
  ".jsx",
  ".ts",
  ".js",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".vue",
  ".svelte",
  ".astro",
  ".html",
  ".mdx",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "out",
  "coverage",
  ".turbo",
  ".cache",
  "storybook-static",
  ".svelte-kit",
]);

const THEME_CANDIDATES = [
  "app/globals.css",
  "src/app/globals.css",
  "src/globals.css",
  "styles/globals.css",
  "src/styles/globals.css",
  "src/index.css",
  "app/index.css",
];

// Tailwind's built-in palette. Using these directly means the color is not
// coming from the semantic token layer.
const PALETTE = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
].join("|");

const UTIL = [
  "bg",
  "text",
  "border",
  "ring",
  "fill",
  "stroke",
  "from",
  "to",
  "via",
  "outline",
  "decoration",
  "shadow",
  "accent",
  "caret",
  "divide",
  "placeholder",
  "ring-offset",
].join("|");

const COLOR_FN = "(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\\([^)]*\\)";

const RULES = [
  {
    id: "arbitrary-utility",
    severity: "high",
    why: "Tailwind arbitrary color, invisible to theming and dark mode",
    re: new RegExp(
      `\\b(?:${UTIL})-\\[\\s*(?:#[0-9a-fA-F]{3,8}|${COLOR_FN})\\s*\\]`,
      "g",
    ),
  },
  {
    id: "palette-utility",
    severity: "medium",
    why: "Tailwind palette color instead of a semantic token",
    re: new RegExp(
      `\\b(?:${UTIL})-(?:${PALETTE})-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`,
      "g",
    ),
  },
  {
    id: "hex-literal",
    severity: "high",
    why: "Raw hex color",
    re: /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b(?![0-9a-fA-F])/g,
  },
  {
    id: "color-function",
    severity: "high",
    why: "Raw color function",
    re: new RegExp(COLOR_FN, "g"),
  },
];

function parseArgs(argv) {
  const opts = { dir: null, theme: null, format: "text", ignore: [], max: 60 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--theme") opts.theme = argv[++i];
    else if (a === "--format") opts.format = argv[++i];
    else if (a === "--ignore") opts.ignore.push(argv[++i]);
    else if (a === "--max") opts.max = Number(argv[++i]);
    else if (!a.startsWith("--") && !opts.dir) opts.dir = a;
  }
  opts.dir = opts.dir || ".";
  return opts;
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name.startsWith(".") && name !== ".storybook") continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, out);
    } else if (SCAN_EXT.has(extname(name))) {
      out.push(full);
    }
  }
  return out;
}

const isStyleSheet = (f) =>
  [".css", ".scss", ".sass", ".less"].includes(extname(f));

/**
 * In a stylesheet, a raw color assigned to a custom property (`--primary: #fff`)
 * IS the token definition and is legitimate. The same color assigned to a normal
 * property (`color: #fff`) bypasses the token layer. This distinction is what
 * keeps the scanner from flagging the theme file itself.
 */
function isTokenDefinition(line) {
  return /^\s*--[\w-]+\s*:/.test(line);
}

/**
 * Colors inside comments are notes, not code. Strip them before matching so a
 * `{/* brand was #ccc *\/}` note doesn't show up as a violation.
 */
function stripComments(line) {
  const t = line.trim();
  if (t.startsWith("//") || t.startsWith("*")) return "";
  return line.replace(/\{?\/\*[\s\S]*?\*\/\}?/g, " ");
}

function scanFile(file, rootDir) {
  const findings = [];
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return findings;
  }
  const lines = text.split(/\r?\n/);
  const sheet = isStyleSheet(file);

  lines.forEach((rawLine, idx) => {
    const line = stripComments(rawLine);
    if (!line.trim()) return;
    if (sheet && isTokenDefinition(line)) return;

    const seen = new Set();
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line)) !== null) {
        const value = m[0];
        // An arbitrary utility already contains a hex; don't double-report it.
        const key = `${m.index}:${value}`;
        if (seen.has(key)) continue;
        if (
          rule.id !== "arbitrary-utility" &&
          /-\[[^\]]*$/.test(line.slice(0, m.index))
        )
          continue;
        seen.add(key);
        findings.push({
          file: relative(rootDir, file).split(sep).join("/"),
          line: idx + 1,
          column: m.index + 1,
          rule: rule.id,
          severity: rule.severity,
          why: rule.why,
          value,
          context: rawLine.trim().slice(0, 160),
        });
      }
    }
  });
  return findings;
}

function detectTheme(dir) {
  for (const c of THEME_CANDIDATES) {
    const p = join(dir, c);
    if (existsSync(p)) return p;
  }
  return null;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const theme = opts.theme || detectTheme(opts.dir);
  const themeRel = theme
    ? relative(opts.dir, theme).split(sep).join("/")
    : null;

  const files = walk(opts.dir).filter((f) => {
    const rel = relative(opts.dir, f).split(sep).join("/");
    return !opts.ignore.some((g) => rel.includes(g));
  });

  const findings = files.flatMap((f) => scanFile(f, opts.dir));

  const byFile = {};
  const byRule = {};
  for (const f of findings) {
    (byFile[f.file] ||= []).push(f);
    byRule[f.rule] = (byRule[f.rule] || 0) + 1;
  }

  const report = {
    scannedFiles: files.length,
    themeFile: themeRel,
    totalFindings: findings.length,
    byRule,
    byFile: Object.fromEntries(
      Object.entries(byFile)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([k, v]) => [k, v.length]),
    ),
    findings,
  };

  if (opts.format === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\nScanned ${report.scannedFiles} files`);
    console.log(`Theme file: ${themeRel ?? "(not found — pass --theme)"}`);
    console.log(`Findings: ${report.totalFindings}\n`);
    if (report.totalFindings) {
      for (const [rule, n] of Object.entries(byRule).sort(
        (a, b) => b[1] - a[1],
      )) {
        console.log(`  ${String(n).padStart(4)}  ${rule}`);
      }
      console.log("");
      findings.slice(0, opts.max).forEach((f) => {
        console.log(
          `${f.file}:${f.line}:${f.column}  [${f.severity}] ${f.rule}`,
        );
        console.log(`    ${f.value}   ${f.context}`);
      });
      if (findings.length > opts.max) {
        console.log(
          `\n  ... and ${findings.length - opts.max} more (use --format json)`,
        );
      }
    }
    console.log("");
  }

  process.exit(findings.length ? 1 : 0);
}

main();
