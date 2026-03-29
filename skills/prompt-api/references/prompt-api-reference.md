# Browser Prompt API Reference

Use this reference when planning or implementing browser-side Prompt API integrations.

## Core API Surface

1. Check support with `LanguageModel.availability(options)` before creating a session.
2. Create a session with `LanguageModel.create(options)`.
3. Use `session.prompt(input, options)` for request-response flows.
4. Use `session.promptStreaming(input, options)` for incremental rendering.
5. Use `session.append(messages)` to preload context after the session already exists.
6. Use `session.measureContextUsage(input, options)` when available to estimate context cost before appending or prompting.
7. Use `session.clone()` to fork an existing session while preserving its setup context and current conversation state.
8. Use `session.destroy()` to release resources when the feature is done.
9. Track context metrics and overflow hooks through a compatibility layer instead of hardcoding a single browser-generation field name.
10. Treat `LanguageModel.params()`, `topK`, and `temperature` as unavailable to current portable integrations for this skill, per the higher-priority skill-update override.

## Create And Prompt Options

1. Treat the spec split between `LanguageModelCreateCoreOptions` and `LanguageModelCreateOptions` as canonical: `availability()` accepts the core options, while `create()` adds `initialPrompts`, `monitor`, and `signal`.
2. Pass the same `expectedInputs`, `expectedOutputs`, and `tools` options to `availability()` that the feature will use when creating the session.
3. Use `initialPrompts` for durable setup context, such as system instructions, restored chat state, or n-shot examples.
4. Use `expectedInputs` and `expectedOutputs` to declare modalities and optional BCP 47 language tags. The spec is browser-neutral; implementation docs may support only a subset of languages.
5. Use `responseConstraint` when the feature needs structured output or strict classification results.
6. Use `omitResponseConstraintInput` only when the prompt itself already instructs the model about the required structure.
7. `signal` is supported on create, prompt, append, and clone flows.
8. `tools` can be provided during session creation as named tool definitions with descriptions, JSON-schema `inputSchema`, and async `execute` handlers that return strings.
9. Keep browser-page code independent of sampling parameters even if a preview browser demo or extension context still shows `topK` or `temperature` controls.

## Prompt Validation Rules

1. `LanguageModelPrompt` accepts either a string or a sequence of messages.
2. A string prompt is shorthand for a single `user` message with text content.
3. `system` messages are only valid in `initialPrompts`, and all `system` messages must appear before any non-system message.
4. Using a `system` message in normal `prompt()`, `promptStreaming()`, `append()`, or `measureContextUsage()` input throws `NotSupportedError`.
5. `prefix: true` is only valid on the final `assistant` message.
6. `assistant` messages must remain text-only.
7. Empty message arrays are invalid.
8. Image content must use `ImageBitmapSource` or `BufferSource` values.
9. Audio content must use `AudioBuffer`, `BufferSource`, or `Blob` values.
10. Adjacent text content items are canonicalized together, so application code should not depend on separate contiguous text fragments remaining separate after validation.

## Platform Constraints

1. Treat the Prompt API as experimental and verify current browser availability before shipping a hard dependency.
2. The API is exposed only in secure window contexts.
3. Access is gated by the `language-model` permissions-policy feature, whose default allowlist is `self`.
4. Top-level windows and same-origin iframes are allowed by default.
5. Cross-origin iframes require the embedding page to grant `allow="language-model"`.
6. Non-window contexts such as workers are outside the spec exposure surface.
7. Browser-extension pages or offscreen pages can have browser-specific support characteristics that differ from ordinary page integrations; keep those differences isolated to compatibility or troubleshooting logic.

## Implementation Notes

1. Prefer a small wrapper around `LanguageModel` so the rest of the app does not duplicate capability checks or session lifecycle code.
2. TypeScript projects should keep their local Prompt API type declarations aligned with the implementation they target.
3. Use `AbortController` for prompt cancellation and teardown.
4. Keep a non-AI fallback path for unsupported browsers or blocked execution contexts.
5. User-supplied override for this skill: treat `params()` as removed and treat `topK` and `temperature` as silently ignored, so application logic must not depend on them even when preview docs mention them.
6. Reuse `references/examples.md` when the feature needs a known-good prompt shape or tool-enabled session pattern.
7. An `availability()` result of `downloading` is still a passive state check. Browser-page code should not infer that its own UI has started the download until it actually calls `LanguageModel.create()`.

## Compatibility Notes

1. The current spec still shows deprecated extension-only remnants for `params()`, `topK`, and `temperature`, but the higher-priority skill update says to treat `params()` as removed and `topK` or `temperature` as ignored for present-day integrations.
2. Both Chrome and Edge documentation document `topK` and `temperature` as supported sampling parameters in `create()`; treat them as browser-specific options that application code should not require for portable behavior, given the previous user-supplied override still in effect for this skill.
3. Browser implementation docs may document only a subset of languages even though the spec models languages as BCP 47 tags.
4. Both Chrome and Edge now document a regular-expression form for `responseConstraint` alongside JSON Schema. The spec IDL defines `responseConstraint` as `object`-typed, which accommodates `RegExp` values as JavaScript objects; regex constraints are a documented implementation extension in both browsers. Prefer JSON Schema when targeting cross-browser structured output, and note that regex support is a browser-implemented feature rather than a spec-normative constraint type.
5. Context-related naming has changed over time, and the current spec still uses `contextWindow` and `oncontextoverflow`; compatibility code should check those alongside the user-supplied `contextWindowMeasure` and `contextOverflow` aliases before older quota-era fallbacks.
6. Prompt API polyfills are a valid progressive-enhancement strategy when native support is missing. The current npm package is `prompt-api-polyfill`.
7. Built-in AI Task API polyfills are available as `built-in-ai-task-apis-polyfills`, with subpath imports such as `built-in-ai-task-apis-polyfills/summarizer` and `built-in-ai-task-apis-polyfills/writer`.
8. If a polyfill requires a cloud backend, use the project-approved backend and security posture for production; the latest guidance favors secure backend-backed configurations over embedding raw secrets in client code.
9. Reuse `references/compatibility.md` for package installation and browser-preview guidance.