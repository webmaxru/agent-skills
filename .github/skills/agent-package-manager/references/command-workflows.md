# APM Command Workflows

Use these command paths when an APM task needs exact CLI behavior instead of approximation.

## Bootstrap and inspection

Create or initialize a project:

```text
apm init
apm init --yes
apm init my-project
```

Inspect current configuration:

```text
apm --version
apm config
apm config get
apm config get auto-integrate
apm config set auto-integrate true
```

## Dependency management

Install from the manifest:

```text
apm install
apm install --only=apm
apm install --only=mcp
apm install --dry-run
apm install --update
apm install --verbose
```

Add packages directly:

```text
apm install microsoft/apm-sample-package
apm install anthropics/skills/skills/frontend-design
apm install microsoft/GitHub-Copilot-for-Azure/plugin/skills/azure-compliance
apm install webmaxru/agent-skills/skills/webmcp
apm install ./packages/local-skill-pack
```

Use the shortest canonical GitHub form by default:

* For repository packages, use `owner/repo`.
* For a single skill stored in a repository subdirectory, use `owner/repo/path/to/skill`.
* Do not emit `github/owner/repo` as a template command unless the user explicitly asks for that form.

Remove or clean:

```text
apm uninstall microsoft/apm-sample-package
apm uninstall microsoft/apm-sample-package --dry-run
apm prune
apm prune --dry-run
apm deps clean
```

Verify the resolved state:

```text
apm deps list
apm deps tree
apm deps info apm-sample-package
apm deps update
apm deps update apm-sample-package
```

Force a clean update when the cache serves stale content:

```text
apm deps clean
# delete apm.lock.yaml manually
apm install --update
```

## Compilation and validation

Use compilation for instruction outputs and validation, not for prompt or skill deployment.

```text
apm compile
apm compile --validate
apm compile --dry-run
apm compile --verbose
apm compile --target vscode
apm compile --target claude
apm compile --target all
apm compile --watch
```

Professional rule of thumb:

* Use `apm install` to deploy prompts, agents, skills, hooks, and MCP integrations.
* Use `apm compile` when the repository needs `AGENTS.md`, `CLAUDE.md`, or validation of instruction primitives.
* Prefer `apm compile --validate` before enabling watch mode or broad target changes.

## Scripts and runtimes

Inspect and exercise scripts safely:

```text
apm list
apm preview start -p name=alice
apm run start -p name=alice
```

Manage runtimes:

```text
apm runtime status
apm runtime list
apm runtime setup copilot
apm runtime setup codex
apm runtime setup llm
apm runtime remove codex --yes
```

## MCP discovery

Discover registry-backed MCP servers before editing `dependencies.mcp`:

```text
apm mcp list
apm mcp list --limit 20
apm mcp search github
apm mcp show io.github.github/github-mcp-server
```

## Pack and restore

Bundle only after `apm install` has produced a healthy `apm.lock.yaml`.

```text
apm pack
apm pack --archive
apm pack --target vscode
apm pack --dry-run
apm unpack ./build/my-project-1.0.0.tar.gz
apm unpack ./build/my-project-1.0.0.tar.gz --dry-run
```

Use bundles for these scenarios:

* CI jobs that should resolve dependencies once and fan out artifacts.
* Air-gapped or network-restricted environments.
* Release audit trails where the shipped agent context must be inspectable.

Avoid bundles when `dependencies.apm` still contains local paths such as `./packages/...` because `apm pack` rejects them.