---
name: "Create Skill"
description: "Create a new agent skill under skills/ from URLs, attached documents, or user-supplied text, then optionally validate and remediate it and generate follow-up maintenance prompts."
argument-hint: "Optional: initial skill idea, target API, URLs, attached document notes, or text to base the skill on"
agent: "agent"
---

Create a new skill in this workspace.

The skill destination must be a new folder under `skills/` whose name exactly matches the final validated skill name.

Use the local `skill-creator` skill as the authoring source of truth for scaffolding and structure.

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before drafting the skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Read [skill template](../../.agents/skills/skill-creator/assets/SKILL.template.md) before drafting `SKILL.md`.
- Read [validate-skills prompt](./validate-skills.prompt.md), [remediate-skills prompt](./remediate-skills.prompt.md), [Prompt API update prompt](./prompt-api-skill-update.prompt.md), and [WebMCP demo prompt](./webmcp-create-demo-plain-html.prompt.md) as formatting references for the generated follow-up prompts.

Required interaction order:
1. Ask for the skill name first.
2. After the user provides the name, ask which source materials should drive the skill. Support any combination of:
   - one or more URLs
   - one or more attached documents
   - plain text notes pasted into chat
3. Do not scaffold the skill until both the skill name and at least one source material are available.

Source priority for this workflow:
1. User-supplied text input overrides every other source.
2. Attached documents override URLs when they conflict.
3. URLs fill gaps not covered by higher-priority materials.

Skill creation workflow:
1. Gather the skill name and source materials in the required interaction order above.
2. Read the supplied materials and extract only the constraints, API details, workflow steps, stop conditions, and compatibility notes that materially affect the skill.
3. Use the `skill-creator` guidance to scaffold `skills/<skill-name>/` with only the standard flat structure needed for this skill:
   - `SKILL.md`
   - `references/`
   - `assets/`
   - `scripts/`
4. Keep `SKILL.md` lean and procedural. Move bulky examples, schemas, templates, and dense compatibility notes into `references/` or `assets/`.
5. Draft a routing-focused description that includes both positive and negative triggers.
6. Run the metadata validator with the exact final values before finalizing the scaffold:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "<skill-name>" --description "<final description>"
```

7. If metadata validation fails, correct the metadata and re-run the validator until it passes.
8. Do not add human-oriented files such as `README.md` or `CHANGELOG.md` inside the skill directory.
9. If the provided materials are not sufficient to author the skill safely, stop and explain exactly what is missing instead of guessing.

Post-creation workflow:
1. After creating the skill, offer to run [validate-skills prompt](./validate-skills.prompt.md) scoped to `skills/<skill-name>`.
2. If the user accepts and validation reports mistakes, warnings, or failures, offer to run [remediate-skills prompt](./remediate-skills.prompt.md) scoped to `skills/<skill-name>`.
3. If remediation runs, offer to re-run validation on the same scope so the user can confirm the fixes.

Generated follow-up prompts:
After the skill is created and the validation or remediation decision path above is complete, create these two saved prompts under `.github/prompts/` using the reference prompts listed above as structural guides.

1. `<skill-name>-skill-update.prompt.md`
   Requirements:
   - updates `skills/<skill-name>` periodically based on newly supplied URLs, attached documents, or text input
   - follows the same source priority used in this creation workflow
   - reads repository conventions and the local `skill-creator` guidance before editing
   - updates only files that materially need changes
   - validates the final metadata
   - reports changed files, material deltas, source-priority conflicts, overrides from user text, and remaining risks

2. `<skill-name>-create-demo-plain-html.prompt.md`
   Requirements:
   - creates a minimal plain HTML, CSS, and JavaScript demo under `artifacts/<skill-name>/`
   - uses the created skill as the primary implementation guide for the API or browser feature it covers
   - avoids frameworks and build tooling unless the user explicitly asks for them
   - keeps the demo visibly usable by a human
   - includes a small visible status area for API or environment availability when that concept applies
   - validates the artifact using the simplest preview or run path already available in the workspace
   - if the created skill does not describe a browser-usable API that can be demonstrated with a plain web page, stop and explain that limitation instead of inventing a demo

When reporting results:
1. Summarize the skill that was created and the materials used.
2. List the files created or changed under `skills/<skill-name>/`.
3. State whether metadata validation passed.
4. State whether validation and remediation were offered, accepted, and completed.
5. List the generated saved prompts under `.github/prompts/`.
6. Call out any unresolved gaps caused by missing, conflicting, or ambiguous source material.