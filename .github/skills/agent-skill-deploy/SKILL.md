---
name: agent-skill-deploy
description: >
  Deploys agent skill collections from any GitHub repository with a /skills folder
  to one or more distribution surfaces: GitHub releases, Claude Code marketplace,
  VS Code plugin marketplace, and Copilot CLI plugin marketplace. Handles pre-flight
  validation, conventional commit analysis, version bumping across surface configs,
  and surface-specific publishing with dry-run support. Use when releasing, publishing,
  or deploying a skills collection to any supported marketplace or creating a GitHub
  release for a skills repository. Don't use for deploying non-skill packages, npm
  modules, Docker images, or Azure resources.
license: MIT
compatibility: Claude Code, VS Code Copilot, Copilot CLI
allowed-tools: Bash Read Glob Task AskUserQuestion
metadata:
  author: webmaxru
  version: "1.0"
---

# Agent Skill Collection Deploy

## Purpose

Automate multi-surface deployment of agent skill collections:

- Pre-flight validation of git state, skills inventory, and surface readiness
- Conventional commit analysis with version bump recommendation
- Version bumping across all detected surface configuration files
- Surface-specific deployment with dry-run capability
- User approval gates before irreversible operations

## When to Use This Skill

Use this skill when the user:

- Asks to "release", "deploy", "publish", or "ship" a skills collection
- Wants to bump versions and push to one or more marketplaces
- Needs to create a GitHub release for a skills repository
- Wants to publish skills to Claude Code, VS Code, or Copilot CLI marketplaces
- Asks to check deployment readiness or run a dry-run release

**Do not use** for npm packages, Docker deployments, Azure resource provisioning, or repositories without a `/skills` directory.

## Supported Surfaces

| Surface          | Config Files                                                       | Deploy Action                    | Tool Required       |
| ---------------- | ------------------------------------------------------------------ | -------------------------------- | ------------------- |
| **github**       | Git remote URL                                                     | Create tag + GitHub release      | `gh`                |
| **claude-code**  | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`    | Bump version, commit, push       | `git`               |
| **vscode**       | `package.json`                                                     | Bump version, optionally `vsce publish` | `vsce` (optional) |
| **copilot-cli**  | `package.json`                                                     | Bump version, commit, push       | `git`               |

## Bundled Scripts

This skill includes three Node.js helper scripts in `scripts/` for cross-platform operation (Windows and macOS):

1. **deploy-preflight.mjs** — Validates git state, discovers surfaces, checks tool availability, verifies version consistency
2. **deploy-analyze.mjs** — Inventories skills, analyzes commits since last tag, recommends version bump
3. **deploy-execute.mjs** — Bumps versions in config files, commits, tags, and deploys to selected surfaces

Run scripts from the skill directory:

```bash
node scripts/deploy-preflight.mjs
node scripts/deploy-analyze.mjs
node scripts/deploy-execute.mjs 1.2.0 --surfaces github,claude-code --dry-run
```

## Deploy Workflow

Follow these steps in order. Stop immediately if any step fails.

### Step 1: Pre-flight Checks

Run the preflight script to validate readiness:

```bash
node scripts/deploy-preflight.mjs
```

This checks:

- Current directory is a git repository
- Current branch is `master` or `main`
- Working tree is clean (no uncommitted changes)
- `/skills` directory exists and contains at least one skill
- Detects which surfaces are configured based on existing config files
- Verifies required tools are available for each surface
- Reports version consistency across all surface configs

If checks fail, report the problem and suggest a fix. Do not proceed.

### Step 2: Analyze Changes

Run the analysis script to understand what changed:

```bash
node scripts/deploy-analyze.mjs
```

This will:

- Inventory all skills in `/skills` with their names
- Find the last release tag (or handle first release)
- List all commits since that tag
- Count commits by conventional type using anchored regex
- Detect breaking changes (`type!:` suffix or `BREAKING CHANGE` in body)
- Show file change statistics
- Print a version bump recommendation

**Version bump criteria:**

| Bump      | When                                                            |
| --------- | --------------------------------------------------------------- |
| **Major** | Breaking changes — `type!:` prefix or `BREAKING CHANGE` body   |
| **Minor** | New features — any `feat:` commits                              |
| **Patch** | Everything else — `fix:`, `docs:`, `refactor:`, `chore:`, etc. |

### Step 3: Confirm Version and Surfaces with User

Present the analysis summary and ask the user to choose a version and target surfaces.

**Use the AskUserQuestion tool** for version:

```
AskUserQuestion:
  question: "Recommended: {{RECOMMENDATION}}. Which version bump for v{{CURRENT}} → v{{NEXT}}?"
  header: "Version"
  options:
    - label: "Major (v{{MAJOR}})"
      description: "Breaking changes — skill removals, renames, config restructuring"
    - label: "Minor (v{{MINOR}})"
      description: "New features — new skills, significant enhancements"
    - label: "Patch (v{{PATCH}})"
      description: "Fixes, docs, refactoring, chore, CI, tests"
    - label: "Cancel"
      description: "Abort the deployment"
```

Replace `{{CURRENT}}` with current version, compute `{{MAJOR}}`, `{{MINOR}}`, `{{PATCH}}` by incrementing the relevant segment (reset lower segments to 0).

If user selects **Cancel**, stop the workflow.

**Use the AskUserQuestion tool** for surfaces:

```
AskUserQuestion:
  question: "Detected surfaces: {{DETECTED_SURFACES}}. Which surfaces to deploy to?"
  header: "Surfaces"
  options:
    - label: "All detected ({{DETECTED_SURFACES}})"
      description: "Deploy to every surface that has config files"
    - label: "GitHub release only"
      description: "Create tag and GitHub release"
    - label: "Marketplaces only"
      description: "Update marketplace configs without GitHub release"
    - label: "Custom selection"
      description: "Specify exact surfaces"
    - label: "Cancel"
      description: "Abort the deployment"
```

### Step 4: Dry Run (Recommended)

Before making changes, perform a dry run to verify what will happen:

```bash
node scripts/deploy-execute.mjs {{VERSION}} --surfaces {{SURFACES}} --dry-run
```

Present the dry-run output to the user. The dry run shows:

- Which files will be modified and how
- Which git operations will be performed
- Which surface-specific deploy commands will run
- No files are changed, no git operations are executed

If the dry run reveals issues, address them before proceeding.

### Step 5: Bump Versions

Execute the version bump across all selected surfaces:

```bash
node scripts/deploy-execute.mjs {{VERSION}} --surfaces {{SURFACES}} --bump-only
```

This updates version fields in:

- `.claude-plugin/plugin.json` → `.version` (claude-code surface)
- `.claude-plugin/marketplace.json` → `.plugins[0].version` (claude-code surface)
- `package.json` → `.version` (vscode and copilot-cli surfaces)

Verify all files were updated correctly by reading them back.

### Step 6: Commit Version Bump

Stage and commit all modified config files:

```bash
git add -A
git commit -m "Release v{{VERSION}}"
```

### Step 7: Create Git Tag

Tag the release commit:

```bash
git tag v{{VERSION}}
```

### Step 8: User Approval Before Push

**CRITICAL: Always pause here for user approval.**

Present a summary and ask for confirmation.

**Use the AskUserQuestion tool:**

```
AskUserQuestion:
  question: "Ready to push v{{VERSION}} and deploy to {{SURFACES}}?"
  header: "Deploy"
  options:
    - label: "Yes — push and deploy"
      description: "Push commits, tags, and run surface-specific deployments"
    - label: "Push only — skip surface deploys"
      description: "Push commits and tags but skip marketplace-specific actions"
    - label: "No — keep local"
      description: "Keep local commit and tag, do not push"
```

If user selects **No**, inform them:

- The commit and tag remain local
- To undo: `git reset --hard HEAD~1 && git tag -d v{{VERSION}}`

### Step 9: Push and Deploy

Only after user approves:

```bash
node scripts/deploy-execute.mjs {{VERSION}} --surfaces {{SURFACES}} --push
```

This performs:

1. `git push && git push --tags` for all surfaces
2. For **github** surface: `gh release create v{{VERSION}} --generate-notes`
3. For **vscode** surface: `vsce publish` (if `vsce` is available and user opted in)

After pushing, print the remote URL and relevant marketplace links.

## Error Handling

- **No `/skills` directory:** Report that the repository does not follow the expected skill collection layout and stop.
- **Missing tools:** Report which tools are missing for which surfaces. Suggest installation commands. Allow deployment to surfaces whose tools are available.
- **Version mismatch across surfaces:** Report the mismatch and suggest running the bump step to synchronize all config files.
- **Tag already exists:** Report the conflict and suggest either choosing a different version or deleting the existing tag with user confirmation.
- **Push failure:** Report the error. Do not retry automatically. Suggest checking remote access and authentication.
- **Surface deploy failure:** If one surface fails, report it but continue with remaining surfaces. Provide per-surface status summary at the end.
- **Dry-run divergence:** If the actual execution differs from the dry run, pause and report the divergence to the user.
