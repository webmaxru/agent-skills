---
name: "Proofreader API: Update Skill"
description: "Refresh the skills/proofreader-api skill from the current Proofreader API documentation and any user-supplied updates. Use when the spec or browser guidance may have changed and the skill, references, assets, or examples need to be reconciled."
argument-hint: "Optional: paste textual updates, issue links, change notes, or a narrower scope such as SKILL.md only, references only, or examples only"
agent: "agent"
---

Update the `skills/proofreader-api` skill in this workspace using the latest available documentation and any textual updates the user supplies.

Request information in this priority order and resolve conflicts accordingly:
1. User-supplied prompt text overrides all other sources.
2. Attached documents supplied for this run override the built-in URLs when the prompt did not explicitly override them.
3. Built-in prompt URLs fill gaps not covered by higher-priority sources:
   - Main source, authoritative for API semantics: https://webmachinelearning.github.io/proofreader-api/
   - Secondary source, browser implementation guidance: https://developer.chrome.com/docs/ai/proofreader-api
   - Tertiary source, browser implementation guidance: https://learn.microsoft.com/en-us/microsoft-edge/web-platform/proofreader-api

Rules for source reconciliation:
- Treat user-supplied prompt text as the highest-priority instruction set for this run, even when it overrides attached documents or the built-in prompt URLs.
- Treat attached documents as authoritative for current implementation details, compatibility guidance, examples, preview behavior, and testing workflows whenever the prompt did not explicitly override them.
- Treat the main specification as the source of truth for the core API contract, availability semantics, create and proofread lifecycle, result shape, option validation, and permissions-policy behavior whenever higher-priority sources do not override it.
- Use the Chrome and Edge built-in prompt URLs for browser-specific availability, flags, channels, hardware requirements, demos, and implementation notes when higher-priority sources do not override them.
- If attached documents conflict with any built-in prompt URL on technical behavior, keep the skill aligned to the attached documents and move browser-specific differences into compatibility or troubleshooting guidance when needed.
- If the Chrome or Edge documentation conflicts with the main specification on core API semantics, keep the skill aligned to the main specification unless a higher-priority source overrides it.
- When user-supplied prompt text conflicts with attached documents or the built-in prompt URLs, apply the prompt text and note the override clearly in the report.

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before changing the skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Read the current skill files under [skills/proofreader-api](../../skills/proofreader-api/), including `SKILL.md`, `references/`, `assets/`, and `scripts/`.
- Read any attached documents supplied for this run before fetching the built-in prompt URLs.

Then perform this workflow:
1. Read inputs in the priority order above, then fetch and read the built-in prompt URLs.
2. Extract only material changes that affect the skill, such as:
   - exposed globals and secure-context restrictions
   - `availability()` states and option-specific availability behavior
   - `create()` requirements, user activation, download progress monitoring, and cleanup
   - `proofread()` result shape, correction ranges, correction labels, and explanation fields
   - `measureInputUsage()` behavior and quota-aware product guidance
   - language-tag validation and expected input language behavior
   - permissions-policy and iframe delegation requirements
   - browser-specific preview flags, channels, hardware requirements, origin-trial requirements, and documented limitations
   - spec-versus-preview gaps such as correction types or correction explanations support
3. Compare the extracted changes against the current files in `skills/proofreader-api`.
4. Update only the files that materially need changes. Avoid churn when the existing wording is already correct.
5. Keep the main `SKILL.md` lean and procedural. Move dense browser-specific detail, version caveats, or long compatibility notes into `references/`.
6. Preserve the skill's routing quality:
   - browser Proofreader API only
   - JavaScript or TypeScript web apps
   - no server-side LLM SDK guidance
   - no generic cloud AI guidance
   - no Prompt API or Writing Assistance API guidance except where it is necessary to tell the agent that the task should route elsewhere
7. Keep core instructions browser-neutral where possible. Put Chrome-only and Edge-only differences into `references/compatibility.md` or `references/troubleshooting.md` unless the difference changes the top-level stop conditions.
8. If the user supplied prompt text, apply it as the authoritative override for this run and merge it into the appropriate files even when it differs from attached documents or the built-in prompt URLs.

Edit guidance:
- Prefer minimal edits that improve correctness.
- Preserve existing file layout unless a change clearly belongs in a different existing file.
- Update `assets/proofreader-session.template.ts` only if the canonical usage pattern has materially changed.
- Update `scripts/find-proofreader-targets.mjs` only if the existing detection logic is actually wrong for the skill workflow.
- Do not add human-oriented files inside the skill directory.

Validation:
1. Re-run the metadata validator with the final `name` and `description`:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "proofreader-api" --description "Implements and debugs browser Proofreader API integrations in JavaScript or TypeScript web apps. Use when adding Proofreader availability checks, monitored model downloads, proofread flows, correction metadata handling, or permissions-policy checks for built-in proofreading. Don't use for generic prompt engineering, server-side LLM SDKs, or cloud AI services."
```

2. Re-check the updated skill against the checklist.
3. If the fetched documentation does not justify any file changes, report that no material update was needed and do not rewrite files just to match wording.

When reporting results:
1. Summarize the documentation deltas you found.
2. List the files changed, if any.
3. Explain any conflicts resolved by source priority.
4. Call out where user-supplied prompt text overrode attached documents or the built-in prompt URLs.
5. Note remaining risks, especially if browser rollout details remain channel-specific or preview-only.