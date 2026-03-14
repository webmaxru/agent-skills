# WebMCP Reference

Use this file for the core contract before editing code.

## Precedence

1. Prefer current preview implementation behavior over the broader specification when they differ.
2. Use the broader specification to fill gaps where preview materials or implementations are silent.
3. Record implementation-specific differences in `references/compatibility.md` instead of flattening them into the generic API contract.

## What WebMCP Is

1. WebMCP is a proposed web standard for exposing structured browser-side tools to AI agents on existing websites.
2. It is inspired by MCP, but it runs inside the page rather than requiring a separate server-hosted MCP service.
3. The goal is to replace fragile screen-scraping with explicit tool declarations, structured input schemas, and shared page context.

## Interaction Contract

1. WebMCP gives agents a discovery surface for the tools a page currently supports.
2. WebMCP uses structured schemas so the page can declare expected inputs explicitly.
3. WebMCP depends on current page state so agents act against the visible resources and workflows that the user can also inspect.

## Core Exposure Model

1. WebMCP is exposed through `navigator.modelContext`.
2. `navigator.modelContext` is a secure-context, window-only API.
3. `Navigator` exposes a `modelContext` getter that returns a `ModelContext` instance.

## Imperative API

1. Use `navigator.modelContext.registerTool(tool)` to add one tool without clearing the existing set.
2. Use `navigator.modelContext.unregisterTool(name)` to remove a specific registered tool.
3. The `ModelContextTool` contract includes:
   `name`: unique tool identifier.
   `description`: natural-language description of what the tool does and when to use it.
   `inputSchema`: JSON Schema-like object describing the expected input.
   `execute`: callback invoked with the input object and a `ModelContextClient`.
   `annotations.readOnlyHint`: optional boolean indicating that the tool does not modify state.
4. The `ToolExecuteCallback` can be asynchronous.
5. The `ModelContextClient` exposes `requestUserInteraction(callback)` for tool flows that need explicit user interaction.
6. Imperative tools can return structured tool output after the page has updated, including content-oriented payloads that the agent can read.

## Registration Semantics

1. Tool names must be unique within the current model context.
2. `registerTool()` throws `InvalidStateError` if a tool with the same name already exists.
3. `registerTool()` also throws `InvalidStateError` if `name` or `description` is the empty string.
4. When `inputSchema` exists, the current draft serializes it with JSON stringification semantics.
5. Non-serializable or circular `inputSchema` values can throw `TypeError` or re-throw JSON serialization errors.
6. `unregisterTool()` throws `InvalidStateError` if the named tool is not registered.

## Declarative API

1. Current implementations use a declarative form-based API built around `toolname`, `tooldescription`, and related form annotations.
2. Declarative WebMCP is still evolving and is not as fully specified as the imperative surface.
3. Treat declarative form behaviors as preview guidance that should be isolated behind compatibility-aware code and validation.
4. Declarative tools should model the real visible workflow instead of inventing a separate hidden agent-only interaction path.

## Authoring Principles

1. Use specific names that describe execution clearly.
2. Write positive descriptions that explain what the tool does and when it should be used.
3. Accept raw user input where possible instead of forcing the agent to transform values.
4. Validate loosely in schema and strictly in code so failures can produce corrective error messages.
5. Keep tools atomic and composable instead of creating multiple overlapping variants.
6. Register tools only while they match the current page state.
7. Return after the UI is updated so the agent can verify the effect in the visible page.
8. Prefer explicit business semantics in parameters such as user-facing enums or raw user values instead of opaque identifiers or computed transforms.

## Current Draft Gaps

1. Declarative WebMCP is not yet as completely specified as the imperative API.
2. `requestUserInteraction()` is defined at a high level, but some algorithmic details are still sparse.
3. Security, privacy, and accessibility guidance exists, but it remains relatively high level.