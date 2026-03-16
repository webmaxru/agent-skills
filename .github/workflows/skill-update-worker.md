---
name: Skill Update Worker
description: Run one saved skill-update prompt from .github/prompts with GitHub Copilot and create a pull request for its resulting repository changes.
on:
  workflow_dispatch:
    inputs:
      prompt_path:
        description: Path to a saved prompt under .github/prompts ending in -skill-update.prompt.md
        required: true
        type: string
  workflow_call:
    inputs:
      prompt_path:
        description: Path to a saved prompt under .github/prompts ending in -skill-update.prompt.md
        required: true
        type: string
permissions:
  actions: read
  contents: read
  pull-requests: read
concurrency:
  group: skill-update-worker-${{ github.repository }}-${{ inputs.prompt_path }}
  cancel-in-progress: false
engine: copilot
network:
  allowed:
    - defaults
    - github
tools:
  edit:
  bash:
    - python
    - node
    - git
safe-outputs:
  create-pull-request:
    title-prefix: "[skill-update] "
    draft: true
    if-no-changes: warn
    fallback-as-issue: false
  noop:
    report-as-issue: false
strict: true
timeout-minutes: 45
steps:
  - name: Prepare prompt context
    id: prepare_prompt
    shell: bash
    env:
      PROMPT_PATH: ${{ inputs.prompt_path }}
    run: |
      set -euo pipefail
      node <<'NODE'
      const fs = require('node:fs');
      const path = require('node:path');

      const promptPath = (process.env.PROMPT_PATH || '').trim();
      if (!promptPath) {
        throw new Error('prompt_path input is required');
      }
      if (!promptPath.startsWith('.github/prompts/') || !promptPath.endsWith('-skill-update.prompt.md')) {
        throw new Error('prompt_path must match .github/prompts/*-skill-update.prompt.md');
      }

      const absolutePromptPath = path.join(process.cwd(), promptPath);
      if (!fs.existsSync(absolutePromptPath)) {
        throw new Error(`Prompt file not found: ${promptPath}`);
      }

      const promptSlug = path.basename(promptPath, '.prompt.md');
      const promptText = fs.readFileSync(absolutePromptPath, 'utf8');
      const urlPattern = /https?:\/\/[^\s)>'"`]+/g;
      const uniqueUrls = Array.from(new Set(promptText.match(urlPattern) || [])).sort();

      const runtimeRoot = path.join(process.cwd(), '.github', 'aw');
      const sourcesRoot = path.join(process.cwd(), '.github', 'aw', 'prompt-sources', promptSlug);
      fs.mkdirSync(runtimeRoot, { recursive: true });
      fs.rmSync(sourcesRoot, { recursive: true, force: true });
      fs.mkdirSync(sourcesRoot, { recursive: true });

      async function fetchSource(url) {
        const response = await fetch(url, {
          headers: {
            'user-agent': 'gh-aw-skill-update-worker',
            'accept': 'text/markdown,text/plain,text/html,application/json;q=0.9,*/*;q=0.8',
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        const body = await response.text();
        return {
          status: response.status,
          contentType: response.headers.get('content-type') || 'text/plain',
          body,
        };
      }

      async function main() {
        const manifest = [];
        for (let index = 0; index < uniqueUrls.length; index += 1) {
          const url = uniqueUrls[index];
          const fetched = await fetchSource(url);
          const fileName = `${String(index + 1).padStart(2, '0')}.txt`;
          const relativeFilePath = path.posix.join('.github', 'aw', 'prompt-sources', promptSlug, fileName);
          fs.writeFileSync(path.join(sourcesRoot, fileName), fetched.body, 'utf8');
          manifest.push({
            url,
            file: relativeFilePath,
            contentType: fetched.contentType,
            status: fetched.status,
          });
        }

        const manifestRelativePath = path.posix.join('.github', 'aw', 'prompt-sources', promptSlug, 'manifest.json');
        fs.writeFileSync(path.join(sourcesRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

        const runtimeInstructionsPath = path.join(runtimeRoot, 'skill-update-runtime.md');
        const runtimeInstructions = [
          '# Skill Update Runtime Context',
          '',
          `- Saved prompt path: ${promptPath}`,
          `- Prompt slug: ${promptSlug}`,
          `- Prefetched source directory: .github/aw/prompt-sources/${promptSlug}`,
          `- Prefetched source manifest: ${manifestRelativePath}`,
          `- Prefetched source count: ${manifest.length}`,
          '',
          'Use the saved prompt path above as the single authoritative task definition for this run.',
          'Use the prefetched source files and manifest above as local replacements for any built-in URLs referenced by that prompt.',
        ].join('\n');
        fs.writeFileSync(runtimeInstructionsPath, `${runtimeInstructions}\n`, 'utf8');

        fs.appendFileSync(process.env.GITHUB_OUTPUT, `prompt_path=${promptPath}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `prompt_slug=${promptSlug}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `sources_dir=.github/aw/prompt-sources/${promptSlug}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `sources_manifest=${manifestRelativePath}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, 'runtime_instructions=.github/aw/skill-update-runtime.md\n');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `source_count=${manifest.length}\n`);
      }

      main().catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      });
      NODE
---

# Skill Update Worker

Read `.github/aw/skill-update-runtime.md` first, then execute the selected saved prompt described there and produce one pull request if that prompt leads to material repository changes.

## Inputs

- Runtime context file: `.github/aw/skill-update-runtime.md`

## Process

1. Read `.github/aw/skill-update-runtime.md` in full before taking any action.
2. Treat the markdown body of that saved prompt as the authoritative task definition for this run. Use its frontmatter only as routing and context metadata unless the body explicitly relies on it.
3. Resolve any relative file links in the saved prompt relative to the prompt file location.
4. Use the prefetched external-source copies and URL-to-file mapping listed in `.github/aw/skill-update-runtime.md` as the local substitutes for the saved prompt's built-in URLs.
5. Follow the saved prompt faithfully inside this repository: inspect the referenced files, use the prefetched source copies when the prompt refers to built-in URLs, and make only the edits justified by that prompt.
6. Reuse repository conventions from AGENTS.md and any checklist, template, validator, or support file that the saved prompt references.
7. Run the validation commands requested by the saved prompt when they apply to the files you changed and the command is available in this environment.
8. If the prompt leads to material repository changes, create exactly one pull request for this prompt run.
9. If the prompt determines that no material update is needed, or if it does not justify file edits, call `noop` with a short explanation instead of forcing a pull request.

## Pull Request Requirements

- Keep the branch and PR scoped only to the selected prompt described in `.github/aw/skill-update-runtime.md`.
- Use a concise PR title derived from the selected prompt slug in `.github/aw/skill-update-runtime.md`.
- Summarize the material deltas, validations run, and unresolved risks in the PR body.

## Constraints

- Do not process any prompt file other than the one identified in `.github/aw/skill-update-runtime.md`.
- Do not batch multiple prompt tasks into one branch or one pull request.
- Do not modify `.github/workflows/` or other automation files unless the saved prompt explicitly requires it.
- If no action is needed, call `noop` with a concise explanation.