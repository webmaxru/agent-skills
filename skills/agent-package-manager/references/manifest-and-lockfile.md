# APM Manifest And Lockfile Notes

Use this file when the request involves editing `apm.yml`, understanding canonical dependency forms, or explaining what `apm.lock.yaml` guarantees.

## apm.yml essentials

Minimum required fields:

```yaml
name: my-project
version: 1.0.0
```

Useful optional top-level fields:

```yaml
description: Shared AI-native project setup
author: Contoso
target: all
type: hybrid
scripts:
  review: codex review.prompt.md
dependencies:
  apm: []
  mcp: []
compilation:
  target: all
  exclude:
    - apm_modules/**
```

## Dependency guidance

Prefer these patterns:

* Use `owner/repo` for GitHub-hosted repositories.
* Use `host/group/repo` for non-GitHub hosts.
* Use object form when `path`, `ref`, or `alias` is required.
* Use pinned refs for team-critical dependencies that must not drift unexpectedly.
* Use local paths only for short-lived development loops.

Examples:

```yaml
dependencies:
  apm:
    # Skills from any GitHub repository
    - anthropics/skills/skills/frontend-design
    - microsoft/GitHub-Copilot-for-Azure/plugin/skills/azure-compliance
    # Full packages (rules, skills, prompts, hooks, ...)
    - microsoft/apm-sample-package
    # Skills with pinned ref
    - github/awesome-copilot/skills/review-and-refactor#v2.1.0
    # Plugins
    - github/awesome-copilot/plugins/context-engineering#v2.1
    # Agents (direct file reference)
    - github/awesome-copilot/agents/api-architect.agent.md
    # Non-GitHub git host with path and version pinning
    - git: https://gitlab.com/acme/repo.git
      path: instructions/security
      ref: v2.0
      alias: acme-sec
    - git: dev.azure.com/org/project/repo
      path: prompts/review.prompt.md
  mcp:
    - io.github.github/github-mcp-server
    - name: internal-knowledge-base
      registry: false
      transport: http
      url: "${KNOWLEDGE_BASE_URL}"
      env:
        KB_TOKEN: "${KB_TOKEN}"
```

## Lockfile rules

Treat `apm.lock.yaml` as the exact resolved state of the dependency graph.

Key properties:

* It records resolved commits and refs.
* It tracks direct and transitive dependency depth.
* It records `deployed_files`, which drive safe uninstall and prune behavior.
* It should be committed for reproducible installs across developers and CI.

Operational consequences:

* `apm install` without `--update` prefers the lockfile.
* `apm install --update` or `apm deps update` re-resolves and refreshes the lockfile.
* `apm pack` reads from the lockfile and expects the listed deployed files to exist on disk.
* `apm uninstall` and `apm prune` remove only files tracked in the lockfile’s deployed file manifest.

## Official reference map

Use the official APM docs in this order when deeper details are needed:

* Quick start: `https://microsoft.github.io/apm/getting-started/quick-start/`
* CLI commands: `https://microsoft.github.io/apm/reference/cli-commands/`
* Manifest schema: `https://microsoft.github.io/apm/reference/manifest-schema/`
* Dependencies and lockfile guide: `https://microsoft.github.io/apm/guides/dependencies/`
* Compilation guide: `https://microsoft.github.io/apm/guides/compilation/`
* Pack and distribute guide: `https://microsoft.github.io/apm/guides/pack-distribute/`