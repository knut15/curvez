---
name: migrate-design-tokens
description: Scan a codebase for hardcoded colors (raw hex, rgb/hsl calls, Tailwind arbitrary values like bg-[#1a1a1a], and palette utilities like text-slate-500), map each one to a shadcn/ui semantic token, apply the replacements, and verify every light/dark token pair meets WCAG contrast. Use this whenever the user mentions design tokens, theming, hardcoded colors, dark mode inconsistency, "our colors are all over the place", migrating to shadcn, or auditing a UI for color/contrast problems — even if they don't use the word "token".
---

# Migrate design tokens

Move a codebase from scattered color literals to a shadcn/ui semantic token
layer, then prove the result is accessible.

Two scripts do the mechanical work. Your job is the part that needs judgment:
deciding which semantic token each color _means_. Do not try to find colors by
reading files yourself — the scanner is exhaustive and cheap, and eyeballing
misses cases in string concatenation and class-variance-authority maps.

## Workflow

### 1. Locate the token layer

Find the theme file — usually `app/globals.css`, `src/app/globals.css`, or
`src/index.css`. Confirm it defines tokens under `:root` and `.dark`.

If there is no token layer at all, say so and stop. This skill migrates _to_ an
existing token system; it does not invent a color scheme. Offer to set up a base
shadcn theme first (`npx shadcn@latest init`) and resume afterwards.

### 2. Scan

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/migrate-design-tokens/scripts/scan-hardcoded-colors.mjs <dir> --format json
```

Findings carry a `rule` and a `severity`:

| rule                | meaning                                                      | default action              |
| ------------------- | ------------------------------------------------------------ | --------------------------- |
| `arbitrary-utility` | `bg-[#1a1a1a]` — invisible to theming and dark mode          | replace                     |
| `hex-literal`       | raw `#fafafa` in JSX, inline style, or CSS                   | replace                     |
| `color-function`    | raw `rgb()` / `hsl()` / `oklch()` outside a token definition | replace                     |
| `palette-utility`   | `text-slate-200` — a real color, just not a semantic one     | replace, but confirm intent |

The scanner deliberately does **not** flag raw colors assigned to custom
properties (`--primary: oklch(...)`). Those _are_ the token definitions.

Exit code is 1 when anything is found, so the same command works as a CI gate.

### 3. Propose a token map before changing anything

This is the step that requires you, and it is the step where a wrong guess is
expensive. Group the findings by distinct color value, not by file — the same
hex usually appears many times and should resolve to one token.

For each distinct color, propose a mapping and state your reasoning in one
line. Read `references/token-map.md` for the semantic meaning of each shadcn
token and the common mapping traps.

Present the map as a table and **wait for confirmation**:

```
#1a1a1a   (14 uses)  → bg-card          surface behind grouped content
text-slate-200 (9)   → text-foreground  default body copy on dark surfaces
text-gray-500  (6)   → text-muted-foreground   secondary/caption text
#ff0055        (2)   → bg-destructive   only used on delete confirmations
oklch(0.7 0.1 120)(1) → ???             one-off brand accent, no token fits
```

Rules for building the map:

- **One color can map to several tokens depending on role.** The same grey may
  be `border` in one place and `muted` in another. Split by usage, not by value.
- **Never invent a new semantic token silently.** If nothing fits, mark it `???`
  and ask. Adding `--brand-accent` is a design decision, not a refactor.
- **Leave genuinely one-off decoration alone.** Gradients, illustration fills,
  chart series with their own `--chart-N` tokens, and third-party embed styling
  are not token violations. Say why you're skipping them.
- **Flag anything whose light/dark behaviour would change.** Replacing a fixed
  hex with a token means it now flips in dark mode. That is usually the point,
  but call it out for surfaces the user may have intended to stay fixed.

### 4. Apply

Replace only what was confirmed. Keep edits mechanical — one color mapping at a
time — so the diff stays reviewable.

Then re-run the scanner. Remaining findings should be exactly the ones you
deliberately skipped. If new ones appear, you introduced them.

### 5. Verify contrast

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/migrate-design-tokens/scripts/check-contrast.mjs <theme.css>
```

Every `--x` / `--x-foreground` pair is checked in both light and dark against
WCAG 2.1: 4.5:1 for body text, 3:1 for `muted`, `border`, `input`, and `ring`,
which carry large text and non-text UI. Override with `--min` / `--large`.

Failures here are usually pre-existing, not something the migration caused —
say so explicitly, since the user will otherwise assume you broke it. Report
each failure with its ratio and the two token values, and propose a corrected
value. **Do not change token values on your own.** Adjusting `--primary` shifts
the entire product's appearance and belongs to the user.

A failing pair is not always a bug: a token that is never used as a text
background (a decorative `--chart-3`, say) can legitimately fail. Check whether
the pair is actually rendered as text before insisting on a fix.

## Report

Always close with this structure:

```
## Scanned
<n> files, <n> findings across <n> distinct colors

## Replaced
<color> → <token>  (<n> occurrences, <n> files)

## Skipped
<color> — <reason>

## Contrast
<n> pairs checked, <n> failing
<pair>  <ratio> (needs <threshold>)  — <light|dark>

## Needs your decision
<anything marked ??? or any token value change proposed>
```

Keep it short. The user wants the delta and the open questions, not a
narration of the steps.

## Notes

- Scripts need Node 18+. No dependencies, nothing to install.
- `--ignore <substring>` skips paths; useful for generated files and vendored
  components that will be replaced wholesale anyway.
- Tailwind v3 themes store tokens as bare HSL triples (`--background: 0 0% 100%`).
  The contrast checker handles that form as well as `oklch()`, hex, `rgb()`,
  and `hsl()`.
- On a large codebase, scan a single directory first (`src/components/ui`) to
  confirm the mapping approach before running the whole tree.
