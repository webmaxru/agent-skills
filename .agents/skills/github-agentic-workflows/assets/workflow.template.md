---
on:
  workflow_dispatch:
permissions: read-all
engine: copilot
network:
  allowed:
    - defaults
tools:
  github:
    toolsets: [default]
safe-outputs:
  noop: true
strict: true
---

# Workflow Goal

State the exact repository task this workflow performs.

## Inputs

State what event context, repository data, or user instructions the workflow should use.

## Process

1. Gather only the repository context needed for the task.
2. Apply the repository rules and any imported guidance.
3. Produce the minimum safe output needed to complete the task.

## Constraints

- Do not invent repository facts that are not present in the context.
- Do not request write actions outside the configured safe outputs.
- If no action is needed, call `noop` with a brief explanation.

## Output Shape

Describe the expected comment, issue, pull request, labels, review, dispatch, or summary.