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
* Use `owner/repo/path/to/dir` for a single skill or subdirectory on GitHub.
* Use `dev.azure.com/org/project/repo` for Azure DevOps repositories.
* Use `host/group/repo` for other non-GitHub hosts such as GitLab or Bitbucket.
* Append `#ref` to any shorthand form to pin a version inline, for example `owner/repo#v2.1.0`.
* Use object form when `path`, `ref`, or `alias` is required and inline pinning is not sufficient.
* Use pinned refs for team-critical dependencies that must not drift unexpectedly.
* Use local paths only for short-lived development loops.

Examples:

```yaml
dependencies:
  apm:
    - microsoft/apm-sample-package
    - github/awesome-copilot/skills/review-and-refactor#v2.1.0
    - anthropics/skills/skills/frontend-design
    - dev.azure.com/myorg/myproject/myrepo
    - git: https://gitlab.com/acme/repo.git
      path: instructions/security
      ref: v2.0
      alias: acme-sec
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