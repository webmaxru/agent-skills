import fs from "node:fs";
import path from "node:path";

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  "out",
  "target",
  "venv",
  ".venv",
  "__pycache__",
]);

const PRIORITY_FILES = new Map([
  [".github/agents/agentic-workflows.agent.md", 120],
  ["README.md", 40],
  ["package.json", 30],
  ["apm.yml", 25],
  ["apm.lock.yaml", 25],
]);

const SCAN_EXTENSIONS = new Set([".md", ".yml", ".yaml", ".json", ".txt"]);

const TEXT_MARKERS = [
  "gh aw ",
  "github/gh-aw",
  "githubnext/agentics",
  "safe-outputs:",
  "create-pull-request:",
  "dispatch-workflow:",
  "call-workflow:",
  "engine:",
  "toolsets:",
  "github-app:",
  "network:",
  "staged:",
  "workflow_dispatch:",
  "workflow_call:",
  "lockdown:",
];

function toPosixRelative(root, targetPath) {
  return path.relative(root, targetPath).split(path.sep).join("/");
}

function readDirEntries(directoryPath) {
  try {
    return fs.readdirSync(directoryPath, { withFileTypes: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Warning: Skipping unreadable directory ${directoryPath}: ${message}`);
    return [];
  }
}

function walkFiles(root) {
  const files = [];
  const pending = [root];

  while (pending.length > 0) {
    const current = pending.pop();
    const entries = readDirEntries(current);

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          pending.push(entryPath);
        }
        continue;
      }

      if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function scoreFile(root, filePath) {
  const relative = toPosixRelative(root, filePath);

  if (relative.startsWith(".github/workflows/")) {
    if (relative.endsWith(".md")) {
      return 100;
    }

    if (relative.endsWith(".lock.yml") || relative.endsWith(".yml") || relative.endsWith(".yaml")) {
      return 80;
    }
  }

  if (PRIORITY_FILES.has(relative)) {
    return PRIORITY_FILES.get(relative);
  }

  if (SCAN_EXTENSIONS.has(path.extname(filePath))) {
    return 20;
  }

  return 0;
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function findMarkers(filePath) {
  const content = readText(filePath);
  if (content === null) {
    return [];
  }

  return TEXT_MARKERS.filter((marker) => content.includes(marker));
}

function main() {
  const rootArg = process.argv[2] ?? ".";
  const root = path.resolve(rootArg);

  if (!fs.existsSync(root)) {
    console.error(`Path does not exist: ${root}`);
    process.exit(1);
  }

  const workflowFiles = [];
  const scoredFiles = [];
  const markerHits = [];

  for (const filePath of walkFiles(root)) {
    const relative = toPosixRelative(root, filePath);
    const score = scoreFile(root, filePath);

    if (score > 0) {
      scoredFiles.push([score, relative]);
    }

    if (relative.startsWith(".github/workflows/")) {
      workflowFiles.push(relative);
    }

    if (SCAN_EXTENSIONS.has(path.extname(filePath))) {
      const markers = findMarkers(filePath);
      if (markers.length > 0) {
        markerHits.push([relative, markers]);
      }
    }
  }

  scoredFiles.sort((left, right) => right[0] - left[0] || left[1].localeCompare(right[1]));
  workflowFiles.sort((left, right) => left.localeCompare(right));
  markerHits.sort((left, right) => left[0].localeCompare(right[0]));

  console.log("Workflow files:");
  if (workflowFiles.length > 0) {
    for (const relative of workflowFiles) {
      console.log(`- ${relative}`);
    }
  } else {
    console.log("- No .github/workflows files found");
  }

  console.log("\nPriority targets:");
  if (scoredFiles.length > 0) {
    for (const [, relative] of scoredFiles.slice(0, 20)) {
      console.log(`- ${relative}`);
    }
  } else {
    console.log("- No likely GH-AW targets found");
  }

  console.log("\nGH-AW indicators:");
  if (markerHits.length > 0) {
    for (const [relative, markers] of markerHits) {
      console.log(`- ${relative}: ${markers.join(", ")}`);
    }
  } else {
    console.log("- No GH-AW markers found");
  }
}

main();