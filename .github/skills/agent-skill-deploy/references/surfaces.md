# Deployment Surface Reference

Detailed configuration requirements and deployment mechanics for each supported surface.

## GitHub Releases

**Detection:** Git remote URL present (`git remote get-url origin`).

**Config files:** None required beyond the git repository itself.

**Deploy action:** Create a git tag and GitHub release with auto-generated notes.

**Required tools:**
- `git` — always required
- `gh` — GitHub CLI, required for automated release creation

**Version source:** Git tags (e.g., `v1.2.0`).

**Manual alternative:** Create release through the GitHub web UI at `https://github.com/OWNER/REPO/releases/new`.

**Install command for consumers:**
```bash
apm install OWNER/REPO/skills/SKILL_NAME
```

---

## Claude Code Marketplace

**Detection:** `.claude-plugin/plugin.json` exists. `.claude-plugin/marketplace.json` is optional.

**Config files:**

1. `.claude-plugin/plugin.json` (required) — Plugin metadata with `version` field at root level:
   ```json
   {
     "name": "my-skills",
     "version": "1.0.0",
     "description": "...",
     "author": { "name": "..." },
     "repository": "https://github.com/OWNER/REPO",
     "license": "MIT",
     "keywords": [...]
   }
   ```

2. `.claude-plugin/marketplace.json` (optional) — Marketplace listing with version in `plugins[0].version` or root `version`. If absent, the plugin is assumed to be listed by a marketplace defined in another repository. Only `plugin.json` is version-bumped in that case.
   ```json
   {
     "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
     "name": "owner-repo",
     "version": "1.0.0",
     "description": "...",
     "owner": { "name": "..." },
     "plugins": [
       {
         "name": "my-skills",
         "description": "...",
         "source": ".",
         "category": "development"
       }
     ]
   }
   ```

**Deploy action:** Bump version in `plugin.json` (and `marketplace.json` if present), commit, push. The marketplace reads from GitHub directly.

**Required tools:** `git`

**Install command for consumers:**
```bash
/plugin marketplace add OWNER/REPO
/plugin install PLUGIN_NAME@OWNER-REPO
```

---

## VS Code Plugin Marketplace

**Detection:** `package.json` exists in repository root.

**Config files:**

1. `package.json` — Standard npm package manifest with `version` field:
   ```json
   {
     "name": "my-skills",
     "version": "1.0.0",
     "description": "...",
     "author": { "name": "..." },
     "repository": "https://github.com/OWNER/REPO",
     "license": "MIT"
   }
   ```

2. For full VS Code extension publishing, additional fields are needed:
   - `publisher` — VS Code marketplace publisher ID
   - `engines.vscode` — Minimum VS Code version
   - `main` or `browser` — Extension entry point

**Deploy actions:**
- **Push-based (default):** Bump version, commit, push. Install via "Chat: Install Plugin From Source" in VS Code Command Palette.
- **Marketplace publish (optional):** Run `vsce publish` if `vsce` is installed and publisher is configured.

**Required tools:**
- `git` — always required
- `vsce` — optional, for VS Code marketplace publishing. Install with `npm install -g @vscode/vsce`

**Install command for consumers (push-based):**
Run **Chat: Install Plugin From Source** from the Command Palette and enter:
```text
https://github.com/OWNER/REPO
```

---

## Copilot CLI Plugin Marketplace

**Detection:** `package.json` exists in repository root.

**Config files:** Same as VS Code — uses `package.json` for version tracking.

**Deploy action:** Bump version in `package.json`, commit, push. The Copilot CLI reads plugin metadata from GitHub.

**Required tools:** `git`

**Install command for consumers:**
```bash
copilot plugin marketplace add OWNER/REPO
copilot plugin install PLUGIN_NAME
```

---

## Version Synchronization

When multiple surfaces are active, all their config files must stay in sync. The deploy scripts handle this by:

1. Detecting all active surfaces during preflight
2. Collecting version fields from all config files
3. Reporting mismatches as warnings
4. Bumping all detected config files to the same target version during execution

**Priority order for reading current version:**
1. `.claude-plugin/plugin.json` → `.version`
2. `package.json` → `.version`

If versions disagree across files, the preflight script reports a warning and the bump step synchronizes them all.
