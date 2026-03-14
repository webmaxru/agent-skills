---
name: "Prompt API: Create Chat Demo Plain HTML"
description: "Create a simple plain HTML, CSS, and JavaScript web page with a chat UI that uses the Prompt API. Use when testing Prompt API skill routing with a static browser page and no framework setup."
argument-hint: "Optional: target folder and any UI preferences"
agent: "agent"
---

Create a simple browser web page in this workspace with a chat-style UI that uses the built-in Prompt API.

Create all generated files under `artifacts/prompt-api/`.

Build the smallest useful demo using plain HTML, CSS, and JavaScript only.

Hard requirements:

- Do not introduce React, Vue, Angular, Vite, Webpack, or other frontend frameworks or build tooling unless the user explicitly asks for them.
- Prefer a static page layout such as `artifacts/prompt-api/index.html`, `artifacts/prompt-api/styles.css`, and `artifacts/prompt-api/app.js` unless the workspace already has a more suitable plain-web entry point inside `artifacts/prompt-api/`.
- Do not treat an initial `availability() === "downloading"` result as proof that the page started a download. Before user interaction, keep that state informational unless `LanguageModel.create()` was actually called by the page.

Execution guidance:
1. Inspect the workspace and identify the simplest browser entry point under `artifacts/prompt-api/`.
2. Build a minimal chat page with:
   - message list
   - text input
   - send button
   - status area
   - cancel button if cancellation or streaming is implemented
3. Keep the code readable and minimal.
4. Validate the page with whatever run or preview path already exists in the workspace, using the artifact files in `artifacts/prompt-api/`.

When reporting back:
1. Summarize what was created.
2. List the files changed under `artifacts/prompt-api/`.
3. Call out any browser limitations or setup steps needed to test the Prompt API.