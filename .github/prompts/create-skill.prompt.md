---
name: "Create Skill"
description: "Run the repository's five-phase skill workflow: create a skill, validate and remediate it, create supporting saved prompts, update the global repository README, and test installation in the current repo with both supported install commands. Use when authoring a new skill end to end or when explicitly running one phase against an existing skill."
argument-hint: "Optional mode and inputs, for example: step=all, step=create, step=validate-remediate, step=supporting-prompts, step=readme-update, or step=install-test, plus a skill name, URLs, attached document notes, or pasted text"
agent: "agent"
---

Create or continue a skill workflow in this workspace.

The skill destination must be a new folder under `skills/` whose name exactly matches the final validated skill name.

Use the local `skill-creator` skill as the authoring source of truth for scaffolding and structure.

Required inputs before starting any workflow actions:
- For any run that includes phase 1, require all three inputs before starting skill work: skill name, skill scope, and at least one source material.
- For phase 3 run directly, require the skill name and source materials for the prompt content before creating or updating supporting prompts. Prefer URLs when available and ask for them if they are missing.
- If any required input is missing, stop and ask only for the missing input instead of starting the phase.

Execution modes:
- `step=all` is the default. Run all five phases below in order. All five phases are mandatory in this mode.
- `step=create` runs only phase 1 for a new skill.
- `step=validate-remediate` runs only phase 2 for an existing `skills/<skill-name>` directory.
- `step=supporting-prompts` runs only phase 3 for an existing `skills/<skill-name>` directory.
- `step=readme-update` runs only phase 4 for an existing `skills/<skill-name>` directory.
- `step=install-test` runs only phase 5 for an existing `skills/<skill-name>` directory.
- If the user omits `step`, treat the request as `step=all`.
- If the user explicitly selects one phase, do not run the other phases unless the user asks for them.
- If an explicit phase is missing prerequisites, stop and explain exactly what is missing instead of guessing.

Mandatory phases for `step=all`:
1. skill creation
2. skill validation and remediation
3. post-skill-creation supporting prompt creation
4. global repository README update
5. installation test in the current repository using both documented install commands

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before drafting the skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Read [skill template](../../.agents/skills/skill-creator/assets/SKILL.template.md) before drafting `SKILL.md`.
- Read [validate-skills prompt](./validate-skills.prompt.md), [remediate-skills prompt](./remediate-skills.prompt.md), [Prompt API update prompt](./prompt-api-skill-update.prompt.md), and [WebMCP demo prompt](./webmcp-create-demo-plain-html.prompt.md) as formatting references for the generated follow-up prompts.

Interaction order for any run that includes phase 1:
1. Ask for the skill name first.
2. After the user provides the name, ask for the skill scope.
3. After the user provides the scope, ask which source materials should drive the skill. Support any combination of:
   - one or more URLs
   - one or more attached documents
   - plain text notes pasted into chat
4. Do not start skill creation actions until the skill name, skill scope, and at least one source material are all available.
5. If the user included skill scope or source materials before providing the skill name, hold that context but still ask for the skill name first.
6. If the user included source materials before providing the skill scope, hold that context but still ask for the skill scope after the skill name.

Source priority for this workflow:
1. User-supplied text input overrides every other source.
2. Attached documents override URLs when they conflict.
3. URLs fill gaps not covered by higher-priority materials.

Phase 1: Skill Creation
Run this phase when `step=all` or `step=create`.

1. Gather the skill name, skill scope, and source materials in the required interaction order above.
2. Do not begin phase 1 actions until all required inputs are present.
3. Read the supplied materials and extract only the constraints, API details, workflow steps, stop conditions, and compatibility notes that materially affect the skill within the requested scope.
4. Use the `skill-creator` guidance to scaffold `skills/<skill-name>/` with only the standard flat structure needed for this skill:
   - `SKILL.md`
   - `references/`
   - `assets/`
   - `scripts/`
5. Keep `SKILL.md` lean and procedural. Move bulky examples, schemas, templates, and dense compatibility notes into `references/` or `assets/`.
6. Draft a routing-focused description that includes both positive and negative triggers.
7. Run the metadata validator with the exact final values before finalizing the scaffold:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "<skill-name>" --description "<final description>"
```

8. If metadata validation fails, correct the metadata and re-run the validator until it passes.
9. Do not add human-oriented files such as `README.md` or `CHANGELOG.md` inside the skill directory.
10. If the provided materials are not sufficient to author the skill safely, stop and explain exactly what is missing instead of guessing.

Phase 2: Skill Validation And Remediation
Run this phase when `step=all` or `step=validate-remediate`.

1. Confirm that `skills/<skill-name>` exists. If this phase was invoked directly and the skill name is missing, ask for it.
2. Validate the skill using the same repository rules and reporting standard as [validate-skills prompt](./validate-skills.prompt.md), scoped to `skills/<skill-name>`.
3. If validation reports mistakes, warnings, or failures that can be fixed safely, remediate them immediately using the same repository rules as [remediate-skills prompt](./remediate-skills.prompt.md), scoped to `skills/<skill-name>`.
4. Re-run validation after remediation.
5. Repeat the validate-remediate loop until the skill passes or the remaining blocker requires human input.
6. In `step=all`, do not present validation or remediation as optional.
7. If the remaining blocker requires human input, stop and explain the exact missing, conflicting, or ambiguous material.

Phase 3: Post-Skill-Creation Supporting Prompt Creation
Run this phase when `step=all` or `step=supporting-prompts`.

1. Confirm that `skills/<skill-name>` exists. If this phase was invoked directly and the skill name is missing, ask for it.
2. Require source materials for the supporting prompt content before starting this phase. Prefer URLs when available and ask for them if they are missing.
3. Do not create or update supporting prompts until both the skill name and the source materials are available.
4. In `step=all`, run this phase only after phase 2 completes.
5. Create these two saved prompts under `.github/prompts/` using the reference prompts listed above as structural guides.
6. If this phase is invoked directly for an existing skill, create the prompts if they are missing and update them only if the current skill makes the existing prompt content materially wrong.

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

5. In `step=all`, do not present supporting prompt creation as optional.

Phase 4: Global Repository README Update
Run this phase when `step=all` or `step=readme-update`.

1. Confirm that `skills/<skill-name>` exists. If this phase was invoked directly and the skill name is missing, ask for it.
2. Read `README.md` and update only the sections that materially need changes for the new skill and its generated prompts.
3. Add the new skill to `Included Skills` with a concise scope summary and support-file overview that matches the level of detail used for the existing skills.
4. Add install instructions for the new skill under `Install Skills` using both supported repository patterns when they apply:
   - an `apm install owner/repo/skills/<skill-name>` example
   - an `npx skills add owner/repo --skill <skill-name>` example
5. Update the `.github/prompts` supporting-assets section so the newly generated saved prompts are listed with accurate one-line descriptions.
6. If phase 3 created a plain HTML demo prompt and the skill is browser-demoable, update any README overview text that should mention the new demo workflow without treating `artifacts/` as durable source of truth.
7. Keep the README aligned with repository rules:
   - list only real `skills/` entries under `Included Skills`
   - describe `artifacts/` as disposable
   - assume README install examples describe the intended published repository state; do not add qualifiers such as "after the updated repository revision is published" unless the user explicitly asks for unpublished-local wording
   - do not invent install paths, package names, or prompt capabilities not established by the created files
8. In `step=all`, run this phase only after phase 3 completes.
9. If the new skill cannot be installed through one of the documented patterns, stop and explain the exact limitation instead of guessing.

Phase 5: Install Test In Current Repository
Run this phase when `step=all` or `step=install-test`.

1. Confirm that `skills/<skill-name>` exists. If this phase was invoked directly and the skill name is missing, ask for it.
2. Read the install commands added to `README.md` for the new skill and use those exact command shapes as the source of truth for testing.
3. Run both installation paths in the current repository to verify the documented commands actually work for this skill:
   - `apm install owner/repo/skills/<skill-name>`
   - `npx skills add owner/repo --skill <skill-name>`
4. Treat this as a real verification step, not a dry run. Use the current workspace as the install target unless the user explicitly asks for a different target.
5. If one install path modifies repo-level manifests or lockfiles while the other does not, report the exact files changed and keep only the minimal resulting changes required for the repo's documented workflow.
6. If either install command fails, capture the exact failure, remediate only if the fix is safe and directly related to the new skill or documented install path, then re-run the failed command once.
7. In `step=all`, run this phase only after phase 4 completes so the tested commands match the documented README commands.
8. If testing one install path would be unsafe or impossible in the current repo, stop and explain the exact blocker instead of claiming success.

When reporting results:
1. State the requested `step` and which phases ran.
2. Summarize the skill that was created or updated and the materials used.
3. List the files created or changed under `skills/<skill-name>/`.
4. State whether metadata validation passed.
5. State the validation and remediation outcome: no fixes needed, fixes applied, or blocked.
6. List the generated or updated saved prompts under `.github/prompts/`.
7. State whether `README.md` was updated and summarize the install and prompt-documentation changes.
8. State the installation test outcome for both `apm` and `npx skills add`, including whether either command required remediation.
9. Call out any unresolved gaps caused by missing, conflicting, or ambiguous source material.
10. For `step=all`, make it explicit whether all five mandatory phases completed.