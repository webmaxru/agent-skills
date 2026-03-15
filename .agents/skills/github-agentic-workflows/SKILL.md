---
name: github-agentic-workflows
description: Authors, reviews, installs, and debugs GitHub Agentic Workflows in repositories, including workflow markdown, frontmatter, gh aw compile and run flows, safe outputs, security guardrails, and operational patterns. Use when creating or maintaining GH-AW automation. Don't use for standard deterministic GitHub Actions YAML, generic CI pipelines, or non-GitHub automation systems.
---

# GitHub Agentic Workflows

## Procedures

**Step 1: Identify the repository state**
1. Inspect the workspace for `.github/workflows/`, `.github/agents/`, existing `.lock.yml` files, and any `gh aw` usage.
2. Execute `node skills/github-agentic-workflows/scripts/find-gh-aw-targets.mjs .` when a Node runtime is available.
3. If the repository contains multiple candidate workflows, prefer the workflow the user named or the one closest to the active issue, pull request, or automation surface.
4. If the repository has no GH-AW setup and the task is to create or maintain agentic workflows, read `references/authoring.md` before editing.
5. If the task is limited to standard GitHub Actions YAML without agentic markdown workflows, stop and explain that this skill does not apply.

**Step 2: Choose the working mode**
1. Classify the task as one of: repository setup, new workflow authoring, workflow revision, workflow installation from another repository, security review, or failure debugging.
2. Read `references/examples.md` when the task needs a starting pattern for scheduled reports, issue or PR triage, orchestration, or agent handoff.
3. Read `references/security-and-operations.md` when the workflow needs safe outputs, network policy, authentication, lockdown, threat detection, or run observability.
4. Read `references/troubleshooting.md` when the workflow fails to compile, install, authenticate, execute safe outputs, or access tools.

**Step 3: Author or revise the workflow source**
1. Keep the workflow source of truth in `.github/workflows/<workflow-name>.md`.
2. Use `assets/workflow.template.md` as the base shape when creating a new workflow.
3. Choose the smallest viable trigger surface and repository role scope that satisfies the task.
4. Keep `permissions:` read-only unless the workflow truly needs broader GitHub Actions permissions outside the agentic section.
5. Prefer `safe-outputs:` for comments, issues, labels, PRs, agent assignment, and orchestration instead of granting direct write access to the agent.
6. In safe-output workflows, instruct the agent to call `noop` when no action is required.
7. Keep `tools:` and `toolsets:` minimal and specific to the task.
8. Configure `network:` with least privilege. Prefer ecosystem identifiers such as `node` or `python` over individual registry domains when possible.
9. Use imported or reusable workflows only when the repository genuinely benefits from shared logic or orchestration.
10. Recompile the workflow after frontmatter, imports, or other compile-time configuration changes.
11. If only the markdown body changed and the workflow is edited directly on GitHub.com, do not recompile solely for body text changes.

**Step 4: Configure repository prerequisites and authentication**
1. Read `references/authoring.md` before first-time repository setup.
2. Run `gh aw init` when the repository is not configured for GH-AW authoring and the user wants persistent setup.
3. Configure engine secrets with `gh aw secrets bootstrap` or `gh aw secrets set`.
4. Use `COPILOT_GITHUB_TOKEN` for Copilot engine authentication.
5. Use a GitHub App or custom GitHub token when the workflow needs cross-repository reads or writes, Projects access, remote GitHub tool mode, or advanced safe outputs.
6. If the repository is public and the workflow will inspect untrusted external content, preserve lockdown and approval controls unless the task is explicitly a low-risk public workflow.

**Step 5: Validate, compile, and execute**
1. Run `gh aw fix --write` when the workflow uses deprecated fields or the compiler points to codemod-able drift.
2. Run `gh aw validate --strict` before treating a workflow as ready.
3. Run `gh aw compile` after validation succeeds and commit both the `.md` source and the generated `.lock.yml` file.
4. Use `gh aw run <workflow>` for direct execution and `gh aw trial <workflow>` when an isolated test flow is more appropriate.
5. Use `gh aw status`, `gh aw logs`, `gh aw audit`, and `gh aw health` to review state, failures, cost, tool usage, and success trends after changes.

**Step 6: Operate and improve professionally**
1. Review whether the workflow can be simplified, split into smaller workflows, or converted into shared components.
2. Prefer staged safe outputs for initial rollout of workflows that create issues, comments, or pull requests at scale.
3. For recurring maintenance, pin or review the installed `gh-aw` version deliberately and update workflows through `gh aw update` or `gh aw upgrade` instead of ad hoc copy-paste.
4. Keep workflow prompts specific, bounded, and auditable. Move broad strategy into reusable imports or agent files when multiple workflows need the same rules.

## Error Handling
* If `gh extension install github/gh-aw` fails, use the standalone installer path documented in `references/troubleshooting.md`.
* If compilation fails, fix frontmatter syntax, deprecated fields, imports, or permission mismatches before continuing.
* If safe outputs do nothing, verify that staged mode is intentional and that the prompt explicitly instructs the agent to call `noop` when no write action is needed.
* If URLs are sanitized as `(redacted)` or tools cannot reach required services, tighten and expand `network.allowed` deliberately rather than disabling the firewall.
* If Copilot inference fails with a configured token, verify that the PAT owner actually has Copilot license and inference access.
* If public-repository workflows miss external contributor content, confirm whether GitHub lockdown mode is blocking that content before changing workflow logic.