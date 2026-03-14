---
name: "Prompt API: Update Skill"
description: "Refresh the skills/prompt-api skill from the current Prompt API documentation and any user-supplied textual updates. Use when the spec or browser guidance may have changed and the skill, references, assets, or examples need to be reconciled."
argument-hint: "Optional: paste textual updates, issue links, change notes, or a narrower scope such as SKILL.md only, references only, or examples only"
agent: "agent"
---

Update the `skills/prompt-api` skill in this workspace using the latest available documentation and any textual updates the user supplies.

Use this source priority order and resolve conflicts accordingly:
1. User-supplied textual updates override all other sources.
2. Main source, authoritative for API shape and behavior when the user did not explicitly override it: https://webmachinelearning.github.io/prompt-api/
3. Secondary source, implementation guidance for Chrome: https://developer.chrome.com/docs/ai/prompt-api
4. Tertiary source, implementation guidance for Microsoft Edge: https://learn.microsoft.com/en-us/microsoft-edge/web-platform/prompt-api

Rules for source reconciliation:
- Treat user-supplied textual updates as the highest-priority instruction set for this run, even when they override the documentation sources.
- Treat the main specification as the source of truth for the API contract, validation rules, roles, message shapes, permissions-policy behavior, and supported surface area whenever the user did not explicitly override it.
- Use Chrome and Edge documentation for browser-specific availability, flags, hardware requirements, preview status, demos, typings advice, and implementation notes.
- If Chrome or Edge documentation conflicts with the main specification on core API semantics, keep the skill aligned to the main specification and move browser-specific differences into compatibility or troubleshooting guidance unless the user explicitly overrode that behavior.
- When user-supplied textual updates conflict with documentation, apply the user-supplied text and note the override clearly in the report.

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before changing the skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Read the current skill files under [skills/prompt-api](../../skills/prompt-api/), including `SKILL.md`, `references/`, `assets/`, and `scripts/`.

Then perform this workflow:
1. Fetch and read the three documentation sources in the priority order above.
2. Extract only material changes that affect the skill, such as:
   - supported API surface and restrictions
   - `LanguageModel.availability()` and `LanguageModel.create()` option parity
   - `prompt()`, `promptStreaming()`, `append()`, `measureContextUsage()`, `clone()`, and `destroy()` behavior
   - `initialPrompts`, `system` message placement, and `prefix: true` validation
   - `expectedInputs`, `expectedOutputs`, modalities, and language handling
   - `responseConstraint` and `omitResponseConstraintInput`
   - `tools`, `inputSchema`, and tool execution expectations
   - secure-context requirements, permissions policy, iframe delegation, and worker limitations
   - deprecated or extension-only features such as `params()`, `topK`, and `temperature`
   - browser-specific availability, preview channels, flags, device requirements, and typing packages
3. Compare the extracted changes against the current files in `skills/prompt-api`.
4. Update only the files that materially need changes. Avoid churn when the existing wording is already correct.
5. Keep the main `SKILL.md` lean and procedural. Move dense browser-specific detail, version caveats, examples, or long compatibility notes into `references/`.
6. Preserve the skill's routing quality:
   - browser Prompt API only
   - JavaScript or TypeScript web apps
   - no server-side LLM SDK guidance
   - no generic cloud AI guidance
7. Keep core instructions browser-neutral where possible. Put Chrome-only and Edge-only differences into `references/compatibility.md` or `references/troubleshooting.md` unless the difference changes the top-level stop conditions.
8. If the user supplied textual updates, apply them as the authoritative override for this run and merge them into the appropriate files even when they differ from the documentation. Preserve any ambiguity in the wording only when the supplied text itself is unclear.

Edit guidance:
- Prefer minimal edits that improve correctness.
- Preserve existing file layout unless a change clearly belongs in a different existing file.
- Update `assets/language-model-service.template.ts` only if the canonical usage pattern has materially changed.
- Update `scripts/find-frontend-targets.mjs` only if the existing detection logic is actually wrong for the skill workflow.
- Do not add human-oriented files inside the skill directory.

Validation:
1. Re-run the metadata validator with the final `name` and `description`:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "prompt-api" --description "Implements and debugs browser Prompt API integrations in JavaScript or TypeScript web apps. Use when adding LanguageModel availability checks, session creation, prompt or promptStreaming flows, structured output, download progress UX, or iframe permission-policy handling. Don't use for server-side LLM SDKs, REST AI APIs, or non-browser providers."
```

2. Re-check the updated skill against the checklist.
3. If the fetched documentation does not justify any file changes, report that no material update was needed and do not rewrite files just to match wording.

When reporting results:
1. Summarize the documentation deltas you found.
2. List the files changed, if any.
3. Explain any conflicts resolved by source priority.
4. Call out where user-supplied text overrode the documentation sources.
5. Note remaining risks, especially if the override conflicts with the main specification or browser implementation docs.