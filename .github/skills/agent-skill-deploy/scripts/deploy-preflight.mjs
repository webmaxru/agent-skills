#!/usr/bin/env node

// Deploy Pre-flight Script
// Validates git state, discovers deployment surfaces, checks tool availability,
// and verifies version consistency across surface config files.
// Cross-platform: works on Windows and macOS.
// Usage: node deploy-preflight.mjs [--skills-dir <path>]

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
let skillsDir = "skills";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--skills-dir" && args[i + 1]) {
    skillsDir = args[i + 1];
    i++;
  }
}

const root = resolve(".");
let exitCode = 0;

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  exitCode = 1;
}

function warn(msg) {
  console.error(`WARNING: ${msg}`);
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

// --- Git checks ---

if (!run("git rev-parse --git-dir")) {
  fail("Not a git repository");
  process.exit(1);
}

const branch = run("git branch --show-current");
console.log(`Branch: ${branch}`);

if (branch !== "master" && branch !== "main") {
  fail(`Not on master or main branch (current: ${branch})`);
} else {
  ok(`On branch ${branch}`);
}

const porcelain = run("git status --porcelain");
if (porcelain) {
  fail("Uncommitted changes detected");
  console.error(porcelain);
} else {
  ok("Working tree is clean");
}

// --- Skills directory ---

const skillsPath = join(root, skillsDir);
if (!existsSync(skillsPath)) {
  fail(`Skills directory not found: ${skillsDir}`);
} else {
  const entries = [];
  try {
    const { readdirSync, statSync } = await import("node:fs");
    for (const entry of readdirSync(skillsPath)) {
      const entryPath = join(skillsPath, entry);
      if (statSync(entryPath).isDirectory()) {
        const skillFile = join(entryPath, "SKILL.md");
        if (existsSync(skillFile)) {
          entries.push(entry);
        }
      }
    }
  } catch (e) {
    fail(`Failed to read skills directory: ${e.message}`);
  }

  if (entries.length === 0) {
    fail(`No skills found in ${skillsDir}/ (directories with SKILL.md)`);
  } else {
    ok(`Found ${entries.length} skill(s): ${entries.join(", ")}`);
  }
}

// --- Surface detection ---

const surfaces = [];
const versions = {};

// GitHub surface
const remoteUrl = run("git remote get-url origin");
if (remoteUrl) {
  surfaces.push("github");
  ok(`GitHub surface detected: ${remoteUrl}`);
} else {
  warn("No git remote 'origin' found — GitHub surface unavailable");
}

// Claude Code surface
const pluginJson = join(root, ".claude-plugin", "plugin.json");
const marketplaceJson = join(root, ".claude-plugin", "marketplace.json");

if (existsSync(pluginJson) && existsSync(marketplaceJson)) {
  surfaces.push("claude-code");
  try {
    const plugin = JSON.parse(readFileSync(pluginJson, "utf8"));
    const marketplace = JSON.parse(readFileSync(marketplaceJson, "utf8"));
    const pv = plugin.version || null;
    const mv = marketplace.version || (marketplace.plugins && marketplace.plugins[0] && marketplace.plugins[0].version) || null;

    if (pv) versions["claude-code:plugin.json"] = pv;
    if (mv) versions["claude-code:marketplace.json"] = mv;

    ok(`Claude Code surface detected (plugin: ${pv || "unset"}, marketplace: ${mv || "unset"})`);

    if (pv && mv && pv !== mv) {
      warn(`Claude Code version mismatch: plugin.json=${pv}, marketplace.json=${mv}`);
    }
  } catch (e) {
    warn(`Claude Code config parse error: ${e.message}`);
  }
} else {
  if (existsSync(pluginJson) || existsSync(marketplaceJson)) {
    warn("Partial Claude Code config — both plugin.json and marketplace.json are required");
  }
}

// VS Code / Copilot CLI surface (both use package.json)
const packageJson = join(root, "package.json");
if (existsSync(packageJson)) {
  try {
    const pkg = JSON.parse(readFileSync(packageJson, "utf8"));
    const pv = pkg.version || null;

    if (pv) versions["package.json"] = pv;

    // VS Code surface: check for vscode-specific fields or publisher
    if (pkg.publisher || (pkg.engines && pkg.engines.vscode)) {
      surfaces.push("vscode");
      ok(`VS Code surface detected (version: ${pv || "unset"}, publisher: ${pkg.publisher || "unset"})`);
    } else {
      surfaces.push("vscode");
      ok(`VS Code surface detected via package.json (version: ${pv || "unset"})`);
    }

    // Copilot CLI surface
    surfaces.push("copilot-cli");
    ok(`Copilot CLI surface detected via package.json (version: ${pv || "unset"})`);
  } catch (e) {
    warn(`package.json parse error: ${e.message}`);
  }
}

// --- Tool availability ---

const tools = {
  git: !!run("git --version"),
  node: !!run("node --version"),
  gh: !!run("gh --version"),
  vsce: !!run("vsce --version"),
  jq: !!run("jq --version"),
};

console.log("");
console.log("=== Tool Availability ===");
for (const [tool, available] of Object.entries(tools)) {
  console.log(`${tool}: ${available ? "available" : "NOT FOUND"}`);
}

if (!tools.git) fail("git is required but not found");
if (surfaces.includes("github") && !tools.gh) {
  warn("gh CLI not found — GitHub release creation will not be available");
}
if (surfaces.includes("vscode") && !tools.vsce) {
  warn("vsce not found — VS Code marketplace publishing will not be available (push-based deploy still works)");
}

// --- Version consistency ---

const uniqueVersions = [...new Set(Object.values(versions))];

console.log("");
console.log("=== Version Summary ===");
for (const [source, ver] of Object.entries(versions)) {
  console.log(`${source}: ${ver}`);
}

if (uniqueVersions.length > 1) {
  warn(`Version mismatch across surfaces: ${JSON.stringify(versions)}`);
} else if (uniqueVersions.length === 1) {
  ok(`All surfaces at version ${uniqueVersions[0]}`);
} else {
  warn("No versions detected in any surface config");
}

// --- Summary ---

console.log("");
console.log("=== Detected Surfaces ===");
console.log(surfaces.length > 0 ? surfaces.join(", ") : "none");

console.log("");
if (exitCode === 0) {
  console.log("SUCCESS: All pre-flight checks passed");
} else {
  console.log("FAILED: Pre-flight checks had errors — see above");
}

process.exit(exitCode);
