---
name: "Translator API: Update Skill"
description: "Refresh the skills/translator-api skill from user-supplied textual updates, attached documents, and URLs about the current Translator API surface. Use when browser guidance, compatibility notes, or implementation details may have changed and the skill, references, assets, or examples need to be reconciled."
argument-hint: "Optional: paste textual updates, issue links, change notes, attached document notes, URLs, or a narrower scope such as SKILL.md only, references only, compatibility only, or examples only"
agent: "agent"
---

Update the `skills/translator-api` skill in this workspace using the latest available inputs and any textual updates the user supplies.

Request information in this priority order and resolve conflicts accordingly:
1. User-supplied prompt text overrides all other sources.
2. Attached documents supplied for this run override the built-in URLs when the prompt did not explicitly override them.
3. Built-in prompt URLs fill gaps not covered by higher-priority sources:
   - Primary URL source: `https://webmachinelearning.github.io/translation-api/`, using only the Translator API material.
   - Secondary URL source: `https://developer.chrome.com/docs/ai/translator-api`
   - Tertiary URL source: `https://learn.microsoft.com/en-us/microsoft-edge/web-platform/translator-api`

Rules for source reconciliation:
- Treat user-supplied prompt text as the highest-priority instruction set for this run, even when it overrides attached documents or any built-in URL source.
- Treat attached documents as authoritative for current implementation detail, compatibility guidance, examples, preview behavior, and testing workflows whenever the prompt did not explicitly override them.
- Use the built-in prompt URLs to fill gaps in API semantics, browser support notes, iframe rules, download behavior, and translation guidance that are not covered or are less detailed in higher-priority sources.
- Prefer the W3C Community Group specification over Chrome or Edge guidance when both cover the same core API contract and no higher-priority source overrides them.
- If attached documents conflict with any built-in URL source on technical behavior, keep the skill aligned to the attached documents and move the broader or conflicting guidance into compatibility or troubleshooting notes when needed.
- When user-supplied prompt text conflicts with attached documents or any built-in URL source, apply the prompt text and note the override clearly in the report.
- If the combined inputs are not sufficient to update the skill safely, stop and explain exactly what is missing instead of guessing.

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before changing the skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Read the current skill files under [skills/translator-api](../../skills/translator-api/), including `SKILL.md`, `references/`, `assets/`, and `scripts/`.
- Read any attached documents supplied for this run before using the built-in prompt URLs to fill gaps.

Then perform this workflow:
1. Read inputs in the priority order above.
2. Extract only material changes that affect the skill, such as:
   - `Translator` exposure requirements, secure-context restrictions, and execution-context support
   - `availability()`, `create()`, `translate()`, `translateStreaming()`, `measureInputUsage()`, `destroy()`, `sourceLanguage`, `targetLanguage`, and `inputQuota` behavior
   - `monitor` download-progress behavior and user-activation constraints for first-use downloads
   - identity translation, best-fit language-pair handling, quota behavior, and abort behavior
   - permissions-policy behavior, iframe delegation, and worker limitations
   - browser-specific availability, preview channels, flags, platform support, and typing guidance
   - examples that materially affect the recommended session shape, fallback path, or validation workflow
   - removed, renamed, or obsolete Translator API surfaces that should be corrected in the skill or references
3. Compare the extracted changes against the current files in `skills/translator-api`.
4. Update only the files that materially need changes. Avoid churn when the existing wording is already correct.
5. Keep the main `SKILL.md` lean and procedural. Move dense compatibility detail, long examples, or volatile implementation notes into `references/`.
6. Preserve the skill's routing quality:
   - browser Translator API only
   - JavaScript or TypeScript web apps
   - no server-side translation SDK guidance
   - no cloud translation or document-localization service guidance
7. Keep the files browser-aware but source-agnostic in wording while preserving the intended priority of technical guidance.
8. If the user supplied prompt text, apply it as the authoritative override for this run and merge it into the appropriate files even when it differs from attached documents or any built-in URL source.

Edit guidance:
- Prefer minimal edits that improve correctness.
- Preserve existing file layout unless a change clearly belongs in a different existing file.
- Update `assets/translator-session.template.ts` only if the canonical usage pattern has materially changed.
- Update `scripts/find-translator-targets.mjs` only if the existing detection logic is actually wrong for the skill workflow.
- Do not add human-oriented files inside the skill directory.

PR description rule:
- If this run produces or updates a PR description, every single suggested update in that PR description must include its own supporting source URL with a fragment link to the exact section, heading, or anchored reference that justifies that specific update.
- Do not use bare page-level URLs, one shared citation for multiple unrelated updates, or vague source lists. Each update item must be traceable to its exact source reference.

Validation:
1. Re-run the metadata validator with the final `name` and `description`:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "translator-api" --description "Implements and debugs browser Translator API integrations in JavaScript or TypeScript web apps. Use when adding Translator support checks, language-pair availability flows, model download UX, session creation, translate() or translateStreaming() calls, input-usage measurement, or permissions-policy handling for on-device translation. Don't use for server-side translation SDKs, cloud translation services, or generic multilingual content pipelines."
```

2. Re-check the updated skill against the checklist.
3. If the inputs do not justify any file changes, report that no material update was needed and do not rewrite files just to match wording.

When reporting results:
1. Summarize the material deltas you found.
2. List the files changed, if any.
3. Explain any conflicts resolved by source priority.
4. Call out where user-supplied prompt text overrode attached documents or built-in prompt URLs.
5. Note remaining risks, especially if attached-document behavior diverges from URL guidance or the inputs leave browser behavior ambiguous.