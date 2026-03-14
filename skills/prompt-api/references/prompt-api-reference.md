# Browser Prompt API Reference

Use this reference when planning or implementing browser-side Prompt API integrations.

## Core API Surface

1. Check support with `LanguageModel.availability(options)` before creating a session.
2. Create a session with `LanguageModel.create(options)`.
3. Use `session.prompt(input, options)` for request-response flows.
4. Use `session.promptStreaming(input, options)` for incremental rendering.
5. Use `session.append(messages)` to preload context after the session already exists.
6. Use `session.measureContextUsage(input, options)` when available to estimate context cost before appending or prompting.
7. Use `session.clone()` to fork an existing conversation state.
8. Use `session.destroy()` to release resources when the feature is done.
9. Track context metrics and overflow hooks through a compatibility layer instead of hardcoding a single browser-generation field name.

## Create And Prompt Options

1. Pass the same `expectedInputs`, `expectedOutputs`, and `tools` options to `availability()` that the feature will use when creating the session.
2. Use `initialPrompts` for durable setup context, such as system instructions or restored chat state.
3. Use `responseConstraint` when the feature needs structured output or strict classification results.
4. Use `omitResponseConstraintInput` only when the prompt itself already instructs the model about the required structure.
5. `signal` is supported on create, prompt, append, and clone flows.
6. `tools` can be provided during session creation as named tool definitions with descriptions, JSON-schema input definitions, and async execute handlers.

## Prompt Validation Rules

1. `LanguageModelPrompt` accepts either a string or a sequence of messages.
2. A string prompt is shorthand for a single `user` message with text content.
3. `system` messages are only valid in `initialPrompts`; using them in normal prompt input throws `NotSupportedError`.
4. `prefix: true` is only valid on the final `assistant` message.
5. `assistant` messages must remain text-only.
6. Image content must use `ImageBitmapSource` or `BufferSource` values.
7. Audio content must use `AudioBuffer`, `BufferSource`, or `Blob` values.

## Platform Constraints

1. Treat the Prompt API as experimental and verify current browser availability before shipping a hard dependency.
2. The API is exposed only in secure window contexts.
3. Access is gated by the `language-model` permissions-policy feature, whose default allowlist is `self`.
4. Top-level windows and same-origin iframes are allowed by default.
5. Cross-origin iframes require the embedding page to grant `allow="language-model"`.
6. Non-window contexts such as workers are outside the spec exposure surface.

## Implementation Notes

1. Prefer a small wrapper around `LanguageModel` so the rest of the app does not duplicate capability checks or session lifecycle code.
2. TypeScript projects should keep their local Prompt API type declarations aligned with the implementation they target.
3. Use `AbortController` for prompt cancellation and teardown.
4. Keep a non-AI fallback path for unsupported browsers or blocked execution contexts.
5. Treat `params()`, `topK`, and `temperature` as removed or non-portable surfaces for web integrations. Do not build features that depend on them, and ignore them if older implementations still expose them.
6. Reuse `references/examples.md` when the feature needs a known-good prompt shape or tool-enabled session pattern.

## Compatibility Notes

1. Recent API updates removed `params()` from the normal web-facing Prompt API surface.
2. Session creation parameters such as `topK` and `temperature` should be treated as ignored and unavailable for interoperable browser-page integrations.
3. Context-related naming has changed over time, so compatibility code should check which measurement and overflow members are present before using them.
4. Prefer a wrapper helper that can read modern context members first and then fall back to older names only when the running browser still exposes them.
5. Prompt API polyfills are a valid progressive-enhancement strategy when native support is missing. The current npm package is `prompt-api-polyfill`.
6. Built-in AI Task API polyfills are available as `built-in-ai-task-apis-polyfills`, with subpath imports such as `built-in-ai-task-apis-polyfills/summarizer` and `built-in-ai-task-apis-polyfills/writer`.
7. If a polyfill requires a cloud backend, use the project-approved backend and security posture for production; the latest guidance favors secure backend-backed configurations over embedding raw secrets in client code.
8. Reuse `references/compatibility.md` for package installation and old-versus-new API naming guidance.