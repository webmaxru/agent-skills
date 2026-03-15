---
name: "Proofreader API: Create Demo Plain HTML"
description: "Create a simple plain HTML, CSS, and JavaScript web page that demonstrates browser Proofreader API. Use when testing the proofreader-api skill routing with a static browser page and no framework setup."
argument-hint: "Optional: target folder and any UI preferences"
agent: "agent"
---

Create a simple browser web page in this workspace that demonstrates the Proofreader API.

Create all generated files under `artifacts/proofreader-api/`.

Build the smallest useful demo using plain HTML, CSS, and JavaScript only.

Hard requirements:

- Do not introduce React, Vue, Angular, Vite, Webpack, or other frontend frameworks or build tooling unless the user explicitly asks for them.
- Prefer a static page layout such as `artifacts/proofreader-api/index.html`, `artifacts/proofreader-api/styles.css`, and `artifacts/proofreader-api/app.js` unless the workspace already has a more suitable plain-web entry point inside `artifacts/proofreader-api/`.
- Keep the demo inside `artifacts/proofreader-api/`; do not add persistent assets elsewhere in the repository.
- Make the demo visibly usable by a human. Do not create an agent-only hidden interaction path.
- Include a small visible status area that shows whether `Proofreader` is present, whether the model looks downloadable or downloading or available, and whether a session is active.
- If the current browser cannot use the Proofreader API, keep the page usable enough to explain the limitation instead of failing silently.

Execution guidance:
1. Inspect the workspace and identify the simplest browser entry point under `artifacts/proofreader-api/`.
2. Use `skills/proofreader-api` as the primary implementation guide.
3. Build a minimal demo that lets a human paste or type text, create a session, proofread the text, and inspect the corrected text plus the correction list.
4. Prefer a compact layout with a visible input area, options area, output area, progress or status panel, and a reset or destroy-session control when useful.
5. If the current browser lacks support for correction-type or explanation options, keep those controls disabled or absent instead of pretending they work.
6. If the browser or environment lacks the required support, present the limitation clearly and keep the rest of the page readable.
7. Keep the code readable and minimal.
8. Validate the page with whatever run or preview path already exists in the workspace, using the artifact files in `artifacts/proofreader-api/`.

Stop conditions:
- If the current skill no longer describes a browser-usable API that can be demonstrated in a plain web page, stop and explain that limitation instead of inventing a demo.

When reporting back:
1. Summarize what was created.
2. List the files changed under `artifacts/proofreader-api/`.
3. Call out any browser limitations, preview flags, origin-trial requirements, or setup steps needed to test the demo.