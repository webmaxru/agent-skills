#!/usr/bin/env node

// Deploy Execution Script
// Bumps version in surface config files, commits, tags, and deploys to surfaces.
// Supports --dry-run, --bump-only, and --push modes.
// Cross-platform: works on Windows and macOS.
//
// Usage:
//   node deploy-execute.mjs <version> --surfaces <s1,s2,...> [--dry-run] [--bump-only] [--push]
//
// Surfaces: github, claude-code, vscode, copilot-cli
// Examples:
//   node deploy-execute.mjs 1.2.0 --surfaces github,claude-code --dry-run
//   node deploy-execute.mjs 1.2.0 --surfaces claude-code,vscode --bump-only
//   node deploy-execute.mjs 1.2.0 --surfaces github,claude-code,vscode,copilot-cli --push

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const VALID_SURFACES = ["github", "claude-code", "vscode", "copilot-cli"];
const root = resolve(".");

// --- Parse arguments ---

const args = process.argv.slice(2);
let version = null;
let surfaces = [];
let dryRun = false;
let bumpOnly = false;
let pushMode = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--surfaces" && args[i + 1]) {
    surfaces = args[i + 1].split(",").map((s) => s.trim().toLowerCase());
    i++;
  } else if (args[i] === "--dry-run") {
    dryRun = true;
  } else if (args[i] === "--bump-only") {
    bumpOnly = true;
  } else if (args[i] === "--push") {
    pushMode = true;
  } else if (!args[i].startsWith("--") && !version) {
    version = args[i];
  }
}

// --- Validate arguments ---

if (!version) {
  console.error("ERROR: Version argument required");
  console.error("Usage: deploy-execute.mjs <version> --surfaces <s1,s2,...> [--dry-run] [--bump-only] [--push]");
  console.error("Example: deploy-execute.mjs 1.2.0 --surfaces github,claude-code --dry-run");
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`ERROR: Invalid version format: ${version}`);
  console.error("Expected: X.Y.Z (e.g., 1.2.0)");
  process.exit(1);
}

if (surfaces.length === 0) {
  console.error("ERROR: At least one surface required (--surfaces github,claude-code,vscode,copilot-cli)");
  process.exit(1);
}

for (const s of surfaces) {
  if (!VALID_SURFACES.includes(s)) {
    console.error(`ERROR: Unknown surface '${s}'. Valid: ${VALID_SURFACES.join(", ")}`);
    process.exit(1);
  }
}

const tagName = `v${version}`;
const modeLabel = dryRun ? "DRY RUN" : bumpOnly ? "BUMP ONLY" : pushMode ? "PUSH" : "EXECUTE";

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e) {
    return null;
  }
}

function runOrFail(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e) {
    console.error(`ERROR: Command failed: ${cmd}`);
    if (e.stderr) console.error(e.stderr.toString());
    process.exit(1);
  }
}

function logAction(action) {
  const prefix = dryRun ? "[DRY RUN]" : "[EXECUTE]";
  console.log(`${prefix} ${action}`);
}

// --- Git checks ---

if (!run("git rev-parse --git-dir")) {
  console.error("ERROR: Not a git repository");
  process.exit(1);
}

// Check if tag already exists
const existingTags = run("git tag -l") || "";
if (existingTags.split("\n").includes(tagName)) {
  console.error(`ERROR: Tag ${tagName} already exists`);
  process.exit(1);
}

console.log(`=== Deploy ${modeLabel}: v${version} ===`);
console.log(`Surfaces: ${surfaces.join(", ")}`);
console.log("");

// --- Collect files to update ---

const updates = [];

function readJsonSafe(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeJsonSafe(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// Claude Code surface
// plugin.json is sufficient. marketplace.json is optional — if absent, the plugin
// is assumed to be listed by a marketplace defined in another repository.
if (surfaces.includes("claude-code")) {
  const pluginPath = join(root, ".claude-plugin", "plugin.json");
  const marketplacePath = join(root, ".claude-plugin", "marketplace.json");

  if (existsSync(pluginPath)) {
    const data = readJsonSafe(pluginPath);
    if (data) {
      const oldVersion = data.version || "unset";
      updates.push({
        surface: "claude-code",
        file: ".claude-plugin/plugin.json",
        path: pluginPath,
        field: "version",
        oldValue: oldVersion,
        apply: () => {
          data.version = version;
          writeJsonSafe(pluginPath, data);
        },
      });
    }
  } else {
    console.error("WARNING: .claude-plugin/plugin.json not found — skipping claude-code surface");
  }

  if (existsSync(marketplacePath)) {
    const data = readJsonSafe(marketplacePath);
    if (data) {
      const oldVersion = (data.plugins && data.plugins[0] && data.plugins[0].version) || data.version || "unset";
      updates.push({
        surface: "claude-code",
        file: ".claude-plugin/marketplace.json",
        path: marketplacePath,
        field: "plugins[0].version or version",
        oldValue: oldVersion,
        apply: () => {
          if (data.plugins && data.plugins[0]) {
            data.plugins[0].version = version;
          }
          if (data.version !== undefined) {
            data.version = version;
          }
          writeJsonSafe(marketplacePath, data);
        },
      });
    }
  } else {
    logAction("claude-code: marketplace.json absent — external marketplace assumed, bumping plugin.json only");
  }
}

// VS Code surface
if (surfaces.includes("vscode")) {
  const pkgPath = join(root, "package.json");
  if (existsSync(pkgPath)) {
    const data = readJsonSafe(pkgPath);
    if (data) {
      const oldVersion = data.version || "unset";
      updates.push({
        surface: "vscode",
        file: "package.json",
        path: pkgPath,
        field: "version",
        oldValue: oldVersion,
        apply: () => {
          data.version = version;
          writeJsonSafe(pkgPath, data);
        },
      });
    }
  } else {
    console.error("WARNING: package.json not found — skipping VS Code surface");
  }
}

// Copilot CLI surface (also uses package.json, deduplicate if vscode already covers it)
if (surfaces.includes("copilot-cli")) {
  const pkgPath = join(root, "package.json");
  const alreadyHasPkgUpdate = updates.some((u) => u.file === "package.json");

  if (!alreadyHasPkgUpdate && existsSync(pkgPath)) {
    const data = readJsonSafe(pkgPath);
    if (data) {
      const oldVersion = data.version || "unset";
      updates.push({
        surface: "copilot-cli",
        file: "package.json",
        path: pkgPath,
        field: "version",
        oldValue: oldVersion,
        apply: () => {
          data.version = version;
          writeJsonSafe(pkgPath, data);
        },
      });
    }
  } else if (alreadyHasPkgUpdate) {
    logAction("copilot-cli: package.json already covered by vscode surface");
  }
}

// --- Report planned changes ---

if (updates.length > 0) {
  console.log("=== Version Bump Plan ===");
  for (const u of updates) {
    console.log(`[${u.surface}] ${u.file}: ${u.field} ${u.oldValue} → ${version}`);
  }
  console.log("");
}

// --- Execute version bump ---

if (!dryRun && (bumpOnly || !pushMode)) {
  console.log("=== Bumping Versions ===");
  for (const u of updates) {
    u.apply();
    console.log(`Updated ${u.file}`);
  }

  // Verify
  for (const u of updates) {
    const data = readJsonSafe(u.path);
    let actual = null;
    if (u.file === ".claude-plugin/marketplace.json") {
      actual = (data.plugins && data.plugins[0] && data.plugins[0].version) || data.version;
    } else {
      actual = data.version;
    }
    if (actual !== version) {
      console.error(`ERROR: Verification failed for ${u.file} (got ${actual}, expected ${version})`);
      process.exit(1);
    }
  }
  console.log(`Verified: all files updated to ${version}`);
  console.log("");
}

// --- Git operations ---

if (!dryRun && bumpOnly) {
  console.log("SUCCESS: Version bump complete (--bump-only mode)");
  console.log("Next: stage, commit, tag, and push");
  process.exit(0);
}

if (dryRun) {
  console.log("=== Planned Git Operations ===");
  const filesToStage = updates.map((u) => u.file);
  logAction(`git add ${filesToStage.join(" ")}`);
  logAction(`git commit -m "Release ${tagName}"`);
  logAction(`git tag ${tagName}`);

  if (surfaces.includes("github") || surfaces.includes("claude-code") || surfaces.includes("vscode") || surfaces.includes("copilot-cli")) {
    logAction("git push origin HEAD");
    logAction("git push origin --tags");
  }

  console.log("");
  console.log("=== Planned Surface Deployments ===");

  if (surfaces.includes("github")) {
    const hasGh = !!run("gh --version");
    if (hasGh) {
      logAction(`gh release create ${tagName} --generate-notes`);
    } else {
      logAction("GitHub release: gh CLI not available — manual release creation needed");
    }
  }

  if (surfaces.includes("vscode")) {
    const hasVsce = !!run("vsce --version");
    if (hasVsce) {
      logAction("vsce publish (if user opts in)");
    } else {
      logAction("VS Code marketplace: vsce not available — push-based deploy only");
    }
  }

  if (surfaces.includes("claude-code")) {
    logAction("Claude Code marketplace: push-based — no additional action needed");
  }

  if (surfaces.includes("copilot-cli")) {
    logAction("Copilot CLI marketplace: push-based — no additional action needed");
  }

  console.log("");
  console.log("DRY RUN COMPLETE: No changes were made");
  process.exit(0);
}

// --- Push mode ---

if (pushMode) {
  console.log("=== Pushing to Remote ===");

  const remote = run("git remote") ? run("git remote").split("\n")[0] : null;
  if (!remote) {
    console.error("ERROR: No git remote configured");
    process.exit(1);
  }

  console.log(`Remote: ${remote}`);

  const pushResult = run(`git push ${remote} HEAD`);
  if (pushResult === null) {
    // execSync returns null on error but push might write to stderr on success
    const testPush = (() => {
      try {
        execSync(`git push ${remote} HEAD`, { encoding: "utf8", stdio: "pipe" });
        return true;
      } catch {
        return false;
      }
    })();
    if (!testPush) {
      console.error("ERROR: Failed to push commits");
      process.exit(1);
    }
  }
  console.log("SUCCESS: Commits pushed");

  const tagPushResult = (() => {
    try {
      execSync(`git push ${remote} --tags`, { encoding: "utf8", stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  })();
  if (!tagPushResult) {
    console.error("ERROR: Failed to push tags");
    process.exit(1);
  }
  console.log("SUCCESS: Tags pushed");
  console.log("");

  // Surface-specific deployments
  let surfaceErrors = 0;

  if (surfaces.includes("github")) {
    console.log("=== GitHub Release ===");
    const hasGh = !!run("gh --version");
    if (hasGh) {
      const releaseResult = run(`gh release create ${tagName} --generate-notes`);
      if (releaseResult !== null) {
        console.log(`SUCCESS: GitHub release ${tagName} created`);
      } else {
        // gh release might output to stderr on success
        try {
          execSync(`gh release create ${tagName} --generate-notes`, { encoding: "utf8", stdio: "pipe" });
          console.log(`SUCCESS: GitHub release ${tagName} created`);
        } catch {
          console.error(`ERROR: Failed to create GitHub release ${tagName}`);
          surfaceErrors++;
        }
      }
    } else {
      console.log("SKIPPED: gh CLI not available — create release manually");
    }
  }

  if (surfaces.includes("vscode")) {
    console.log("=== VS Code Marketplace ===");
    const hasVsce = !!run("vsce --version");
    if (hasVsce) {
      console.log("INFO: Run 'vsce publish' manually to publish to VS Code marketplace");
      console.log("      (Automated vsce publish requires PAT and publisher configuration)");
    } else {
      console.log("INFO: Push-based deploy complete. Install via 'Chat: Install Plugin From Source'");
    }
  }

  if (surfaces.includes("claude-code")) {
    console.log("=== Claude Code Marketplace ===");
    console.log("INFO: Push-based deploy complete. Plugin available via marketplace.");
  }

  if (surfaces.includes("copilot-cli")) {
    console.log("=== Copilot CLI Marketplace ===");
    console.log("INFO: Push-based deploy complete. Plugin available via 'copilot plugin marketplace add'.");
  }

  // Post-release info
  const remoteUrl = (run("git remote get-url origin") || "").replace(/\.git$/, "");
  console.log("");
  console.log("=== Post-Release ===");
  console.log(`Release: ${tagName}`);
  if (remoteUrl) {
    console.log(`GitHub Releases: ${remoteUrl}/releases`);
    console.log(`Tag: ${remoteUrl}/releases/tag/${tagName}`);
  }

  if (surfaceErrors > 0) {
    console.log("");
    console.log(`WARNING: ${surfaceErrors} surface deployment(s) had errors — see above`);
    process.exit(1);
  }

  console.log("");
  console.log(`SUCCESS: Deploy ${tagName} completed`);
  process.exit(0);
}
