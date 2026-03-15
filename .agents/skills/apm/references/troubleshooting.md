# APM Troubleshooting

Use these checks before improvising a workaround.

## Authentication failures during install

Symptoms:

* `apm install` cannot access GitHub-hosted private repositories.
* Git operations fail for non-GitHub hosts.

Actions:

1. For GitHub, ensure `GITHUB_CLI_PAT` or `GITHUB_TOKEN` is configured with repository read access.
2. For GitLab, Bitbucket, Azure DevOps, or self-hosted git, ensure SSH keys or the configured credential helper works outside APM first.
3. Re-run `apm install --dry-run` before attempting a full install again.

## File collisions during install

Symptoms:

* APM reports skipped files, collisions, or local files that were not overwritten.

Actions:

1. Re-run with `apm install --verbose` to identify exactly which files were skipped.
2. Keep local files when they are intentionally authored in the repository.
3. Use `apm install --force` only when the requested outcome is to replace local files with package-managed versions.

## Lockfile or bundle failures

Symptoms:

* `apm pack` reports missing `apm.lock.yaml`.
* `apm pack` reports deployed files missing on disk.
* `apm unpack` verification fails.

Actions:

1. Run `apm install` to regenerate the lockfile and restore deployed files.
2. Verify that files referenced by `deployed_files` still exist where APM placed them.
3. Re-pack from a clean, installed state.
4. Use `apm unpack --skip-verify` only when the bundle is intentionally partial and the risk is understood.

## Compilation confusion

Symptoms:

* A team expects `apm compile` to deploy prompts, agents, or skills.
* A repository runs compile steps that do not change the active toolchain.

Actions:

1. Explain that `apm install` handles native integration for prompts, agents, skills, hooks, and MCP.
2. Use `apm compile` for instruction outputs such as `AGENTS.md` or `CLAUDE.md`, plus validation and placement analysis.
3. Prefer `apm compile --validate` or `apm compile --dry-run` before changing compilation config.

## Local dependency pitfalls

Symptoms:

* A repository installs local path packages successfully but fails when attempting `apm pack`.

Actions:

1. Confirm whether `dependencies.apm` contains `./`, `../`, or absolute local paths.
2. Keep local dependencies for fast iteration only.
3. Replace local dependencies with remote, pinned references before recommending bundle distribution.