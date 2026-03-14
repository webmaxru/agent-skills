---
name: "Validate Skills"
description: "Perform a detailed validation of agent skills under skills/ using the local skill-creator workflow. Use when reviewing skill metadata, structure, routing quality, progressive disclosure, hallucination gaps, and authoring compliance."
argument-hint: "Optional scope, for example: all skills, skills/prompt-api, or a specific validation focus"
agent: "agent"
---

Validate the skills in this workspace, defaulting to `skills/` unless the user narrows the scope.

Use the local authoring skill as the source of truth:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before evaluating any skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before writing the final report.
- Use [skill template](../../.agents/skills/skill-creator/assets/SKILL.template.md) only when comparing structure or expected sections.

For each skill in scope:
1. Inspect the skill directory structure and confirm it follows the expected flat layout: `SKILL.md`, `scripts/`, `references/`, and `assets/` where applicable.
2. Read the YAML frontmatter in `SKILL.md` and verify that the `name` matches the folder name exactly.
3. Run the metadata validator with the exact extracted values:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "<name>" --description "<description>"
```

4. Review the `description` for routing quality:
   - clear positive triggers
   - explicit negative triggers
   - no vague or overly broad phrasing
   - no wording that forces false positives
5. Review `SKILL.md` for authoring quality:
   - third-person imperative instructions
   - progressive disclosure instead of bloated inline detail
   - concrete file paths using relative paths and forward slashes
   - deterministic steps where fragile logic should be delegated to scripts
   - explicit stop conditions when the skill does not apply
   - no hallucination gaps that force the agent to guess
6. Check whether large schemas, verbose guidance, or dense examples should move into `references/` or `assets/`.
7. Identify missing validation, missing prerequisites, brittle assumptions, unsupported environments, or incomplete error handling.

Produce a detailed validation report with this structure:
1. Scope reviewed
2. Overall verdict per skill: `pass`, `warning`, or `fail`
3. Findings ordered by severity, with file references and concise reasoning
4. Metadata validator results
5. Structural issues
6. Logic and routing issues
7. Recommended fixes, prioritized

Do not edit files unless the user explicitly asks for remediation after the report.