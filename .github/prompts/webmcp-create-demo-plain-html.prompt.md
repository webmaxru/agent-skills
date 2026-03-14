---
name: "WebMCP: Create Demo Plain HTML"
description: "Create a simple plain HTML, CSS, and JavaScript web page that demonstrates browser WebMCP. Use when testing WebMCP skill routing with a static browser page and no framework setup."
argument-hint: "Optional: target folder, imperative vs declarative preference, and any UI preferences"
agent: "agent"
---

Create a simple browser web page in this workspace that demonstrates browser WebMCP.

Create all generated files under `artifacts/webmcp/`.

Build the smallest useful demo using plain HTML, CSS, and JavaScript only.

Hard requirements:

- Do not introduce React, Vue, Angular, Vite, Webpack, or other frontend frameworks or build tooling unless the user explicitly asks for them.
- Prefer a static page layout such as `artifacts/webmcp/index.html`, `artifacts/webmcp/styles.css`, and `artifacts/webmcp/app.js` unless the workspace already has a more suitable plain-web entry point inside `artifacts/webmcp/`.
- Keep the demo inside `artifacts/webmcp/`; do not add persistent assets elsewhere in the repository.
- Make the demo visibly usable by a human as well as by an agent. Do not create an agent-only hidden interaction path.
- If the demo uses declarative WebMCP, keep the form as the authoritative workflow and handle agent-triggered submits through page logic rather than bypassing the UI.
- If the demo uses imperative WebMCP, register tools with `navigator.modelContext.registerTool()` and keep the page state synchronized before returning tool results.

Execution guidance:
1. Inspect the workspace and identify the simplest browser entry point under `artifacts/webmcp/`.
2. Build a minimal demo that shows at least one useful WebMCP tool.
3. Prefer the simplest WebMCP shape that clearly demonstrates the feature:
   - declarative form-based tool if a visible form is the clearest demo
   - imperative registration if showing `navigator.modelContext` directly is clearer
4. Include a small visible status area that shows whether WebMCP appears available in the current browser context.
5. If the demo uses declarative WebMCP, include a labeled form, submit control, and any custom submit handling needed to show results or validation errors.
6. If the demo uses imperative WebMCP, include the visible UI that the registered tool reads from or updates.
7. Keep the code readable and minimal.
8. Validate the page with whatever run or preview path already exists in the workspace, using the artifact files in `artifacts/webmcp/`.

When reporting back:
1. Summarize what was created.
2. List the files changed under `artifacts/webmcp/`.
3. Call out any browser limitations, preview flags, or setup steps needed to test WebMCP.