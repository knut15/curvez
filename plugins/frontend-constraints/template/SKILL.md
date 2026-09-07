---
name: skill-name-in-kebab-case
description: What this skill does, in one sentence starting with a verb. Then when to use it — list the phrases and situations that should trigger it, including ones that don't use the skill's own vocabulary. This field is the entire triggering mechanism; the body is never consulted when deciding whether to load the skill.
---

# Skill name

One paragraph: what problem this solves and what the finished state looks like.

State up front which parts are handled by scripts and which need judgment. The
model should not re-derive by hand what a script already computes.

## Workflow

### 1. <first step>

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/<skill-name>/scripts/<script>.mjs <args>
```

### 2. <step that needs judgment>

Say what to present to the user and when to wait for confirmation. Irreversible
or opinionated changes need a checkpoint here.

### 3. <verification>

Every skill in this repo ends by checking its own work. A skill that can't
verify its output is a prompt, not a constraint.

## Report

Fixed output template so results are comparable between runs.

## Notes

Dependencies, flags, and the cases where this skill should decline to act.
