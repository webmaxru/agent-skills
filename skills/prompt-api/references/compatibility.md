# Browser Prompt API Compatibility Matrix

Use this reference when the feature must support multiple Prompt API generations or mix native support with polyfills.

## Source Priority

1. Treat the Prompt API specification as authoritative for API contract, validation rules, roles, and permissions-policy behavior.
2. Treat Chrome and Edge documentation as implementation guidance for availability, flags, preview status, typings, and device requirements.
3. Treat explicit skill-update overrides as higher priority than the published docs when they conflict, and preserve the override in compatibility guidance instead of changing the skill's routing scope.
4. If browser docs differ on core semantics, keep application logic aligned to the spec and isolate the divergence behind compatibility code or troubleshooting notes unless an explicit override for this skill update says otherwise.

## Browser Availability Snapshot

1. Chrome documents the web Prompt API as an origin-trial feature that has advanced to a broader availability stage in Chrome 138. Extension developers should remove the now-expired `aiLanguageModelOriginTrial` permission if still present.
2. Chrome page integrations use Gemini Nano and currently document support on Windows 10 or 11, macOS 13 (Ventura)+, Linux, and Chromebook Plus devices on ChromeOS 16389+. Hardware requirements: GPU with >4 GB VRAM, or CPU with 16 GB RAM and 4+ cores. Storage: at least 22 GB free on the Chrome profile volume. Model inference can run on CPU when GPU requirements are not met.
3. Edge documents the Prompt API as a developer preview in Canary or Dev starting with version `138.0.3309.2`.
4. Edge page integrations currently target the built-in Phi-4-mini model and require supported preview hardware.
5. Both browser docs treat model download as a separate readiness step that can require significant disk space and an unmetered network for the initial download.

## Browser Setup Notes

1. Chrome documents `chrome://flags/#optimization-guide-on-device-model` and `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` for localhost testing.
2. Edge documents enabling the `Prompt API for Phi mini` flag in `edge://flags/` and checking `edge://on-device-internals` for a device performance class of `High` or greater.
3. Chrome and Edge both document download progress monitoring through the `monitor` callback on `LanguageModel.create()`.
4. The Prompt API remains unavailable in workers, and cross-origin iframes still require `allow="language-model"`.
5. User-supplied update for this skill: extension pages and offscreen pages can expose the native Prompt API even when a page integration still needs polyfill or preview handling.

## Typings

1. Chrome documentation recommends `@types/dom-chromium-ai` for TypeScript projects targeting Chromium's built-in AI APIs.
2. Treat Chromium typings as implementation-specific, and keep any local wrappers aligned with the actual browser targets the app supports.

## Polyfill Packages

1. Prompt API polyfill package: `prompt-api-polyfill`
2. Built-in AI Task API polyfill package: `built-in-ai-task-apis-polyfills`
3. Common Task API subpath imports:
   `built-in-ai-task-apis-polyfills/summarizer`
   `built-in-ai-task-apis-polyfills/writer`
   `built-in-ai-task-apis-polyfills/rewriter`
   `built-in-ai-task-apis-polyfills/language-detector`
   `built-in-ai-task-apis-polyfills/translator`
   `built-in-ai-task-apis-polyfills/classifier`

## Installation

```bash
npm install prompt-api-polyfill built-in-ai-task-apis-polyfills
```

## Backend Support In `prompt-api-polyfill`

1. Firebase AI Logic via `window.FIREBASE_CONFIG`
2. Gemini Developer API via `window.GEMINI_CONFIG`
3. OpenAI API via `window.OPENAI_CONFIG`
4. Transformers.js via `window.TRANSFORMERS_CONFIG`

## Breaking-Change Mapping

| Older or non-portable surface | Current guidance |
| --- | --- |
| `LanguageModel.params()` | User-supplied override: treat as removed for current integrations, even if older spec snapshots or preview docs still mention extension-only support |
| `topK` in `create()` | User-supplied override: treat as silently ignored and unavailable on sessions; never depend on it for browser-page or cross-browser code |
| `temperature` in `create()` | User-supplied override: treat as silently ignored and unavailable on sessions; never depend on it for browser-page or cross-browser code |
| `measureInputUsage()` | Now formally deprecated (extension-only) in the current spec; prefer `measureContextUsage()`; fall back only for old builds |
| `inputUsage` | Prefer `contextUsage`; fall back only for old implementations |
| `inputQuota` | Current spec uses `contextWindow`; user-supplied override additionally calls out `contextWindowMeasure`, so compatibility helpers should probe both before falling back to `inputQuota` |
| `onquotaoverflow` | Current spec uses `oncontextoverflow`; user-supplied override additionally calls out `contextOverflow`, so compatibility helpers should probe both before falling back to `onquotaoverflow` |

## Compatibility Strategy

1. Prefer native APIs when they exist.
2. Dynamically import `prompt-api-polyfill` only when `LanguageModel` is missing.
3. Dynamically import individual Task API polyfills only for the globals the browser does not expose.
4. Wrap context measurement and overflow handling behind compatibility helpers instead of sprinkling version checks across app code.
5. Do not build product behavior that depends on `params()`, `topK`, or `temperature`.
6. Pass the same modalities, languages, and tools to `availability()` that the feature will use when creating the session.
7. Treat documented browser language support as an implementation subset layered on top of the spec's BCP 47 language model.
8. When supporting older preview builds, check `measureContextUsage`, `contextUsage`, `contextWindow`, `oncontextoverflow`, the user-supplied `contextWindowMeasure` and `contextOverflow` aliases, and only then the quota-era fallbacks instead of assuming a single generation of names.
9. Treat extension or offscreen-page behavior as browser-specific capability guidance, not as the portable baseline for page code.

## Production Guidance

1. Prefer backend-backed production configurations with the project-approved security posture.
2. Firebase AI Logic is the safest documented production backend among the shipped prompt polyfill backends because it supports App Check.
3. Do not hardcode real Gemini or OpenAI production secrets in client source.