---
name: "WebNN: Create Demo Plain HTML"
description: "Create a simple plain HTML, CSS, and JavaScript web page that demonstrates browser WebNN. Use when testing WebNN skill routing with a static browser page and no framework setup."
argument-hint: "Optional: target folder, demo task, preferred device intent, or UI preferences"
agent: "agent"
---

Create a simple browser web page in this workspace that demonstrates browser WebNN.

Use the existing `skills/webnn` skill as the primary implementation guide for the demo. Read `skills/webnn/SKILL.md` first, then read only the WebNN references or assets needed for the chosen demo shape.

Create all generated files under `artifacts/webnn/`.

Build the smallest useful demo using plain HTML, CSS, and JavaScript only.

Hard requirements:

- Do not introduce React, Vue, Angular, Vite, Webpack, or other frontend frameworks or build tooling unless the user explicitly asks for them.
- Prefer a static page layout such as `artifacts/webnn/index.html`, `artifacts/webnn/styles.css`, and `artifacts/webnn/app.js` unless the workspace already has a more suitable plain-web entry point inside `artifacts/webnn/`.
- Keep the demo inside `artifacts/webnn/`; do not add persistent assets elsewhere in the repository.
- Make the demo visibly usable by a human. Do not create an agent-only hidden interaction path.
- Include a small visible status area that shows whether WebNN appears available in the current browser context and whether the page is running in a secure context.
- Keep any fallback path explicit. Do not silently swap in remote inference when the demo is meant to stay local.
- If the current `skills/webnn` guidance does not support a browser-usable plain-page demo for the requested scenario, stop and explain that limitation instead of inventing a demo.

Execution guidance:
1. Inspect the workspace and identify the simplest browser entry point under `artifacts/webnn/`.
2. Read `skills/webnn/SKILL.md` and the minimum additional WebNN support files needed to implement the demo safely.
3. Build a minimal demo that shows at least one useful WebNN-related flow, such as:
   - secure-context and `navigator.ml` availability detection with a clear unsupported state
   - a context-creation attempt with an explicit `deviceType` intent
   - a trivial direct graph path that writes input, dispatches, and reads output when the environment supports it
   - an explicit local fallback explanation when the runtime is unavailable
4. Keep the code readable and minimal.
5. Surface visible states for unsupported browser, insecure context, preparing runtime, ready native path, and explicit fallback or limitation.
6. Validate the artifact using the simplest preview or run path already available in the workspace for `artifacts/webnn/`.

When reporting back:
1. Summarize what was created.
2. List the files changed under `artifacts/webnn/`.
3. Call out any browser limitations, required flags, secure-context requirements, or setup steps needed to test WebNN.