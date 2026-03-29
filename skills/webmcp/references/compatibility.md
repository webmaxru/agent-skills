# WebMCP Compatibility And Preview Notes

Use this file when setup, browser support, or preview-only behaviors affect implementation choices.

## Precedence

1. When current preview behavior differs from the broader WebMCP specification, follow the preview behavior for code that targets the current browser implementation.
2. Use the broader specification as the fallback reference for concepts and imperative API semantics that the preview does not redefine.

## Availability Snapshot

1. The current early preview is available behind a flag in Chrome 146.
2. Chrome `146.0.7672.0` or higher is the required preview version.
3. The `chrome://flags/#enable-webmcp-testing` flag must be enabled for preview testing.
4. The current early preview is Chrome-only.
5. WebMCP is still an evolving Community Group specification rather than a standards-track recommendation.
6. Starting in Chrome `148.0.7757.0`, `registerTool()` accepts an optional `{ signal: AbortSignal }` second argument and `unregisterTool()` is removed; use `AbortController` to manage tool lifetime on Chrome 148 and later.

## Execution Context Limits

1. WebMCP requires a secure window browsing context.
2. There is no headless tool-calling mode.
3. Current designs assume visible page execution rather than worker or server execution.

## Draft Versus Preview Differences

1. The imperative API surface around `navigator.modelContext`, `registerTool()`, and `ModelContextClient.requestUserInteraction()` is more stable than the declarative surface. Note that `unregisterTool()` is removed in Chrome 148 in favour of the `AbortSignal` option.
2. Declarative WebMCP is not yet fully specified.
3. Current preview implementations include additional declarative details for form attributes, submit interception, events, and CSS pseudo-classes.
4. Keep imperative integrations aligned to the stable API shape, but treat declarative behaviors as compatibility-sensitive features until the spec stabilizes.
5. Preview tooling and browser-specific affordances can expose extra testing or inspection surfaces that are not part of the portable runtime contract.

## Removed Or Obsolete Preview Surfaces

1. `provideContext` and `clearContext` are obsolete and should not be used.
2. `toolparamtitle` is obsolete and should not be used.
3. `unregisterTool()` is removed starting Chrome `148.0.7757.0`; use the `AbortSignal` option of `registerTool()` to unregister tools. During the transition window, call `unregisterTool?.()` with optional chaining before aborting the controller.
4. If an older demo or article still references those names, do not add them to current implementations.

## Testing Tooling

1. The Model Context Tool Inspector extension can inspect registered tools and execute them manually.
2. The extension is useful for deterministic testing of imperative and declarative tools.
3. The extension is not part of the production runtime contract.
4. Current preview tooling can detect tools registered through imperative registration and declarative form annotations.
5. Current preview tooling can show the tool name, description, and input schema for the active page.
6. Current preview tooling can manually execute tools with supplied arguments and surface runtime or schema errors.
7. Some preview tooling uses extra browser testing surfaces such as `navigator.modelContextTesting`; treat those as diagnostic aids only.
8. Natural-language testing through preview tooling is useful for refining descriptions and parameter shapes after deterministic execution already works.

## Platform Limitations

1. There is no built-in discovery mechanism for finding which sites expose WebMCP tools.
2. Sites with complex UI state may need refactoring so tool calls and visible UI stay synchronized.
3. Agents depend on the visible page reflecting current state after a tool executes.
4. Developers should assume that agent effectiveness depends on clear tool descriptions, stable page state, and UI updates that happen before tool completion is reported.

## MCP Comparison

1. MCP is a server-side protocol for connecting agents to applications.
2. WebMCP is an in-browser, page-hosted tool model inspired by MCP.
3. Do not route server-hosted tool work into this skill.