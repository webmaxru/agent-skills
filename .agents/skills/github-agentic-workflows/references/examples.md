# Examples And Patterns

Use these as shape references. Adapt them to the repository instead of copying them blindly.

## Minimal Scheduled Report

```md
---
on:
  schedule: daily
permissions:
  contents: read
  issues: read
  pull-requests: read
safe-outputs:
  create-issue:
    title-prefix: "[team-status] "
    labels: [report, daily-status]
    close-older-issues: true
---

## Daily Issues Report

Create an upbeat daily status report for the team as a GitHub issue.

## What To Include

- Recent repository activity.
- Progress highlights.
- Risks or blockers.
- Actionable next steps.
```

Use this pattern for recurring observability or status workflows.

## Issue Triage Starter Prompt

Prompt a coding agent with:

```text
Create a workflow for GitHub Agentic Workflows using https://raw.githubusercontent.com/github/gh-aw/main/create.md
The purpose of the workflow is to triage new issues: label them by type and priority, identify duplicates, ask clarifying questions when the description is unclear, and assign them to the right team members.
```

Use this when a repository needs high-volume issue intake automation.

## Repository Bootstrap Commands

```bash
gh extension install github/gh-aw
gh aw init
gh aw secrets bootstrap
gh aw new triage-issues
gh aw validate --strict
gh aw compile
```

Use `gh aw add-wizard` instead of `gh aw new` when starting from a remote, maintained workflow.

## Safe Output Review Pattern

Use `safe-outputs` for all write actions and keep the agent itself read-only.

```yaml
safe-outputs:
  add-comment:
    max: 1
  add-labels:
    allowed: [bug, enhancement, needs-triage]
  noop: true
```

Always tell the agent to emit `noop` when no action is justified.

## Orchestration Decision

Choose `call-workflow` when:

1. The worker is in the same repository.
2. Preserving `github.actor` matters.
3. Compile-time validation and deterministic fan-out are preferred.

Choose `dispatch-workflow` when:

1. The worker should run asynchronously.
2. The worker should outlive the parent run.
3. `workflow_dispatch` inputs are the natural handoff boundary.

## Professional Review Areas

Review existing workflows against these questions:

1. Does the workflow use read-only permissions plus safe outputs instead of direct writes?
2. Does `network.allowed` use least privilege and ecosystem identifiers where appropriate?
3. Does the prompt explicitly state what to do when no action is needed?
4. Are schedules, concurrency, and timeout values bounded?
5. Are cross-repository operations protected by explicit `target-repo` or `allowed-repos` settings?

## Common Production Patterns

High-value workflow families from the GH-AW docs and gallery include:

1. IssueOps and LabelOps.
2. DailyOps and Monitoring.
3. Quality and testing hygiene.
4. Multi-repository coordination.
5. ProjectOps and status reporting.
6. Orchestration and task delegation.
7. Assign-to-Copilot or create-agent-session follow-up automation.