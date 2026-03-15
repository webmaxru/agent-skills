This repository contains a small working set of agent skills and support assets that follow the agentskills.io style: lean `SKILL.md` files, progressive disclosure through `references/` and `assets/`, and deterministic helper scripts where guessing would be brittle.

Repository layout:

- `skills/prompt-api/` is the main production-style example skill for browser Prompt API integrations in JavaScript or TypeScript web apps.
- `.agents/skills/skill-creator/` is the local authoring skill used to create, validate, and review skills in this repository.
- `artifacts/*` might contain disposable demos for testing skills. Never use this folder for any persistent asset, because it is ignored by Git and may be deleted without warning.
- `.github/prompts/` contains maintenance prompts for validating skills, remediating skill issues, updating the Prompt API skill, and recreating the demo artifact.

When working in this repo:

1. Treat skills as agent-facing control files, not human documentation bundles.
2. Keep each skill directory flat under `scripts/`, `references/`, and `assets/`.
3. Match the skill folder name and the YAML `name` field exactly.
4. Keep `SKILL.md` lean and procedural; move bulky rules, examples, and templates into `references/` or `assets/`.
5. Use relative paths with forward slashes in skill files.
6. Do not add per-skill human-oriented files such as `README.md` or `CHANGELOG.md`.
7. When creating or revising a skill, use `.agents/skills/skill-creator/scripts/validate-metadata.py` and `.agents/skills/skill-creator/references/checklist.md` as the repository's validation path.
8. For saved maintenance prompts that gather external information, request sources in this priority order unless the prompt explicitly says otherwise: supplied prompt text, supplied attached documents, then the built-in URLs already defined in the prompt. Higher-priority sources override lower-priority sources.