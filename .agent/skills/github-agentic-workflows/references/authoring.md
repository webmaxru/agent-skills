# Authoring Guide

Use this reference when creating or restructuring GitHub Agentic Workflows.

## Core Model

GitHub Agentic Workflows are markdown workflow sources that run coding agents inside GitHub Actions. Each workflow has:

1. YAML frontmatter between `---` markers.
2. A markdown body with natural-language instructions.

The markdown source lives in `.github/workflows/<name>.md`. The compiled GitHub Actions workflow lives beside it as `.github/workflows/<name>.lock.yml`.

The markdown file is the editable source of truth. Recompile after frontmatter or import changes. Body-only markdown edits do not require recompilation when edited directly on GitHub.com.

## Repository Setup

For first-time setup:

```bash
gh extension install github/gh-aw
gh aw init
gh aw secrets bootstrap
```

`gh aw init` configures repository files for authoring, including the dispatcher agent file and related repository settings. Commit and push those files before expecting smooth iterative authoring.

## Creation Paths

Choose the creation path that matches the working mode:

1. Coding agent or VS Code: ask the agent to create a workflow using `https://raw.githubusercontent.com/github/gh-aw/main/create.md`.
2. GitHub web interface: useful for rough first drafts, but slower and less interactive.
3. Manual editing: create `.md`, then compile it locally with `gh aw compile`.
4. Add an existing workflow: use `gh aw add` or `gh aw add-wizard` when reusing workflows from another repository.

## Frontmatter Priorities

Design frontmatter in this order:

1. `on:`: choose the smallest trigger scope.
2. `permissions:`: prefer `read-all` or minimal explicit read permissions.
3. `tools:`: expose only the toolsets required.
4. `safe-outputs:`: model writes as post-processed outputs.
5. `network:`: allow only the domains or ecosystems the workflow truly needs.
6. `engine:`: default to Copilot unless the task requires a different engine.
7. `strict:`: keep enabled for production workflows.

Useful frontmatter fields for professional workflows:

1. `on.roles`, `on.skip-roles`, `on.skip-bots`, and `on.bots` for trigger governance.
2. `labels` and `metadata` for discoverability.
3. `resources` for install-time companion files.
4. `dependencies` for APM-managed skills and prompts.
5. `runtimes` when tool or script versions matter.
6. `concurrency` and `timeout-minutes` for operational control.

## Authoring Style

Keep the markdown body direct and constrained.

1. State the workflow goal first.
2. Describe the context the agent should inspect.
3. Define the exact process in ordered steps.
4. Bound the allowed outputs and fallback behavior.
5. Tell the agent what to do when it should take no action.

Avoid vague prompts such as "improve the repository however you think best." Prefer bounded prompts such as "triage new issues by labeling priority, asking one clarifying question when needed, and assigning the correct area label."

## Validation Loop

Use this loop for professional changes:

```bash
gh aw fix --write
gh aw validate --strict
gh aw compile
gh aw run <workflow>
gh aw status --ref main
```

Use `gh aw trial` when isolated testing is safer than dispatching directly into the production repository.

## Reuse And Updates

Prefer reuse when a workflow comes from a maintained upstream source.

```bash
gh aw add githubnext/agentics/ci-doctor
gh aw update
gh aw upgrade
```

`gh aw update` uses the `source:` field to refresh installed workflows while preserving local modifications through merge behavior by default.

## Agentic Authoring Support

For authoring with agents:

1. Use `gh aw init` to prepare the repository.
2. Use the debugging prompt at `https://raw.githubusercontent.com/github/gh-aw/main/debug.md` for failed runs.
3. Use the planner or dictation prompts from the official docs when task shaping is the bottleneck rather than workflow syntax.