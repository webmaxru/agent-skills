---
name: "Translator API: Create Demo Plain HTML"
description: "Create a simple plain HTML, CSS, and JavaScript web page that demonstrates browser Translator API usage. Use when testing Translator API skill routing with a static browser page and no framework setup."
argument-hint: "Optional: target folder, sample language pair, sample text, or UI preferences"
agent: "agent"
---

Create a simple browser web page in this workspace that demonstrates browser Translator API usage.

Use the existing `skills/translator-api` skill as the primary implementation guide for the demo. Read `skills/translator-api/SKILL.md` first, then read only the Translator support files needed for the chosen demo shape.

Create all generated files under `artifacts/translator-api/`.

Build the smallest useful demo using plain HTML, CSS, and JavaScript only.

Hard requirements:

- Do not introduce React, Vue, Angular, Vite, Webpack, or other frontend frameworks or build tooling unless the user explicitly asks for them.
- Prefer a static page layout such as `artifacts/translator-api/index.html`, `artifacts/translator-api/styles.css`, and `artifacts/translator-api/app.js` unless the workspace already has a more suitable plain-web entry point inside `artifacts/translator-api/`.
- Keep the demo inside `artifacts/translator-api/`; do not add persistent assets elsewhere in the repository.
- Make the demo visibly usable by a human. Do not create an agent-only hidden interaction path.
- Include a small visible status area that shows whether the Translator API appears available in the current browser context and whether the page is running in a secure context.
- Include visible UI for source text, source language, target language, triggering translation, and seeing the translated output.
- Keep any fallback path explicit. Do not silently swap in a cloud or server-side translation service.
- If the current `skills/translator-api` guidance does not support a browser-usable plain-page demo for the requested scenario, stop and explain that limitation instead of inventing a demo.

Execution guidance:
1. Inspect the workspace and identify the simplest browser entry point under `artifacts/translator-api/`.
2. Read `skills/translator-api/SKILL.md` and the minimum additional Translator support files needed to implement the demo safely.
3. Build a minimal demo that shows at least one useful Translator flow, such as:
   - secure-context and `Translator` availability detection with a clear unsupported state
   - an `availability()` check before creating the session
   - a monitored `create()` flow that can surface download progress
   - a `translate()` or `translateStreaming()` call that renders translated output
   - explicit handling for unchanged output, aborts, or unsupported language pairs
4. Keep the code readable and minimal.
5. Surface visible states for unsupported browser, insecure context, model downloading, ready session, translation in progress, and explicit fallback or limitation.
6. Validate the artifact using the simplest preview or run path already available in the workspace for `artifacts/translator-api/`.

When reporting back:
1. Summarize what was created.
2. List the files changed under `artifacts/translator-api/`.
3. Call out any browser limitations, required flags, secure-context requirements, or setup steps needed to test the Translator API.