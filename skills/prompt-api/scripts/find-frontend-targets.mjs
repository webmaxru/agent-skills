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

const PROMPT_API_MARKERS = [
  "LanguageModel",
  "promptStreaming",
  "responseConstraint",
  'allow="language-model"',
];

const PRIORITY_FILES = new Map([
  ["package.json", 100],
  ["index.html", 90],
  ["vite.config.ts", 80],
  ["vite.config.js", 80],
  ["src/main.ts", 75],
  ["src/main.tsx", 75],
  ["src/main.js", 75],
  ["src/main.jsx", 75],
  ["src/app.tsx", 70],
  ["src/app.ts", 70],
  ["src/app.jsx", 70],
  ["src/app.js", 70],
]);

const SCAN_EXTENSIONS = new Set([".html", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"]);

function toPosixRelative(root, targetPath) {
  return path.relative(root, targetPath).split(path.sep).join("/");
}

function walkFiles(root) {
  const files = [];
  const pending = [root];

  while (pending.length > 0) {
    const current = pending.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          pending.push(path.join(current, entry.name));
        }
        continue;
      }

      if (entry.isFile()) {
        files.push(path.join(current, entry.name));
      }
    }
  }

  return files;
}

function scoreFile(root, filePath) {
  const relative = toPosixRelative(root, filePath);
  if (PRIORITY_FILES.has(relative)) {
    return PRIORITY_FILES.get(relative);
  }

  if (SCAN_EXTENSIONS.has(path.extname(filePath))) {
    return 40;
  }

  return 0;
}

function findPromptMarkers(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return [];
  }

  return PROMPT_API_MARKERS.filter((marker) => content.includes(marker));
}

function main() {
  const rootArg = process.argv[2] ?? ".";
  const root = path.resolve(rootArg);

  if (!fs.existsSync(root)) {
    console.error(`Path does not exist: ${root}`);
    process.exit(1);
  }

  const scoredFiles = [];
  const promptHits = [];

  for (const filePath of walkFiles(root)) {
    const score = scoreFile(root, filePath);
    if (score > 0) {
      scoredFiles.push([score, toPosixRelative(root, filePath)]);
    }

    if (SCAN_EXTENSIONS.has(path.extname(filePath))) {
      const markers = findPromptMarkers(filePath);
      if (markers.length > 0) {
        promptHits.push([toPosixRelative(root, filePath), markers]);
      }
    }
  }

  scoredFiles.sort((left, right) => right[0] - left[0] || left[1].localeCompare(right[1]));
  promptHits.sort((left, right) => left[0].localeCompare(right[0]));

  console.log("Frontend targets:");
  if (scoredFiles.length > 0) {
    for (const [, relative] of scoredFiles.slice(0, 20)) {
      console.log(`- ${relative}`);
    }
  } else {
    console.log("- No likely frontend files found");
  }

  console.log("\nPrompt API indicators:");
  if (promptHits.length > 0) {
    for (const [relative, markers] of promptHits) {
      console.log(`- ${relative}: ${markers.join(", ")}`);
    }
  } else {
    console.log("- No Prompt API markers found");
  }
}

main();