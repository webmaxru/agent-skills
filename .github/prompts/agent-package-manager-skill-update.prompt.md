---
name: "Agent Package Manager: Update Skill"
description: "Refresh the skills/agent-package-manager skill from user-supplied textual updates, attached documents, and the current Agent Package Manager documentation. Use when APM commands, manifest rules, lockfile behavior, runtime guidance, or packaging workflows may have changed and the skill, references, assets, or examples need to be reconciled."
argument-hint: "Optional: paste textual updates, issue links, release notes, attached document notes, URLs, or a narrower scope such as SKILL.md only, references only, manifest guidance only, or command workflows only"
agent: "agent"
---

Update the `skills/agent-package-manager` skill in this workspace using the latest available inputs and any textual updates the user supplies.

Request information in this priority order and resolve conflicts accordingly:
1. User-supplied prompt text overrides all other sources.
2. Attached documents supplied for this run override the built-in URLs when the prompt did not explicitly override them.
3. Built-in prompt URLs fill gaps not covered by higher-priority sources, using `https://microsoft.github.io/apm/` as the primary URL source and its official linked reference and guide pages as secondary built-in sources.

Rules for source reconciliation:
- Treat user-supplied prompt text as the highest-priority instruction set for this run, even when it overrides attached documents or any built-in URL source.
- Treat attached documents as authoritative for current implementation detail, command semantics, packaging guidance, or environment setup whenever the prompt did not explicitly override them.
- Use the built-in prompt URLs to fill gaps in CLI behavior, manifest structure, dependency resolution, lockfile semantics, compilation guidance, runtime setup, MCP usage, and packaging workflows that are not covered or are less detailed in the higher-priority sources.
- Prefer the official APM documentation pages that are most specific to the topic being updated, such as CLI command reference, manifest schema, dependency guide, compilation guide, and pack-and-distribute guide, when no higher-priority source overrides them.
- If attached documents conflict with the built-in prompt URLs on technical behavior, keep the skill aligned to the attached documents and move the broader or conflicting guidance into references or troubleshooting notes when needed.
- When user-supplied prompt text conflicts with attached documents or any built-in URL source, apply the prompt text and note the override clearly in the report.
- If the combined inputs are not sufficient to update the skill safely, stop and explain exactly what is missing instead of guessing.

Before editing:
- Read [README.md](../../README.md) for repository conventions.
- Read [skill creator](../../.agents/skills/skill-creator/SKILL.md) before changing the skill.
- Read [skill checklist](../../.agents/skills/skill-creator/references/checklist.md) before final validation.
- Read the current skill files under [skills/agent-package-manager](../../skills/agent-package-manager/), including `SKILL.md`, `references/`, `assets/`, and `scripts/`.
- Read any attached documents supplied for this run before using the built-in prompt URLs to fill gaps.

Then perform this workflow:
1. Read inputs in the priority order above.
2. Extract only material changes that affect the skill, such as:
   - `apm.yml` contract changes, including required top-level fields and supported top-level sections
   - canonical dependency forms for APM packages, single-skill installs, non-GitHub hosts, pinned refs, local paths, and aliases
   - dependency resolution, transitive install behavior, `apm.lock.yaml` semantics, and deployed-file tracking that affect install, uninstall, prune, or pack workflows
   - the division of responsibility between `apm install` and `apm compile`, especially around deployment versus generated instruction outputs and validation
   - `apm deps`, `apm preview`, `apm run`, `apm runtime`, and `apm mcp` command behavior that affects the recommended workflows in the skill
   - packaging and restoration flows such as `apm pack`, `apm unpack`, bundle restrictions, and CI or air-gapped distribution guidance
   - supported agent primitives or project-integration behavior, including prompts, agents, skills, hooks, plugins, and MCP servers
   - installer or bootstrap guidance on Windows, macOS, Linux, or repository setup that materially changes the recommended workflow
   - removed, renamed, or obsolete APM commands, manifest fields, or guidance that should be corrected in the skill or references
3. Compare the extracted changes against the current files in `skills/agent-package-manager`.
4. Update only the files that materially need changes. Avoid churn when the existing wording is already correct.
5. Keep the main `SKILL.md` lean and procedural. Move dense command detail, schema nuance, compatibility notes, or distribution caveats into `references/` or `assets/`.
6. Preserve the skill's routing quality:
   - Agent Package Manager only
   - repository agent configuration and package operations only
   - no generic npm, pip, cargo, or other non-APM package-manager guidance
   - no hand-authored single-skill creation guidance that belongs to the skill-creator workflow
7. Keep the files source-agnostic in wording while preserving the intended priority of technical guidance.
8. If the user supplied prompt text, apply it as the authoritative override for this run and merge it into the appropriate files even when it differs from attached documents or any built-in URL source.

Edit guidance:
- Prefer minimal edits that improve correctness.
- Preserve existing file layout unless a change clearly belongs in a different existing file.
- Update `assets/apm.yml.template` only if the recommended manifest shape, dependency examples, or compilation structure has materially changed.
- Update `references/command-workflows.md` only when the recommended CLI command paths or command names have materially changed.
- Update `references/manifest-and-lockfile.md` only when the manifest contract, lockfile behavior, or canonical dependency guidance has materially changed.
- Do not add human-oriented files inside the skill directory.

Validation:
1. Re-run the metadata validator with the final `name` and `description`:

```bash
python .agents/skills/skill-creator/scripts/validate-metadata.py --name "agent-package-manager" --description "Installs, configures, audits, and operates Agent Package Manager (APM) in repositories. Use when initializing apm.yml, installing or updating packages, validating manifests, managing lockfiles, compiling agent context, browsing MCP servers, setting up runtimes, or packaging resolved context for CI and team distribution. Don't use for writing a single skill by hand, generic package managers like npm or pip, or non-APM agent configuration systems."
```

2. Re-check the updated skill against the checklist.
3. If the inputs do not justify any file changes, report that no material update was needed and do not rewrite files just to match wording.

When reporting results:
1. Summarize the material deltas you found.
2. List the files changed, if any.
3. Explain any conflicts resolved by source priority.
4. Call out where user-supplied prompt text overrode attached documents or built-in prompt URLs.
5. Note remaining risks, especially if attached-document behavior diverges from the official docs or the inputs leave command behavior ambiguous.