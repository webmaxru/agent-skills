# Agent Skills for Web AI

This repository is a working collection of agent skills and support assets for cutting-edge web AI APIs, built around the agentskills.io style: lean `SKILL.md` files, progressive disclosure through `references/` and `assets/`, and deterministic helper scripts where guessing would be brittle.

For APIs such as the browser Prompt API and WebMCP, staying close to the latest specification is not optional. These surfaces are still evolving, implementation details can move, and some behaviors remain ambiguous across drafts, browser previews, and ecosystem guidance. The point of these custom skills is to reduce that ambiguity so generated or assisted code follows the newest public specification state as closely as possible instead of relying on stale examples or improvised assumptions.

I actively update these skills to track the latest specification and platform changes. That work is informed by participation in the [W3C Web Machine Learning Community Group](https://www.w3.org/groups/cg/webmachinelearning/), where these APIs are discussed in the open, and by my work as a [Google Developer Expert in Web Technologies](https://developers.google.com/community/experts).

The repository has three practical roles:

1. Provide production-style example skills for browser Prompt API and WebMCP integrations.
2. Provide a local authoring workflow for creating, validating, and reviewing additional skills.
3. Keep disposable demos and research artifacts separate from persistent skill assets.

## Repository Layout

```text
.
|-- AGENTS.md
|-- README.md
|-- .gitignore
|-- .agents/
|   `-- skills/
|       `-- skill-creator/
|           |-- SKILL.md
|           |-- assets/
|           |   `-- SKILL.template.md
|           |-- references/
|           |   `-- checklist.md
|           `-- scripts/
|               `-- validate-metadata.py
|-- .github/
|   `-- prompts/
|       |-- create-skill.prompt.md
|       |-- prompt-api-create-chat-demo-plain-html.prompt.md
|       |-- prompt-api-skill-update.prompt.md
|       |-- remediate-skills.prompt.md
|       |-- validate-skills.prompt.md
|       |-- webmcp-create-demo-plain-html.prompt.md
|       `-- webmcp-skill-update.prompt.md
`-- skills/
    |-- prompt-api/
    |   |-- SKILL.md
    |   |-- assets/
    |   |   `-- language-model-service.template.ts
    |   |-- references/
    |   |   |-- compatibility.md
    |   |   |-- examples.md
    |   |   |-- polyfills.md
    |   |   |-- prompt-api-reference.md
    |   |   `-- troubleshooting.md
    |   `-- scripts/
    |       `-- find-frontend-targets.mjs
    `-- webmcp/
        |-- SKILL.md
        |-- assets/
        |   `-- model-context-registry.template.ts
        |-- references/
        |   |-- compatibility.md
        |   |-- declarative-api.md
        |   |-- troubleshooting.md
        |   `-- webmcp-reference.md
        `-- scripts/
            `-- find-webmcp-targets.mjs
```

## Included Skills

### `skills/prompt-api`

This is the main production-style example skill in the repository. It is scoped to browser Prompt API work in JavaScript or TypeScript web apps.

It covers:

- identifying the correct frontend target in a workspace
- confirming Prompt API viability before code changes
- implementing a guarded session wrapper around `LanguageModel`
- wiring download, ready, sending, and fallback UX states
- validating integrations and handling browser-specific failures

Its support files are split by purpose:

- `references/prompt-api-reference.md` for API surface, validation rules, and platform constraints
- `references/examples.md` for valid prompt shapes and implementation patterns
- `references/compatibility.md` for availability, flags, typings, and breaking-change mapping
- `references/polyfills.md` for native-first polyfill strategies and backend configuration
- `references/troubleshooting.md` for runtime failure cases such as missing `LanguageModel`, iframe issues, and stale session cleanup
- `assets/language-model-service.template.ts` for a reusable wrapper template
- `scripts/find-frontend-targets.mjs` for deterministic scanning of likely web entry points and Prompt API markers

### `skills/webmcp`

This skill is scoped to browser WebMCP integrations in JavaScript or TypeScript web apps.

It covers:

- identifying the correct browser app surface for WebMCP work
- choosing between imperative `navigator.modelContext` tools and declarative form annotations
- implementing guarded registration and cleanup for page-hosted tools
- handling preview-specific agent-invoked form flows without making them the portability baseline
- validating WebMCP behavior against the current Chrome preview and public draft

Its support files are split by purpose:

- `references/webmcp-reference.md` for core WebMCP concepts, API semantics, and registration rules
- `references/declarative-api.md` for declarative form annotations, submit handling, and related preview behavior
- `references/compatibility.md` for Chrome preview requirements, removed surfaces, and draft-versus-preview differences
- `references/troubleshooting.md` for missing `navigator.modelContext`, registration failures, and stale UI issues
- `assets/model-context-registry.template.ts` for a reusable imperative registration helper
- `scripts/find-webmcp-targets.mjs` for deterministic scanning of likely web entry points and WebMCP markers

### `.agents/skills/skill-creator`

This local authoring skill is the repository source of truth for creating and reviewing skills.

It includes:

- `SKILL.md` with the authoring procedure
- `scripts/validate-metadata.py` for metadata validation
- `assets/SKILL.template.md` as a starting point for new skills
- `references/checklist.md` for final review

Use it when creating or revising agent skills. Do not use it for generic repository documentation or other non-skill content.

## Supporting Assets

### `.github/prompts`

These prompt files support maintenance workflows in this repo:

- `create-skill.prompt.md` runs a three-phase workflow for a skill under `skills/`: creation, validation and remediation, and supporting prompt creation; it also supports explicit single-phase execution through a `step=` selector
- `validate-skills.prompt.md` reviews skills against the local authoring workflow
- `remediate-skills.prompt.md` applies targeted fixes to skills
- `prompt-api-skill-update.prompt.md` refreshes the Prompt API skill from current docs and user-supplied updates
- `webmcp-skill-update.prompt.md` refreshes the WebMCP skill from user-supplied updates, attachments, and the current specification state
- `prompt-api-create-chat-demo-plain-html.prompt.md` recreates or extends a plain HTML Prompt API demo under `artifacts/prompt-api/`
- `webmcp-create-demo-plain-html.prompt.md` creates or recreates a plain HTML WebMCP demo under `artifacts/webmcp/`

### `artifacts/`

`artifacts/` is intentionally disposable and ignored by Git. Use it for temporary demos, experiments, and working reference files that should not become part of the persistent skill surface.

Current workspace contents include:

- `artifacts/prompt-api/` with a plain HTML Prompt API demo (`index.html`, `styles.css`, `app.js`)
- `artifacts/webmcp/` as the target folder for generated WebMCP demo artifacts

Do not move durable templates, references, or skill logic into `artifacts/`.

## Repository Conventions

When adding or revising a skill here, keep these rules intact:

1. The skill directory name must match the YAML `name` exactly.
2. Skill descriptions should be precise enough to route correctly and include both positive and negative triggers.
3. `SKILL.md` should stay lean, procedural, and agent-oriented.
4. Large examples, verbose rules, and schemas belong in `references/` or `assets/`.
5. File paths inside skills should stay relative and use forward slashes.
6. Skill folders should remain flat under `scripts/`, `references/`, and `assets/`.
7. Human-oriented files such as per-skill `README.md` or `CHANGELOG.md` should not be added inside skill directories.
8. The validation path for new or revised skills is `.agents/skills/skill-creator/scripts/validate-metadata.py` plus `.agents/skills/skill-creator/references/checklist.md`.

## Common Workflows

### Validate Skill Metadata

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py \
  --name "your-skill-name" \
  --description "Describes what the skill does, when to use it, and when not to use it."
```

The validator checks naming rules, description length, and whether the description leaks first- or second-person phrasing.

### Scan a Workspace for Frontend Targets

```bash
node skills/prompt-api/scripts/find-frontend-targets.mjs .
```

The scanner prioritizes common web entry points such as `package.json`, `index.html`, and framework bootstrap files while ignoring transient directories such as `node_modules`, `dist`, `build`, `.next`, `.nuxt`, `coverage`, `out`, and `target`.

### Scan a Workspace for WebMCP Targets

```bash
node skills/webmcp/scripts/find-webmcp-targets.mjs .
```

The scanner prioritizes common web entry points and reports existing imperative or declarative WebMCP markers such as `navigator.modelContext`, `registerTool()`, `unregisterTool()`, and form tool annotations.

### Create a New Skill

1. Draft a valid `name` and a routing-focused `description`.
2. Run the metadata validator until it passes.
3. Create a new folder under `skills/`.
4. Start from `.agents/skills/skill-creator/assets/SKILL.template.md`.
5. Keep the main procedure in `SKILL.md` and move bulky detail into `references/` or `assets/`.
6. Review the result against `.agents/skills/skill-creator/references/checklist.md`.

### Run The Create Skill Prompt

The saved prompt named `Create Skill` supports a mandatory three-phase full workflow and direct single-phase execution. Use the exact argument text below when invoking that saved prompt.

Full workflow, all three phases mandatory:

```text
Create Skill: step=all
```

Then reply to the prompt's required questions in order:

```text
webgpu-audio
```

```text
URLs:
- https://example.com/spec

Attached documents:
- webgpu-audio-notes.pdf

Notes:
- Focus on browser-only usage.
- Stop when secure context or feature flags are missing.
```

Phase 1 only, skill creation:

```text
Create Skill: step=create
```

Then reply in the same required order: first the skill name, then the source materials.

Phase 2 only, validation and remediation for an existing skill:

```text
Create Skill: step=validate-remediate skill-name=webgpu-audio
```

Phase 3 only, supporting saved prompts for an existing skill:

```text
Create Skill: step=supporting-prompts skill-name=webgpu-audio
```

Another direct example with inline scope details:

```text
Create Skill: step=validate-remediate skill-name=webnn notes="tighten negative triggers and re-check metadata"
```

## References

- agentskills.io best practices: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- skill-creator template and checklist: https://github.com/mgechev/skills-best-practices
- skill-eval benchmark: https://github.com/mgechev/skill-eval

