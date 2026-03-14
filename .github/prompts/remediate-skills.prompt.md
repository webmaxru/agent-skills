---
name: "Remediate Skills"
description: "Fix agent skill issues under skills/ using the local skill-creator workflow. Use when applying remediation after validation, repairing metadata, tightening routing, improving progressive disclosure, or correcting skill structure and error handling."
argument-hint: "Optional input: a skill path, a validation report, or a remediation focus"
agent: "agent"
---

Remediate skill issues in this workspace, defaulting to `skills/` unless the user narrows the scope.

Use the local authoring skill as the source of truth:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before making edits.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Use [skill template](../../.agents/skills/skill-creator/assets/SKILL.template.md) only when comparing expected structure or section layout.

If the user provides a validation report, use it as the remediation backlog. If no report is provided, inspect the targeted skills first and determine the minimum necessary fixes.

For each skill in scope:
1. Inspect the skill directory, `SKILL.md`, and any related `scripts/`, `references/`, or `assets/` files.
2. Fix metadata issues in `SKILL.md` frontmatter:
   - `name` must match the folder name exactly
   - `description` must be specific, third-person, and include positive and negative triggers
   - avoid vague routing language and false-positive triggers
3. Fix authoring issues in `SKILL.md`:
   - use a clear numbered workflow
   - keep instructions in third-person imperative form
   - add explicit stop conditions when the skill does not apply
   - replace guesswork with deterministic instructions or script usage
   - keep file paths relative and use forward slashes
4. Improve progressive disclosure:
   - move bulky rules, dense examples, or templates into `references/` or `assets/` when needed
   - keep the main `SKILL.md` lean and procedural
5. Fix structural issues in the skill directory:
   - keep a flat hierarchy under `scripts/`, `references/`, and `assets/`
   - remove or avoid human-oriented files inside the skill directory
   - add missing standard folders only when the workflow requires them
6. Fix determinism and validation gaps:
   - add or preserve validation steps where applicable
   - ensure scripts are single-purpose CLIs with usable stdout and stderr expectations
   - tighten error handling for unsupported environments, missing prerequisites, and common failure modes
7. Avoid unrelated rewrites. Preserve the skill's intended domain behavior while correcting authoring defects.

After editing each skill:
1. Re-run the metadata validator with the exact final values:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "<name>" --description "<description>"
```

2. Re-check the skill against the checklist and confirm whether the result is `pass` or `warning`.
3. Summarize the fixes made, remaining risks, and any issues that still need human input.

When reporting results:
1. List the skills changed.
2. Summarize the root issues fixed.
3. Note any files created, moved, or removed.
4. Include any remaining warnings or blockers.

Do not invent missing product behavior or domain rules. If a skill lacks enough information to be corrected safely, stop and explain what is missing.