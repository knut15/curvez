# shadcn/ui token semantics

Read this when building the token map in step 3. The goal is to pick the token
that matches what the color _means_, not the one whose current value happens to
be closest.

## The three layers

```
Primitive   oklch(0.55 0.20 260)     a color
   ↓
Semantic    --primary                a role
   ↓
Component   bg-primary               a usage
```

Components reference semantics, never primitives. A migration that replaces
`bg-[#1a1a1a]` with a new `--color-charcoal` token has moved the problem, not
solved it: the next dark-mode change still has to touch component code.

## Token reference

### Surfaces

| Token                            | Meaning                                     | Typical use                           |
| -------------------------------- | ------------------------------------------- | ------------------------------------- |
| `background` / `foreground`      | The page itself and default text on it      | `body`, page shells                   |
| `card` / `card-foreground`       | A grouped surface sitting on the background | cards, panels, table containers       |
| `popover` / `popover-foreground` | A floating surface above everything         | dropdowns, tooltips, command palettes |

`card` and `popover` often share a value in light mode and diverge in dark mode.
Map by what the element _is_, not by whether the current colors match.

### Emphasis

| Token                                    | Meaning                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `primary` / `primary-foreground`         | The main action. One per view, ideally                                  |
| `secondary` / `secondary-foreground`     | A supporting action of equal structural weight, lower emphasis          |
| `accent` / `accent-foreground`           | Transient highlight — hover, focus, selected row                        |
| `muted` / `muted-foreground`             | De-emphasis — disabled surfaces, captions, timestamps, placeholder copy |
| `destructive` / `destructive-foreground` | Irreversible or damaging actions                                        |

### Structure

| Token    | Meaning                                                                 |
| -------- | ----------------------------------------------------------------------- |
| `border` | Dividing lines and outlines                                             |
| `input`  | Form control borders (often equals `border`, but changes independently) |
| `ring`   | Focus indicator                                                         |
| `radius` | Corner rounding scale, not a color                                      |

### Extensions

`--chart-1` through `--chart-5` for data series, and the `--sidebar-*` family
mirroring the surface/emphasis tokens for a sidebar region. Both are legitimate
targets; neither should be invented if the project doesn't already define them.

## Mapping traps

**Grey is not one thing.** A codebase's greys usually split three ways:
`muted-foreground` (secondary text), `border` (lines), `muted` (inert
surfaces). Mapping all greys to a single token flattens the hierarchy and is
the most common way this migration goes wrong.

**`accent` is not "brand color".** Its name misleads. In shadcn it is the hover
and selection state, not a brand accent. A brand color almost always maps to
`primary`.

**`secondary` is not "the second brand color".** It is a lower-emphasis action
surface. A teal that pairs with a blue primary is usually still `primary` in a
different context, or a new token the user must decide on.

**Semantic status colors often have no token.** Success and warning are not in
the shadcn default set. Do not force green onto `primary` or amber onto
`destructive`. Mark them `???` and let the user add `--success` / `--warning`
if they want them — the docs describe adding a token under `:root` and `.dark`
and exposing it via `@theme inline`.

**Dark mode is where mistakes surface.** A hardcoded `#fff` text color looks
fine in light mode and becomes invisible on a dark card. When a finding is a
near-white or near-black literal, the correct token is almost always the
matching `-foreground`, and the fix is more valuable than it looks.

**Opacity modifiers survive the migration.** `bg-black/5` becomes
`bg-foreground/5` or `bg-muted`, depending on whether the intent was "a faint
wash of the text color" or "an inert surface". Ask if it isn't obvious.

## Adding a token, when the user asks for one

Define the value in both blocks, then expose it to Tailwind:

```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

`bg-warning` and `text-warning-foreground` become available. Re-run the
contrast check afterwards — a new pair is a new pair to verify.
