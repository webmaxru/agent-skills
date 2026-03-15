# Web AI Agent Skills

This repository is a working collection of agent skills and support assets for modern Web AI APIs, built around the agentskills.io style: lean `SKILL.md` files, progressive disclosure through `references/` and `assets/`, and deterministic helper scripts where guessing would be brittle.

The main purpose of this repo is not just to hold examples. It is to provide reusable Web AI skills that stay aligned with regularly updated specifications and implementation guidance for browser AI surfaces such as the Prompt API, WebMCP, and WebNN.

For these APIs, staying close to the latest specification is not optional. The standards and preview implementations are still moving, browser behavior can differ across milestones, and ecosystem examples become stale quickly. These skills exist to reduce that ambiguity so generated or assisted code follows the newest public specification state as closely as possible instead of relying on outdated snippets or improvised assumptions.

I actively maintain the skills in this repository against current specification and platform changes. That work is informed by participation in the [W3C Web Machine Learning Community Group](https://www.w3.org/groups/cg/webmachinelearning/), where several of these APIs are discussed in the open, and by my work as a [Google Developer Expert in Web Technologies](https://developers.google.com/community/experts).

The repository has three practical roles:

1. Provide production-style skills for browser Web AI integrations such as Prompt API, WebMCP, and WebNN.
2. Provide a local authoring workflow for creating, validating, and reviewing additional skills.
3. Keep disposable demos and research artifacts separate from persistent skill assets while the durable skill content tracks evolving specifications.

## Contents

- [Install Skills](#install-skills)
- [Included Skills](#included-skills)
  - [Prompt API Skill](#prompt-api-skill)
  - [Writing Assistance APIs Skill](#writing-assistance-apis-skill)
  - [WebMCP Skill](#webmcp-skill)
  - [WebNN Skill](#webnn-skill)
- [Supporting Assets](#supporting-assets)
  - [Skill Creator](#skill-creator)
- [Repository Conventions](#repository-conventions)
- [Common Workflows](#common-workflows)

## Install Skills

Primary installation path: use [Agent Package Manager (APM)](https://github.com/microsoft/apm), a package manager for agent instructions, prompts, skills, and related configuration.

If the target repository does not already use APM, initialize it first:

```bash
apm init
```

Install the Prompt API skill with APM:

```bash
apm install webmaxru/agent-skills/skills/prompt-api
```

Install the Writing Assistance APIs skill with APM:

```bash
apm install webmaxru/agent-skills/skills/writing-assistance-apis
```

Install the WebMCP skill with APM:

```bash
apm install webmaxru/agent-skills/skills/webmcp
```

Install the WebNN skill with APM:

```bash
apm install webmaxru/agent-skills/skills/webnn
```

Secondary installation path: use the `skills` package from npm for direct per-skill installs.

Install the Prompt API skill:

```bash
npx skills add webmaxru/agent-skills --skill prompt-api
```

Install the Writing Assistance APIs skill:

```bash
npx skills add webmaxru/agent-skills --skill writing-assistance-apis
```

Install the WebMCP skill:

```bash
npx skills add webmaxru/agent-skills --skill webmcp
```

Install the WebNN skill:

```bash
npx skills add webmaxru/agent-skills --skill webnn
```

## Included Skills

### Prompt API Skill

`skills/prompt-api` is the main production-style example skill in the repository. It is scoped to browser Prompt API work in JavaScript or TypeScript web apps.

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

### Writing Assistance APIs Skill

`skills/writing-assistance-apis` is scoped to browser Summarizer, Writer, and Rewriter integrations in JavaScript or TypeScript web apps.

It covers:

- identifying the correct browser app surface for writing assistance work
- confirming API availability, secure-context requirements, and download readiness before code changes
- implementing guarded session creation, batch and streaming output flows, and cleanup through `destroy()` or abort signals
- wiring user-visible download, ready, generating, canceled, and fallback UX states
- validating browser-specific preview limits, permissions-policy constraints, and option-specific failure cases

Its support files are split by purpose:

- `references/writing-assistance-reference.md` for shared lifecycle rules, session methods, option surfaces, and iframe permission requirements
- `references/examples.md` for feature detection, monitored creation, batch usage, streaming usage, cancellation, and cleanup patterns
- `references/compatibility.md` for browser rollout notes, preview flags, hardware constraints, and support boundaries
- `references/troubleshooting.md` for missing globals, `NotAllowedError`, `NotSupportedError`, quota issues, and streaming failures
- `assets/writing-assistance-session.template.ts` for a reusable typed wrapper template
- `scripts/find-writing-assistance-targets.mjs` for deterministic scanning of likely web entry points and Writing Assistance API markers

### WebMCP Skill

`skills/webmcp` is scoped to browser WebMCP integrations in JavaScript or TypeScript web apps.

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

### WebNN Skill

`skills/webnn` is scoped to browser Web Neural Network API integrations in JavaScript or TypeScript web apps.

It covers:

- identifying the correct browser integration surface for local inference work
- confirming secure-context, `navigator.ml`, and device viability before code changes
- implementing guarded `MLContext` and `MLGraphBuilder` flows with explicit runtime selection
- wiring fallback behavior for unsupported devices or browsers without silently switching to remote inference
- validating context creation, graph execution, tensor readback, and preview-specific behavior against the current spec and runtime landscape

Its support files are split by purpose:

- `references/webnn-reference.md` for API surface, execution model, and graph/runtime rules
- `references/examples.md` for direct graph and adapter implementation patterns
- `references/compatibility.md` for browser support, preview requirements, and backend differences
- `references/troubleshooting.md` for context creation failures, dispatch issues, readback problems, and device fallback behavior
- `assets/webnn-runtime.template.ts` for a reusable runtime wrapper template
- `scripts/find-webnn-targets.mjs` for deterministic scanning of likely web entry points and WebNN markers

## Supporting Assets

### `.github/prompts`

These prompt files support maintenance workflows in this repo:

- `create-skill.prompt.md` runs a five-phase workflow for a skill under `skills/`: creation, validation and remediation, supporting prompt creation, README update, and install verification; it also supports explicit single-phase execution through a `step=` selector
- `validate-skills.prompt.md` reviews skills against the local authoring workflow
- `remediate-skills.prompt.md` applies targeted fixes to skills
- `prompt-api-skill-update.prompt.md` refreshes the Prompt API skill from current docs and user-supplied updates
- `writing-assistance-apis-skill-update.prompt.md` refreshes the Writing Assistance APIs skill from user-supplied updates, attachments, and the current specification state
- `webmcp-skill-update.prompt.md` refreshes the WebMCP skill from user-supplied updates, attachments, and the current specification state
- `webnn-skill-update.prompt.md` refreshes the WebNN skill from user-supplied updates, attachments, and the current specification state
- `prompt-api-create-chat-demo-plain-html.prompt.md` recreates or extends a plain HTML Prompt API demo under `artifacts/prompt-api/`
- `writing-assistance-apis-create-demo-plain-html.prompt.md` creates or recreates a plain HTML Writing Assistance APIs demo under `artifacts/writing-assistance-apis/`
- `webmcp-create-demo-plain-html.prompt.md` creates or recreates a plain HTML WebMCP demo under `artifacts/webmcp/`
- `webnn-create-demo-plain-html.prompt.md` creates or recreates a plain HTML WebNN demo under `artifacts/webnn/`

### Skill Creator

`.agents/skills/skill-creator` is the local authoring skill and repository source of truth for creating and reviewing skills.

It includes:

- `SKILL.md` with the authoring procedure
- `scripts/validate-metadata.py` for metadata validation
- `assets/SKILL.template.md` as a starting point for new skills
- `references/checklist.md` for final review

Use it when creating or revising agent skills. Do not use it for generic repository documentation or other non-skill content.

### `artifacts/`

`artifacts/` is intentionally disposable and ignored by Git. Use it for temporary demos, experiments, and working reference files that should not become part of the persistent skill surface.

Current workspace contents include:

- `artifacts/prompt-api/` with a plain HTML Prompt API demo (`index.html`, `styles.css`, `app.js`)
- `artifacts/webmcp/` with a plain HTML WebMCP demo surface and generated demo artifacts
- `artifacts/webnn/` with a plain HTML WebNN demo (`index.html`, `styles.css`, `app.js`)
- `artifacts/pr-submissions/` for disposable pull request submission material and related working state

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

### Scan a Workspace for Writing Assistance Targets

```bash
node skills/writing-assistance-apis/scripts/find-writing-assistance-targets.mjs .
```

The scanner prioritizes common browser entry points and reports existing Writing Assistance API markers such as `Summarizer`, `Writer`, `Rewriter`, and their streaming methods.

### Scan a Workspace for WebMCP Targets

```bash
node skills/webmcp/scripts/find-webmcp-targets.mjs .
```

The scanner prioritizes common web entry points and reports existing imperative or declarative WebMCP markers such as `navigator.modelContext`, `registerTool()`, `unregisterTool()`, and form tool annotations.

### Scan a Workspace for WebNN Targets

```bash
node skills/webnn/scripts/find-webnn-targets.mjs .
```

The scanner prioritizes common browser app entry points and reports existing local inference markers such as `navigator.ml`, `createContext()`, `MLGraphBuilder`, and related runtime setup code.

### Create a New Skill

1. Draft a valid `name` and a routing-focused `description`.
2. Run the metadata validator until it passes.
3. Create a new folder under `skills/`.
4. Start from `.agents/skills/skill-creator/assets/SKILL.template.md`.
5. Keep the main procedure in `SKILL.md` and move bulky detail into `references/` or `assets/`.
6. Review the result against `.agents/skills/skill-creator/references/checklist.md`.

### Run The Create Skill Prompt

The saved prompt named `Create Skill` supports a mandatory five-phase full workflow and direct single-phase execution. Use the exact argument text below when invoking that saved prompt.

Full workflow, all five phases mandatory:

```text
Create Skill: step=all
```

Then reply to the prompt's required questions in order:

```text
webgpu-audio
```

```text
Browser-side use of WebGPU audio processing in JavaScript or TypeScript web apps, including capability checks, initialization, error handling, and compatibility limits.
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

Then reply in the same required order: skill name, skill scope, then source materials.

Phase 2 only, validation and remediation for an existing skill:

```text
Create Skill: step=validate-remediate skill-name=webgpu-audio
```

Phase 3 only, supporting saved prompts for an existing skill:

```text
Create Skill: step=supporting-prompts skill-name=webgpu-audio
```

Phase 4 only, root README update for an existing skill:

```text
Create Skill: step=readme-update skill-name=webgpu-audio
```

Phase 5 only, install verification for an existing skill:

```text
Create Skill: step=install-test skill-name=webgpu-audio
```

Another direct example with inline scope details:

```text
Create Skill: step=validate-remediate skill-name=webnn notes="tighten negative triggers and re-check metadata"
```

## References

- agentskills.io best practices: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- skill-creator template and checklist: https://github.com/mgechev/skills-best-practices
- skill-eval benchmark: https://github.com/mgechev/skill-eval

