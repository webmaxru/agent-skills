---
name: browser-prompt-api
description: Implements and debugs browser Prompt API integrations in JavaScript or TypeScript web apps. Use when adding LanguageModel availability checks, session creation, prompt or promptStreaming flows, structured output, download progress UX, or iframe permission-policy handling. Don't use for server-side LLM SDKs, REST AI APIs, or non-browser providers.
---

# Browser Prompt API

## Procedures

**Step 1: Identify the integration surface**
1. Inspect the workspace for browser entry points, UI handlers, and any existing AI abstraction layer.
2. Execute `node scripts/find-frontend-targets.mjs .` to inventory likely frontend files and existing Prompt API usage.
3. If the project is not a browser web app, stop and explain that this skill does not apply.

**Step 2: Confirm Prompt API viability**
1. Read `references/prompt-api-reference.md` before writing code.
2. Read `references/examples.md` when the feature needs a spec-valid message shape for text, multimodal, prefix, or tool-enabled sessions.
3. Read `references/compatibility.md` when the feature must support multiple browser generations or decide between native support and polyfills.
4. Read `references/polyfills.md` when the feature needs concrete package installation or backend configuration examples for Prompt API or Task API polyfills.
5. Verify that the feature runs in a secure window context and that the `language-model` permissions-policy allows access from the current frame.
6. If the integration must run in a Web Worker or other non-window context, stop and explain the platform limitation.
7. Choose the session shape the feature needs: `prompt()`, `promptStreaming()`, `initialPrompts`, `append()`, `measureContextUsage()`, `tools`, or `responseConstraint`.
8. If the project uses TypeScript, add or preserve typings that cover the Prompt API surface used by the project.

**Step 3: Implement a guarded session wrapper**
1. Read `assets/language-model-service.template.ts` and adapt it to the framework, state model, and file layout in the workspace.
2. Gate session creation behind `LanguageModel.availability()` using the same creation options that the feature will use at runtime, including expected modalities and tools.
3. Create sessions only after user activation when model download or instantiation may begin.
4. Use `AbortController` for cancelable prompts and call `destroy()` when the session is no longer needed.
5. If the feature runs in a cross-origin iframe, require `allow="language-model"` on the embedding iframe.
6. Do not depend on `params()`, `topK`, or `temperature`; current integrations must work without them.

**Step 4: Wire UX and fallback behavior**
1. Surface distinct states for unavailable devices, model download, ready sessions, and in-flight prompts.
2. If download progress matters to the feature, attach a `monitor` listener during `LanguageModel.create()` and render progress in the UI.
3. Keep a non-AI fallback for unsupported browsers, unsupported devices, or blocked iframe contexts.
4. If the feature needs structured output, pass a JSON Schema through `responseConstraint`, use `omitResponseConstraintInput` only when the prompt already carries the required format instructions, and parse the returned string before using it.
5. Respect prompt-shape validation rules: `system` messages belong in `initialPrompts`, `prefix: true` applies only to the final `assistant` message, and `assistant` message content must remain text-only.

**Step 5: Validate behavior**
1. Test short responses with `prompt()` and long responses with `promptStreaming()` when applicable.
2. Verify that repeated prompts reuse context intentionally, that destroyed sessions are not reused, and that the app uses compatibility checks for context measurement and overflow handling across browser versions.
3. Read `references/troubleshooting.md` if the integration throws `NotSupportedError` or behaves differently across frames or execution contexts.
4. Run the workspace build, typecheck, or tests after editing.

## Error Handling
* If `LanguageModel` is missing, prefer progressive enhancement with a maintained Prompt API polyfill or a non-AI fallback instead of inventing a custom compatibility layer.
* If `availability()` returns `downloading`, surface progress and avoid prompting until the model is ready.
* If `availability()` or `prompt()` throws `NotSupportedError`, align the creation and prompt options with the actual modalities, languages, message roles, and tools used by the feature.
* If the feature must run in Web Workers, redirect the integration to a window context because the Prompt API is not available in workers.
* If the feature lives in a cross-origin iframe, require `allow="language-model"` from the embedding page before continuing.