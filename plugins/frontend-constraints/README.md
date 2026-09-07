# Frontend Constraint Skills

Skills that hold AI-written frontend code to the rules your project already has.

Most agent skills generate. These check. Each one ships a deterministic script
that finds violations, and a SKILL.md that tells the model what to do about
them — so the answer is a list of specific findings you can act on, not a
plausible-sounding paragraph.

Works with Claude Code, Cursor, Codex, and anything else that reads `SKILL.md`.

---

## Skills

| Skill                                                            | What it does                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`migrate-design-tokens`](skills/migrate-design-tokens/SKILL.md) | Finds hardcoded colors — raw hex, `rgb()`/`hsl()`, `bg-[#1a1a1a]`, `text-slate-500` — maps each to a shadcn/ui semantic token, applies the replacements, then verifies every light/dark token pair against WCAG contrast |

More on the way: package boundary enforcement, public API surface checks.

---

## What it needs

`migrate-design-tokens` migrates _to_ an existing shadcn/ui token layer. It does
not invent a color scheme. Your theme file needs `--x` / `--x-foreground` pairs:

```css
:root { --background: ...; --foreground: ...; --muted: ...; --muted-foreground: ...; }
.dark  { --background: ...; --foreground: ...; ... }
```

No token layer means no migration — the skill says so and stops. Run
`npx shadcn@latest init` first, then come back.

**On a project that isn't shadcn**, the two scripts part ways:

- The **scanner** still works. Any color assigned to a custom property counts as
  a definition, not a violation, so a plain CSS-variable theme scans cleanly and
  only real hardcoded values get flagged.
- The **contrast checker** does not. It pairs tokens by the `--x-foreground`
  naming convention. A theme with its own names — `--color-text` against
  `--color-bg` — gives you `0 passing`, because nothing can be paired by name.

Use the scanner on its own there.

---

## What the output looks like

Scanning a project:

```
Scanned 3 files
Theme file: app/globals.css
Findings: 11

     4  palette-utility
     3  color-function
     2  hex-literal
     2  arbitrary-utility

components/ui/card.tsx:3:32  [high] arbitrary-utility
    bg-[#1a1a1a]   <div className="rounded-lg bg-[#1a1a1a] p-4 text-slate-200 ...
components/ui/card.tsx:4:28  [high] hex-literal
    #fafafa        <h2 style={{ color: '#fafafa' }}>{title}</h2>
```

Checking the theme afterwards:

```
LIGHT
  19.79  background / foreground                    pass (needs 4.5)
    1.6  muted / muted-foreground                   FAIL (needs 3)

DARK
   2.77  destructive / destructive-foreground       FAIL (needs 4.5)
```

Both scripts exit non-zero when they find something, so the same commands work
as a CI gate.

---

## Install

**Claude Code** — as a plugin, two commands:

```
/plugin marketplace add knut15/frontend-constraint-skills
/plugin install frontend-constraints
```

Then just describe what you want: _"our colors are hardcoded everywhere, clean
this up"_.

**Any other tool** — copy the skill folder to wherever your tool reads project
rules:

| Tool                 | Path                            |
| -------------------- | ------------------------------- |
| Claude Code (manual) | `.claude/skills/<skill-name>/`  |
| Cursor               | `.cursor/rules/<skill-name>.md` |
| Codex                | `AGENTS.md`                     |
| Windsurf             | `.windsurfrules`                |
| Cline                | `.clinerules`                   |

```bash
git clone https://github.com/knut15/frontend-constraint-skills /tmp/fcs
mkdir -p .claude/skills
cp -r /tmp/fcs/skills/migrate-design-tokens .claude/skills/
```

**Claude.ai** — upload the skill's `SKILL.md` to a Project, or attach it to a
chat and say _"follow this"_.

---

## How a run goes

Once installed you never name the skill. Its `description` is the trigger, so it
loads when you say something the skill covers, in whatever words you'd normally
use:

> _"our colors are all over the place"_ · _"dark mode is inconsistent"_ ·
> _"move this to shadcn tokens"_ · _"audit the UI for contrast problems"_

Five steps follow. **Two of them stop and wait for you.**

|     | Step                    |                                       |
| --- | ----------------------- | ------------------------------------- |
| 1   | Locate the token layer  | stops here if there isn't one         |
| 2   | Scan                    |                                       |
| 3   | **Propose a token map** | **waits for your confirmation**       |
| 4   | Apply, then re-scan     | new findings mean it introduced them  |
| 5   | Check contrast          | **reports, never edits token values** |

Step 3 is why this is a skill and not just a script. The same grey is `border`
in one place and `muted` in another, and only you know which. So it groups
findings by distinct color and presents a table:

```
#1a1a1a   (14 uses)  → bg-card                  surface behind grouped content
text-gray-500  (6)   → text-muted-foreground    secondary/caption text
oklch(0.7 0.1 120)(1) → ???                     one-off brand accent, no token fits
```

`???` means nothing fits. Adding `--brand-accent` is a design decision, not a
refactor, so it asks instead of inventing one. Genuine one-offs — gradients,
illustration fills, chart series — get skipped with a stated reason rather than
forced into a token.

Step 5 reports failing pairs with their ratios and proposes corrected values,
but changes nothing. Editing `--primary` shifts the entire product's appearance.
Most failures also predate the migration, and the skill is told to say so —
otherwise the obvious reading is that it broke your theme.

---

## Running the scripts directly

They have no dependencies and need only Node 18+, so they work without any
agent at all:

```bash
node skills/migrate-design-tokens/scripts/scan-hardcoded-colors.mjs ./src --format json
node skills/migrate-design-tokens/scripts/check-contrast.mjs ./src/app/globals.css --min 4.5
```

---

## Adding a skill

Copy `template/SKILL.md` into `skills/<name>/`, then add an entry to
`.claude-plugin/marketplace.json` and to the table above. Keep `SKILL.md` under
500 lines — anything longer belongs in `references/`, which loads only when the
model needs it.

Validate before committing:

```bash
claude plugin validate .
```

The house rule for this repo: **a skill must be able to check its own work.**
If it can't tell you whether it succeeded, it's a prompt, not a constraint.

---

## License

MIT. Use it, fork it, ship it, sell what you build with it.
