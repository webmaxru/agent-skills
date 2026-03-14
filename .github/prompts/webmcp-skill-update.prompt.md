---
name: "WebMCP: Update Skill"
description: "Refresh the skills/webmcp skill from user-supplied updates, attached specification documents, and the current WebMCP specification. Use when the spec or preview guidance may have changed and the skill, references, assets, or examples need to be reconciled."
argument-hint: "Optional: paste textual updates, issue links, change notes, attached document notes, or a narrower scope such as SKILL.md only, references only, or compatibility only"
agent: "agent"
---

Update the `skills/webmcp` skill in this workspace using the latest available inputs and any textual updates the user supplies.

Use this source priority order and resolve conflicts accordingly:
1. User-supplied textual updates override all other sources.
2. Attached documents supplied for this run are the primary technical source when the user did not explicitly override them.
3. Main web specification source, used to fill gaps and provide broader API semantics when higher-priority sources do not override it: https://webmachinelearning.github.io/webmcp/

Rules for source reconciliation:
- Treat user-supplied textual updates as the highest-priority instruction set for this run, even when they override all attached or fetched sources.
- Treat attached documents as authoritative for current implementation details, preview behavior, removed surfaces, examples, and testing workflows whenever the user did not explicitly override them.
- Use the main specification URL to fill gaps in the API contract, terminology, and imperative API semantics that are not covered or are less detailed in the attached documents.
- If the attached documents conflict with the main specification on technical behavior, keep the skill aligned to the attached documents and move the broader-spec difference into compatibility or troubleshooting guidance.
- When user-supplied textual updates conflict with attached documents or the main specification, apply the user-supplied text and note the override clearly in the report.
- Keep the skill document-source agnostic in wording. Preserve technical precedence in the instructions and references without turning the skill files into source-citation notes.

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before changing the skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Read the current skill files under [skills/webmcp](../../skills/webmcp/), including `SKILL.md`, `references/`, `assets/`, and `scripts/`.
- Read any attached documents supplied for this run before fetching the main specification URL.

Then perform this workflow:
1. Read inputs in the priority order above.
2. Extract only material changes that affect the skill, such as:
   - the `navigator.modelContext` exposure model and secure-context restrictions
   - `registerTool()`, `unregisterTool()`, `ModelContextTool`, `ToolAnnotations`, and `ModelContextClient.requestUserInteraction()` behavior
   - duplicate-name, empty-string, and schema-serialization failure cases
   - declarative form annotations such as `toolname`, `tooldescription`, `toolautosubmit`, and `toolparamdescription`
   - declarative schema synthesis behavior for labels, `aria-description`, required fields, `<select>` options, and grouped controls
   - `SubmitEvent.agentInvoked`, `respondWith()`, submit interception, redirects, and result handling
   - preview-only events and pseudo-classes such as `toolactivated`, `toolcancel`, `:tool-form-active`, and `:tool-submit-active`
   - preview browser requirements, flags, extension-based testing flows, and implementation-only diagnostic surfaces
   - removed or obsolete surfaces such as `provideContext`, `clearContext`, and `toolparamtitle`
   - platform limitations such as no headless operation, visible browsing-context requirements, and discoverability gaps
3. Compare the extracted changes against the current files in `skills/webmcp`.
4. Update only the files that materially need changes. Avoid churn when the existing wording is already correct.
5. Keep the main `SKILL.md` lean and procedural. Move dense compatibility detail, examples, preview caveats, and testing workflows into `references/`.
6. Preserve the skill's routing quality:
   - browser WebMCP only
   - JavaScript or TypeScript web apps
   - no server-side MCP server guidance
   - no generic AI platform or cloud guidance
7. Keep the files source-agnostic in wording while preserving the intended priority of technical guidance.
8. If the attached documents contain implementation details that are newer or stricter than the main specification URL, preserve those details in the WebMCP references and compatibility guidance.
9. If the user supplied textual updates, apply them as the authoritative override for this run and merge them into the appropriate files even when they differ from the attached documents or fetched specification.

Edit guidance:
- Prefer minimal edits that improve correctness.
- Preserve existing file layout unless a change clearly belongs in a different existing file.
- Update `assets/model-context-registry.template.ts` only if the canonical imperative usage pattern has materially changed.
- Update `scripts/find-webmcp-targets.mjs` only if the existing detection logic is actually wrong for the skill workflow.
- Do not add human-oriented files inside the skill directory.

Validation:
1. Re-run the metadata validator with the final `name` and `description`:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "webmcp" --description "Implements and debugs browser WebMCP integrations in JavaScript or TypeScript web apps. Use when exposing imperative tools through navigator.modelContext, annotating HTML forms for declarative tools, handling agent-invoked form flows, or validating WebMCP behavior in the current Chrome preview. Don't use for server-side MCP servers, REST tool backends, or non-browser providers."
```

2. Re-check the updated skill against the checklist.
3. If the inputs do not justify any file changes, report that no material update was needed and do not rewrite files just to match wording.

When reporting results:
1. Summarize the material deltas you found.
2. List the files changed, if any.
3. Explain any conflicts resolved by source priority.
4. Call out where user-supplied text overrode the attached documents or the fetched specification.
5. Note remaining risks, especially if attached-document behavior diverges from the broader specification.