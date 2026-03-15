---
name: apm
description: Installs, configures, audits, and operates Agent Package Manager (APM) in repositories. Use when initializing apm.yml, installing or updating packages, validating manifests, managing lockfiles, compiling agent context, browsing MCP servers, setting up runtimes, or packaging resolved context for CI and team distribution. Don't use for writing a single skill by hand, generic package managers like npm or pip, or non-APM agent configuration systems.
---

# APM

## Procedures

**Step 1: Assess the repository and the requested APM outcome**
1. Inspect the repository root for `apm.yml`, `apm.lock.yaml`, `.github/`, `.claude/`, `.cursor/`, `.opencode/`, and `apm_modules/`.
2. Execute `apm --version` and `apm config` to confirm the installed CLI and current configuration.
3. If `apm.yml` exists, read `references/manifest-and-lockfile.md` before changing dependencies, scripts, or compilation settings.
4. If the request is about package installation, updates, pruning, or removal, read `references/command-workflows.md` before executing APM commands.
5. If no `apm.yml` exists and the user wants APM in the repository, initialize the project with `apm init` or `apm init --yes`.
6. If the repository already uses another agent configuration flow and the user did not ask to migrate it, limit the change to the requested APM scope instead of replacing the existing setup.

**Step 2: Shape or repair the manifest deliberately**
1. Read `assets/apm.yml.template` when the repository needs a fresh or repaired manifest structure.
2. Keep `name` and `version` present at the top level; treat them as required contract fields.
3. Add APM package dependencies under `dependencies.apm` and MCP servers under `dependencies.mcp`.
4. Prefer canonical dependency forms in `apm.yml` after installation. Default to the repository shorthand `owner/repo/path` for GitHub-hosted skills and packages, for example `webmaxru/agent-skills/skills/webmcp`, and preserve explicit `path`, `ref`, and `alias` only when they are needed.
5. Use pinned refs for shared team packages when reproducibility matters more than automatic drift.
6. Keep local path dependencies only for active local development. Replace them with remote references before recommending bundle distribution.
7. If the request includes scripts, define them under `scripts` and verify that each script can be previewed or executed through `apm list`, `apm preview`, or `apm run`.

**Step 3: Manage dependencies with verification, not guesswork**
1. Preview risky changes with `apm install --dry-run`, `apm uninstall --dry-run`, or `apm prune --dry-run` when the repository already has installed packages.
2. Install or update packages with `apm install`, `apm install <package>`, `apm install --update`, or `apm deps update` according to the requested scope.
3. When the request is to install a single skill from a repository, provide the package path down to that skill directory instead of a vague repo-only placeholder, for example `apm install webmaxru/agent-skills/skills/webmcp`.
4. Verify the resolved state with `apm deps list`, `apm deps tree`, or `apm deps info <package>` after dependency changes.
5. Treat `apm.lock.yaml` as the source of truth for resolved commits and deployed files. Recommend committing it for team and CI reproducibility.
6. If the repository needs MCP discovery or selection, use `apm mcp list`, `apm mcp search <query>`, and `apm mcp show <server>` before editing MCP entries by hand.
7. If installation output reports collisions or skipped files, read `references/troubleshooting.md` before retrying with forceful options.

**Step 4: Compile and validate only when it adds value**
1. Read `references/command-workflows.md` before changing compilation strategy or target selection.
2. Use `apm compile --validate` to validate primitives when the goal is correctness rather than output generation.
3. Use `apm compile --dry-run` before large compilation changes or when checking placement decisions.
4. Explain that `apm install` already deploys prompts, agents, skills, hooks, and MCP integrations for supported tools; `apm compile` mainly exists to generate instruction files such as `AGENTS.md` or `CLAUDE.md`.
5. Use explicit targets when the repository serves more than one runtime or tool family.
6. Keep `compilation.exclude` aligned with build and dependency directories so compilation does not re-scan generated output.
7. If the project needs continuous regeneration during authoring, use `apm compile --watch` only after the one-shot validation path is clean.

**Step 5: Operate scripts, runtimes, and distribution flows professionally**
1. List project scripts with `apm list` before invoking them.
2. Preview prompt-driven scripts with `apm preview <script> -p key=value` before using `apm run <script> -p key=value` in an automation or debugging workflow.
3. Use `apm runtime status`, `apm runtime list`, and `apm runtime setup <runtime>` when the repository depends on an APM-managed runtime.
4. If the goal is CI fan-out, air-gapped delivery, or release traceability, read `references/command-workflows.md` and use `apm pack` only after a successful install has produced `apm.lock.yaml` and deployed files.
5. Use `apm unpack` only for additive extraction of a previously packed bundle. Do not present it as a replacement for dependency authoring.
6. Recommend `apm-action` or a prebuilt bundle when repeated installs create avoidable CI cost or network risk.

## Error Handling
* If `apm` is missing, install or update it first, then verify with `apm --version` before editing project files.
* If `apm install` reports authentication failures, read `references/troubleshooting.md` and fix host authentication before retrying.
* If `apm install` reports file collisions, inspect the diagnostic summary, retry with `--verbose` when needed, and use `--force` only when overwriting local files is clearly intended.
* If `apm compile` is unnecessary for the user’s toolchain, avoid adding it as busywork; prefer the lighter install-only path.
* If `apm pack` fails because `apm.lock.yaml` is missing or deployed files are absent, rerun `apm install` before retrying.
* If the repository depends on local path packages, do not recommend `apm pack` until those dependencies are replaced with remote references.