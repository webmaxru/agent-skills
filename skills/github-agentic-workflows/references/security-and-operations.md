# Security And Operations

Use this reference when a workflow needs security review, authentication design, or day-two operations.

## Security Model Summary

GitHub Agentic Workflows uses layered controls:

1. Substrate trust: GitHub Actions runners, container isolation, AWF, API proxy, and MCP gateway isolation.
2. Configuration trust: validated frontmatter, permissions, tool wiring, network rules, and token placement.
3. Plan trust: staged execution and safe outputs so the agent does not write directly to repository state.

Professional use starts by assuming prompts, tools, and repository content can be adversarial or misleading.

## Least-Privilege Defaults

Prefer these defaults unless the workflow has a concrete reason to differ:

1. `permissions: read-all` or explicit read permissions.
2. Safe outputs for issues, comments, labels, pull requests, reviews, dispatch, and agent assignment.
3. Minimal `toolsets:` rather than broad GitHub or shell access.
4. `strict: true`.
5. `network.allowed` with `defaults` plus the smallest extra ecosystem or custom domains set.

Avoid direct `contents: write`, `issues: write`, or `pull-requests: write` on the agentic execution path when a safe output can model the same outcome.

## Safe Outputs

Safe outputs are the core professional pattern for repository writes.

Key points:

1. The agent runs read-only and emits structured actions.
2. Separate permission-controlled jobs apply those actions after validation.
3. Common outputs include `create-issue`, `add-comment`, `add-labels`, `create-pull-request`, `dispatch-workflow`, `call-workflow`, `assign-to-agent`, and `create-agent-session`.
4. `noop`, `missing-tool`, and `missing-data` are critical truthfulness and reliability tools.
5. `staged: true` is the safest rollout mode for new write-heavy workflows.

Professional prompt rule:

```text
If no action is needed, the agent MUST call noop with a concise explanation.
```

Without an emitted safe output, a safe-output workflow can fail at runtime even when analysis was correct.

## Network Policy

Use `network:` as both an egress control and a content-sanitization allowlist.

Recommended pattern:

```yaml
network:
  allowed:
    - defaults
    - node
    - "api.example.com"
```

Guidance:

1. Prefer ecosystem identifiers such as `node`, `python`, `containers`, or `github`.
2. Add custom domains explicitly.
3. Use blocked domains when privacy or compliance requires it.
4. Treat `(redacted)` URLs as a signal that the allowlist is incomplete.
5. Keep the firewall enabled in production.

## Authentication

Engine authentication:

1. Copilot: `COPILOT_GITHUB_TOKEN`.
2. Claude: `ANTHROPIC_API_KEY`.
3. Codex: `OPENAI_API_KEY`.
4. Gemini: `GEMINI_API_KEY`.

Additional authentication is usually required for:

1. Cross-repository reads or writes.
2. GitHub Projects operations.
3. Remote GitHub tool mode.
4. Assigning Copilot or creating advanced safe outputs.

Use a GitHub App when possible for short-lived, scoped tokens. Copilot engine authentication itself still requires a PAT.

## Public Repository Safety

Public repositories need extra care.

1. Keep GitHub lockdown mode enabled for workflows that inspect user-generated content unless the workflow is explicitly low-risk.
2. Use restrictive safe outputs and approval controls for anything that can modify repository state.
3. Keep network policy narrow.
4. Review threat-detection prompts or steps for code-changing workflows.

If lockdown is blocking legitimate external contributor scenarios, change the workflow design before disabling protection.

## Observability And Operations

Use the CLI to manage production quality:

```bash
gh aw status
gh aw logs <workflow>
gh aw audit <run-id>
gh aw health
```

Use these signals:

1. Success rate and trend.
2. Token usage and cost.
3. Firewall denials and blocked domains.
4. Tool usage and missing-tool events.
5. Threat-detection outcomes.
6. Safe-output previews versus actual writes.

## Operational Hygiene

1. Keep workflows small and single-purpose.
2. Use shared imports only when reuse is real and maintained.
3. Pin or review CLI versions deliberately in controlled environments.
4. Use `gh aw update` for sourced workflows and `gh aw upgrade` for repository-wide modernization.
5. Treat `.lock.yml` files as build artifacts that must stay in sync with compile-time changes.