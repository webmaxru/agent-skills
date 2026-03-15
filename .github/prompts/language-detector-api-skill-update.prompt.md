---
name: "Language Detector API: Update Skill"
description: "Refresh the skills/language-detector-api skill from user-supplied textual updates, attached documents, and URLs about the current Language Detector API surface. Use when browser guidance, compatibility notes, or implementation details may have changed and the skill, references, assets, or examples need to be reconciled."
argument-hint: "Optional: paste textual updates, issue links, change notes, attached document notes, URLs, or a narrower scope such as SKILL.md only, references only, compatibility only, or examples only"
agent: "agent"
---

Update the `skills/language-detector-api` skill in this workspace using the latest available inputs and any textual updates the user supplies.

Request information in this priority order and resolve conflicts accordingly:
1. User-supplied prompt text overrides all other sources.
2. Attached documents supplied for this run override the built-in URLs when the prompt did not explicitly override them.
3. Built-in prompt URLs fill gaps not covered by higher-priority sources:
   - Primary URL source: `https://webmachinelearning.github.io/translation-api/`, using only the Language Detector API material.
   - Secondary URL source: `https://developer.chrome.com/docs/ai/language-detection`
   - Tertiary URL source: `https://learn.microsoft.com/en-us/microsoft-edge/web-platform/languagedetector-api`

Rules for source reconciliation:
- Treat user-supplied prompt text as the highest-priority instruction set for this run, even when it overrides attached documents or any built-in URL source.
- Treat attached documents as authoritative for current implementation detail, compatibility guidance, examples, preview behavior, and testing workflows whenever the prompt did not explicitly override them.
- Use the built-in prompt URLs to fill gaps in API semantics, browser support notes, iframe rules, download behavior, and detection guidance that are not covered or are less detailed in higher-priority sources.
- Prefer the W3C Community Group specification over Chrome or Edge guidance when both cover the same core API contract and no higher-priority source overrides them.
- If attached documents conflict with any built-in URL source on technical behavior, keep the skill aligned to the attached documents and move the broader or conflicting guidance into compatibility or troubleshooting notes when needed.
- When user-supplied prompt text conflicts with attached documents or any built-in URL source, apply the prompt text and note the override clearly in the report.
- If the combined inputs are not sufficient to update the skill safely, stop and explain exactly what is missing instead of guessing.

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before changing the skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Read the current skill files under [skills/language-detector-api](../../skills/language-detector-api/), including `SKILL.md`, `references/`, `assets/`, and `scripts/`.
- Read any attached documents supplied for this run before using the built-in prompt URLs to fill gaps.

Then perform this workflow:
1. Read inputs in the priority order above.
2. Extract only material changes that affect the skill, such as:
   - `LanguageDetector` exposure requirements, secure-context restrictions, and execution-context support
   - `availability()`, `create()`, `detect()`, `measureInputUsage()`, `destroy()`, and `expectedInputLanguages` behavior
   - `monitor` download-progress behavior and user-activation constraints for first-use downloads
   - result ordering, `confidence`, low-probability filtering, and `und` handling
   - permissions-policy behavior, iframe delegation, and worker limitations
   - browser-specific availability, preview channels, flags, platform support, and typing guidance
   - examples that materially affect the recommended session shape, fallback path, or validation workflow
   - removed, renamed, or obsolete Language Detector API surfaces that should be corrected in the skill or references
3. Compare the extracted changes against the current files in `skills/language-detector-api`.
4. Update only the files that materially need changes. Avoid churn when the existing wording is already correct.
5. Keep the main `SKILL.md` lean and procedural. Move dense compatibility detail, long examples, or volatile implementation notes into `references/`.
6. Preserve the skill's routing quality:
   - browser Language Detector API only
   - JavaScript or TypeScript web apps
   - no server-side language detection SDK guidance
   - no cloud translation or NLP service guidance
7. Keep the files browser-aware but source-agnostic in wording while preserving the intended priority of technical guidance.
8. If the user supplied prompt text, apply it as the authoritative override for this run and merge it into the appropriate files even when it differs from attached documents or any built-in URL source.

Edit guidance:
- Prefer minimal edits that improve correctness.
- Preserve existing file layout unless a change clearly belongs in a different existing file.
- Update `assets/language-detector-session.template.ts` only if the canonical usage pattern has materially changed.
- Update `scripts/find-language-detector-targets.mjs` only if the existing detection logic is actually wrong for the skill workflow.
- Do not add human-oriented files inside the skill directory.

Validation:
1. Re-run the metadata validator with the final `name` and `description`:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "language-detector-api" --description "Implements and debugs browser Language Detector API integrations in JavaScript or TypeScript web apps. Use when adding LanguageDetector support checks, availability and model download flows, session creation, detect() calls, input-usage measurement, permissions-policy handling, or compatibility fallbacks for built-in language detection. Don't use for server-side language detection SDKs, cloud translation services, or generic NLP pipelines."
```

2. Re-check the updated skill against the checklist.
3. If the inputs do not justify any file changes, report that no material update was needed and do not rewrite files just to match wording.

When reporting results:
1. Summarize the material deltas you found.
2. List the files changed, if any.
3. Explain any conflicts resolved by source priority.
4. Call out where user-supplied prompt text overrode attached documents or built-in prompt URLs.
5. Note remaining risks, especially if attached-document behavior diverges from URL guidance or the inputs leave browser behavior ambiguous.