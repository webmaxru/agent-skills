name: "Assets: Render SVGs To PNG"
description: "Render every SVG in assets/ into a high-resolution PNG with the same basename, while skipping PNGs that already exist. Use when asset SVGs need PNG exports without overwriting prior renders."
argument-hint: "Optional: target width in pixels, filename filter, or request to keep tooling ephemeral"
agent: "agent"
---

Create high-resolution PNG exports for SVG assets in this workspace.

Source scope:

- all existing `*.svg` files directly under `assets/`

Target output rule:

- for each `assets/<name>.svg`, write `assets/<name>.png` only if that PNG does not already exist

Hard requirements:

- Keep both source SVGs and generated PNGs under `assets/`.
- Do not move or rename existing SVGs.
- Do not overwrite any existing `assets/*.png` file. If the matching PNG already exists, skip that SVG.
- Prefer an ephemeral conversion path that does not modify `package.json`, lockfiles, or other project configuration unless the user explicitly asks for a permanent tool dependency.
- Preserve each SVG's original aspect ratio.
- Produce visibly high-resolution PNGs; default to `2400` pixels wide if the user does not specify a size.
- Verify the generated PNG dimensions for each newly rendered file.
- If no SVG files are found, report that explicitly and make no changes.

Execution guidance:
1. Enumerate all existing `*.svg` files directly under `assets/`.
2. Check for an already-installed SVG renderer first.
3. If no suitable renderer is installed, use a temporary CLI such as `npx --yes @resvg/resvg-js-cli@2.6.2-beta.1` rather than adding a permanent dependency.
4. For each SVG, derive the sibling PNG path with the same basename.
5. Skip any SVG whose matching PNG already exists.
6. Render each remaining PNG at the requested width, or `2400` pixels wide by default.
7. Verify the output dimensions for each generated file and report them.

When reporting back:
1. List which SVG files were converted and the PNG path produced for each.
2. List which files were skipped because a PNG already existed.
3. State the final PNG dimensions for each generated file.
4. Mention the conversion command or tool used.