# Troubleshooting

Use this reference when the repository cannot install, compile, execute, or debug GitHub Agentic Workflows cleanly.

## Installation Fails

If `gh extension install github/gh-aw` fails, use the standalone installer:

```bash
curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash
```

Then verify the extension is visible with:

```bash
gh extension list
```

If `gh extension upgrade gh-aw` or `gh extension install github/gh-aw --force` fails because the current token cannot query GitHub release metadata, install with an explicit version through the upstream installer instead:

```bash
curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash -s -- v0.58.3 --skip-checksum
gh aw version
```

Treat `gh aw version` as the source of truth after any fallback install path.

## Enterprise Or Organization Action Policies Block GH-AW

If workflows fail because `github/gh-aw/actions/...` is not allowed, repository settings are not enough. The organization or enterprise policy must allow `github/gh-aw@*`.

Recommended remediation:

1. Ask administrators to allow `github/gh-aw@*` in Actions policies.
2. Re-run the workflow after policy propagation.

## Repository Init Reports Actions Restrictions

Check Repository Settings -> Actions -> General.

Typical fixes:

1. Enable GitHub Actions.
2. Allow GitHub-created actions.
3. If settings are locked, escalate to organization administrators.

## Workflow Does Not Compile

Common causes:

1. Invalid YAML frontmatter indentation or array syntax.
2. Missing required fields such as `on:`.
3. Deprecated fields that need `gh aw fix --write`.
4. Circular imports or wrong import paths.
5. Permissions or strict-mode validation failures.

Debug loop:

```bash
gh aw fix --write
gh aw validate --strict
gh aw compile --verbose
```

If the workflow used to compile under an older CLI, compare the generated warnings and frontmatter changes after `gh aw version` changes before assuming the docs or the workflow are wrong.

Concrete schema mismatches seen in `gh aw v0.58.3`:

1. `engine.max-turns` is not supported for Copilot workflows.
2. `bash` must be `true`, `false`, or an allowlist such as `bash: ["git status"]`.
3. `edit:` and `web-fetch:` accept bare-key or object syntax; boolean values can fail validation.

## Lock File Missing Or Stale

If `.lock.yml` was not generated, fix compile errors first. If old lock files remain after source deletion, remove them with:

```bash
gh aw compile --purge
```

## Safe Outputs Produce No Result

Check these first:

1. `staged: true` may be previewing only.
2. The prompt may not instruct the agent to call `noop`.
3. The configured safe output type may not match the action being requested.
4. Cross-repository targets may need custom authentication.

Typical fix:

```text
If no action is needed, call noop with a short explanation.
```

## Write Operations Or Token Use Fails

If writes fail:

1. Prefer safe outputs over direct write permissions.
2. Verify the configured token actually has the required scopes.
3. Use GitHub App or custom PAT for cross-repo or Projects scenarios.

## GitHub Tools Or MCP Tools Are Missing

If expected tools are unavailable:

1. Check `toolsets:` coverage.
2. Inspect workflow MCP configuration with `gh aw mcp inspect <workflow>`.
3. Verify required package installs, environment variables, or remote authentication.

If `gh aw mcp inspect` fails on a scheduled markdown workflow with a fuzzy schedule parsing error even though `gh aw validate --strict` and `gh aw compile --verbose` already passed, treat that as an inspection-path limitation first. Compile again, prefer run logs or `gh aw audit`, and avoid assuming the workflow source is invalid solely from that inspection failure.

## Network Access Is Blocked

Symptoms include firewall denials, package install failures, or URLs shown as `(redacted)`.

Remediation:

```yaml
network:
  allowed:
    - defaults
    - node
    - python
    - "api.example.com"
```

Then inspect logs or audit output for blocked domains.

If strict mode plus the installed CLI still rejects a required domain, move the fetch into a deterministic setup step, write the fetched content to repository-local temporary files, and tell the agent to use those local copies.

## Public Repository Lockdown Hides Expected Content

If public-repo workflows cannot see external contributors' issues, PRs, or comments, lockdown mode is likely active.

Use this decision:

1. Keep lockdown enabled for code-changing or sensitive workflows.
2. Disable it only for low-risk public workflows that validate inputs and use constrained safe outputs.

## Copilot Engine Fails Even With A Token

If `COPILOT_GITHUB_TOKEN` is configured but inference still fails, verify that the PAT owner has active Copilot license and inference access.

Local check:

```bash
copilot -p "write a haiku"
```

If that fails for the token owner, the workflow will not recover until licensing or access is fixed.

## Trial Mode Fails Before The Agent Starts

If `gh aw trial` fails before the agent job starts, check these trial-specific causes:

1. Local workflow paths should be explicit, for example `./.github/workflows/my-workflow.md`. Without `./`, the CLI may interpret the argument as a repository spec.
2. The host repository used by `gh aw trial` needs its own engine secret such as `COPILOT_GITHUB_TOKEN`. Source or logical repository secrets are not inherited automatically.
3. If you reuse a persistent host repo, confirm the secret with `gh secret list -R <host-repo>` before blaming the workflow.
4. If you force-delete the host repo before running the trial, the authenticated account needs admin rights on that repo and GitHub auth must include `delete_repo` scope.

## Workflow Run Failed And Root Cause Is Unclear

Use the operational triage path:

```bash
gh aw logs <workflow>
gh aw audit <run-id>
gh aw health
```

Useful debugging aids:

```bash
DEBUG=* gh aw compile
DEBUG=workflow:*,cli:* gh aw audit <run-id>
```

If the repository is configured for agentic authoring, the official debug prompt can also be used with a coding agent:

```text
Debug this workflow run using https://raw.githubusercontent.com/github/gh-aw/main/debug.md
Run URL: https://github.com/OWNER/REPO/actions/runs/RUN_ID
```