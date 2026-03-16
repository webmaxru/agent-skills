---
name: "GitHub Agentic Workflows: Update Skill"
description: "Refresh the skills/github-agentic-workflows skill from user-supplied textual updates, attached documents, and the current GitHub Agentic Workflows documentation. Use when workflow authoring guidance, frontmatter fields, safe-output behavior, security constraints, or CLI operations may have changed and the skill, references, assets, or examples need to be reconciled."
argument-hint: "Optional: paste textual updates, issue links, release notes, attached document notes, URLs, or a narrower scope such as SKILL.md only, references only, security only, or examples only"
agent: "agent"
---

Update the `skills/github-agentic-workflows` skill in this workspace using the latest available inputs and any textual updates the user supplies.

Request information in this priority order and resolve conflicts accordingly:
1. User-supplied prompt text overrides all other sources.
2. Attached documents supplied for this run override the built-in URLs when the prompt did not explicitly override them.
3. Built-in prompt URLs fill gaps not covered by higher-priority sources, using `https://github.github.com/gh-aw/` as the primary URL source and the official linked setup, reference, FAQ, and raw workflow-authoring documents as secondary built-in sources.

Rules for source reconciliation:
- Treat user-supplied prompt text as the highest-priority instruction set for this run, even when it overrides attached documents or any built-in URL source.
- Treat attached documents as authoritative for current implementation detail, workflow syntax, security behavior, operational guidance, or examples whenever the prompt did not explicitly override them.
- Use the built-in prompt URLs to fill gaps in the markdown workflow model, frontmatter semantics, compile and run flows, safe outputs, tool and network governance, authentication, and operational commands that are not covered or are less detailed in the higher-priority sources.
- Prefer the official GH-AW reference and setup pages that are most specific to the topic being updated, including setup, creation, reference, FAQ, and linked raw workflow prompts, when no higher-priority source overrides them.
- If attached documents conflict with the built-in prompt URLs on technical behavior, keep the skill aligned to the attached documents and move the broader or conflicting guidance into compatibility, security, or troubleshooting notes when needed.
- When user-supplied prompt text conflicts with attached documents or any built-in URL source, apply the prompt text and note the override clearly in the report.
- If the combined inputs are not sufficient to update the skill safely, stop and explain exactly what is missing instead of guessing.

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.github/skills/skill-creator/SKILL.md) before changing the skill.
- Read [skill checklist](../../.github/skills/skill-creator/references/checklist.md) before final validation.
- Read the current skill files under [skills/github-agentic-workflows](../../skills/github-agentic-workflows/), including `SKILL.md`, `references/`, `assets/`, and `scripts/`.
- Read any attached documents supplied for this run before using the built-in prompt URLs to fill gaps.

Then perform this workflow:
1. Read inputs in the priority order above.
2. Extract only material changes that affect the skill, such as:
   - the markdown workflow source-of-truth model, compiled `.lock.yml` behavior, and when recompilation is or is not required
   - repository setup flows such as `gh extension install github/gh-aw`, `gh aw init`, `gh aw add`, `gh aw add-wizard`, and sourced workflow update flows
   - frontmatter fields and semantics for `on`, `permissions`, `tools`, `toolsets`, `safe-outputs`, `network`, `engine`, `strict`, `resources`, `dependencies`, `runtimes`, `concurrency`, `timeout-minutes`, labels, metadata, or role filters
   - validation, compile, run, and debugging flows such as `gh aw fix --write`, `gh aw validate --strict`, `gh aw compile`, `gh aw run`, `gh aw trial`, `gh aw status`, `gh aw logs`, `gh aw audit`, and `gh aw health`
   - safe-output behavior, staged execution, `noop`, missing-tool or missing-data flows, and post-processed repository writes
   - security and operational guidance around least privilege, sandboxing, network allowlists, lockdown behavior, authentication, and engine-specific secrets
   - supported engines, GitHub.com authoring paths, reusable imports, and example patterns that materially change the recommended workflow shapes
   - removed, deprecated, or renamed fields, commands, or setup steps that should be corrected in the skill, references, or templates
3. Compare the extracted changes against the current files in `skills/github-agentic-workflows`.
4. Update only the files that materially need changes. Avoid churn when the existing wording is already correct.
5. Keep the main `SKILL.md` lean and procedural. Move dense examples, security nuance, and volatile operational detail into `references/` or `assets/`.
6. Preserve the skill's routing quality:
   - GitHub Agentic Workflows only
   - markdown GH-AW workflow authoring, installation, review, and operations only
   - no standard deterministic GitHub Actions YAML guidance unless it directly affects GH-AW compilation or coexistence
   - no generic CI/CD or non-GitHub automation guidance
7. Keep the files source-agnostic in wording while preserving the intended priority of technical guidance.
8. If the user supplied prompt text, apply it as the authoritative override for this run and merge it into the appropriate files even when it differs from attached documents or any built-in URL source.

Edit guidance:
- Prefer minimal edits that improve correctness.
- Preserve existing file layout unless a change clearly belongs in a different existing file.
- Update `assets/workflow.template.md` only if the canonical workflow source shape or frontmatter guidance has materially changed.
- Update `scripts/find-gh-aw-targets.mjs` only if the existing detection logic is actually wrong for the skill workflow.
- Update `references/security-and-operations.md` only when the security model, safe-output practice, or operational guidance has materially changed.
- Do not add human-oriented files inside the skill directory.

PR description rule:
- If this run produces or updates a PR description, every single suggested update in that PR description must include its own supporting source URL with a fragment link to the exact section, heading, or anchored reference that justifies that specific update.
- Do not use bare page-level URLs, one shared citation for multiple unrelated updates, or vague source lists. Each update item must be traceable to its exact source reference.

Validation:
1. Re-run the metadata validator with the final `name` and `description`:

```bash
python .github/skills/skill-creator/scripts/validate-metadata.py --name "github-agentic-workflows" --description "Authors, reviews, installs, and debugs GitHub Agentic Workflows in repositories, including workflow markdown, frontmatter, gh aw compile and run flows, safe outputs, security guardrails, and operational patterns. Use when creating or maintaining GH-AW automation. Don't use for standard deterministic GitHub Actions YAML, generic CI pipelines, or non-GitHub automation systems."
```

2. Re-check the updated skill against the checklist.
3. If the inputs do not justify any file changes, report that no material update was needed and do not rewrite files just to match wording.

When reporting results:
1. Summarize the material deltas you found.
2. List the files changed, if any.
3. Explain any conflicts resolved by source priority.
4. Call out where user-supplied prompt text overrode attached documents or built-in prompt URLs.
5. Note remaining risks, especially if attached-document behavior diverges from the official docs or the inputs leave workflow behavior ambiguous.