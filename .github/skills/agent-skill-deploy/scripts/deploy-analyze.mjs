#!/usr/bin/env node

// Deploy Analysis Script
// Inventories skills, analyzes commits since last tag, and recommends version bump.
// Cross-platform: works on Windows and macOS.
// Usage: node deploy-analyze.mjs [--skills-dir <path>]

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

// --- Git repository check ---

if (!run("git rev-parse --git-dir")) {
  console.error("ERROR: Not a git repository");
  process.exit(1);
}

// --- Skills inventory ---

const skillsPath = join(root, skillsDir);
const skills = [];

if (existsSync(skillsPath)) {
  for (const entry of readdirSync(skillsPath)) {
    const entryPath = join(skillsPath, entry);
    if (statSync(entryPath).isDirectory() && existsSync(join(entryPath, "SKILL.md"))) {
      skills.push(entry);
    }
  }
}

console.log("=== Skills Inventory ===");
console.log(`Directory: ${skillsDir}/`);
console.log(`Count: ${skills.length}`);
if (skills.length > 0) {
  for (const skill of skills) {
    console.log(`  - ${skill}`);
  }
}
console.log("");

// --- Current version ---

function detectCurrentVersion() {
  const pluginJson = join(root, ".claude-plugin", "plugin.json");
  const packageJson = join(root, "package.json");

  if (existsSync(pluginJson)) {
    try {
      const data = JSON.parse(readFileSync(pluginJson, "utf8"));
      if (data.version) return data.version;
    } catch { /* ignore */ }
  }

  if (existsSync(packageJson)) {
    try {
      const data = JSON.parse(readFileSync(packageJson, "utf8"));
      if (data.version) return data.version;
    } catch { /* ignore */ }
  }

  return "unknown";
}

const currentVersion = detectCurrentVersion();
console.log(`Current version: ${currentVersion}`);

// --- Last tag ---

const lastTag = run("git describe --tags --abbrev=0");

if (!lastTag) {
  console.log("INFO: No previous release tags found (first release)");
  console.log("");
  console.log("Recent commits (last 20):");
  const recentLog = run("git log --oneline -20");
  if (recentLog) console.log(recentLog);
  console.log("");
  console.log("=== Recommendation ===");
  console.log("MINOR bump (first release)");
  process.exit(0);
}

console.log(`Last release tag: ${lastTag}`);

// --- Commit count ---

const commitCountStr = run(`git rev-list "${lastTag}"..HEAD --count`);
const commitCount = parseInt(commitCountStr || "0", 10);

if (commitCount === 0) {
  console.log("INFO: No new commits since last release");
  process.exit(0);
}

console.log(`Commits since last release: ${commitCount}`);
console.log("");

// --- Commit history ---

console.log("=== Commit History ===");
const commitLog = run(`git log "${lastTag}"..HEAD --oneline`);
if (commitLog) console.log(commitLog);
console.log("");

// --- Conventional commit analysis ---

function countPattern(pattern) {
  const subjects = run(`git log "${lastTag}"..HEAD --format="%s"`);
  if (!subjects) return 0;
  const re = new RegExp(pattern, "m");
  return subjects.split("\n").filter((line) => re.test(line)).length;
}

const types = {
  feat: countPattern("^feat(\\(.*\\))?!?:"),
  fix: countPattern("^fix(\\(.*\\))?!?:"),
  refactor: countPattern("^refactor(\\(.*\\))?!?:"),
  docs: countPattern("^docs(\\(.*\\))?!?:"),
  chore: countPattern("^chore(\\(.*\\))?!?:"),
  style: countPattern("^style(\\(.*\\))?!?:"),
  ci: countPattern("^ci(\\(.*\\))?!?:"),
  test: countPattern("^test(\\(.*\\))?!?:"),
};

// Breaking changes: "type!:" suffix
const breakingSuffix = countPattern("^[a-z]+(\\(.*\\))?!:");

// Breaking changes: "BREAKING CHANGE" in commit body
let breakingBody = 0;
const bodies = run(`git log "${lastTag}"..HEAD --format="%b"`);
if (bodies) {
  breakingBody = bodies.split("\n").filter((line) => /^BREAKING CHANGE:/.test(line)).length;
}

const breakingCount = breakingSuffix + breakingBody;

const classified = Object.values(types).reduce((a, b) => a + b, 0);
const other = commitCount - classified;

console.log("=== Change Summary ===");
console.log(`Features:      ${types.feat}`);
console.log(`Fixes:         ${types.fix}`);
console.log(`Refactoring:   ${types.refactor}`);
console.log(`Documentation: ${types.docs}`);
console.log(`Chore:         ${types.chore}`);
console.log(`Style:         ${types.style}`);
console.log(`CI:            ${types.ci}`);
console.log(`Tests:         ${types.test}`);
console.log(`Other:         ${other}`);
console.log(`Breaking:      ${breakingCount}`);
console.log("");

// --- File change stats ---

console.log("=== File Changes ===");
const diffStat = run(`git diff "${lastTag}"..HEAD --stat`);
if (diffStat) console.log(diffStat);
console.log("");

// --- Skills changed since last tag ---

const skillChanges = run(`git diff "${lastTag}"..HEAD --name-only -- "${skillsDir}/"`);
if (skillChanges) {
  const changedSkills = new Set();
  for (const file of skillChanges.split("\n")) {
    const parts = file.split("/");
    if (parts.length >= 2 && parts[0] === skillsDir) {
      changedSkills.add(parts[1]);
    }
  }
  if (changedSkills.size > 0) {
    console.log("=== Skills Changed ===");
    for (const skill of changedSkills) {
      console.log(`  - ${skill}`);
    }
    console.log("");
  }
}

// --- Recommendation ---

console.log("=== Recommendation ===");
if (breakingCount > 0) {
  console.log("MAJOR bump (breaking changes detected)");
} else if (types.feat > 0) {
  console.log("MINOR bump (new features added)");
} else if (types.fix > 0 || types.refactor > 0) {
  console.log("PATCH bump (fixes or refactoring)");
} else if (types.docs > 0 || types.chore > 0 || types.style > 0 || types.ci > 0 || types.test > 0) {
  console.log("PATCH bump (maintenance changes)");
} else {
  console.log("MANUAL review needed (no conventional commits found)");
}
