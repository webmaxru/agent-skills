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

Before relying on any field, command, or compiler behavior from memory, check the installed version with `gh aw version`. The repository may lag or exceed the version described in older notes, and that version drift can change frontmatter support, generated lockfiles, and validation output.

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

Practical default: use `engine: copilot` unless the repository explicitly needs another model provider and is already wired for that provider's secret and runtime expectations.

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
gh aw compile --verbose
gh aw run <workflow> --dry-run
gh aw trial ./.github/workflows/<workflow>.md --dry-run -y -v
gh aw run <workflow>
gh aw status --ref main
```

Use `gh aw trial` when isolated testing is safer than dispatching directly into the production repository.

If the CLI version was just upgraded, this loop is also the fastest way to surface codemods, deprecated fields, generated lockfile drift, and new warnings.

Practical notes from `gh aw v0.58.3` testing:

1. `gh aw run <workflow> --dry-run` validates repository dispatch wiring, but it still uses the remote repository state. Unpushed local workflow edits are warned about and are not executed remotely.
2. For local-source trials, prefer an explicit path such as `./.github/workflows/weekly-review.md`. A bare `.github/workflows/weekly-review.md` argument can be misparsed as a repository spec.
3. Trial host repositories need their own engine secrets. A source repository secret such as `COPILOT_GITHUB_TOKEN` is not copied automatically into the temporary or reusable host repo.
4. When using `--force-delete-host-repo-before`, the authenticated account needs admin rights on the host repository plus `delete_repo` scope.

## Compiler-Sensitive Caveats

If the installed CLI is `gh aw v0.58.3`, keep these schema details in mind:

1. `engine.max-turns` is not supported for Copilot workflows.
2. `bash` cannot use anonymous syntax. Use `bash: true`, `bash: false`, or an explicit allowlist.
3. `edit:` and `web-fetch:` can be left as bare keys or configured as objects. Boolean values for those keys may fail schema validation.

## Reuse And Updates

Prefer reuse when a workflow comes from a maintained upstream source.

```bash
gh aw add githubnext/agentics/ci-doctor
gh aw update
gh aw upgrade
```

`gh aw update` uses the `source:` field to refresh installed workflows while preserving local modifications through merge behavior by default.

When the task needs dynamic fan-out over a discovered set of files or records, do not force that logic into a single markdown workflow. Prefer a reusable GH-AW worker plus a deterministic GitHub Actions wrapper that performs discovery and matrix expansion, then `uses:` the compiled worker lockfile.

## Agentic Authoring Support

For authoring with agents:

1. Use `gh aw init` to prepare the repository. For agent-assisted setup, use `https://raw.githubusercontent.com/github/gh-aw/main/install.md`.
2. Use the debugging prompt at `https://raw.githubusercontent.com/github/gh-aw/main/debug.md` for failed runs.
3. Use the planner or dictation prompts from the official docs when task shaping is the bottleneck rather than workflow syntax.
4. If strict mode rejects external-source domains that are still required for the task, add deterministic pre-steps that fetch those sources to local files and instruct the agent to use the local copies.