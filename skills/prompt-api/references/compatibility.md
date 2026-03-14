# Browser Prompt API Compatibility Matrix

Use this reference when the feature must support multiple Prompt API generations or mix native support with polyfills.

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
2. Gemini API via `window.GEMINI_CONFIG`
3. OpenAI API via `window.OPENAI_CONFIG`
4. Transformers.js via `window.TRANSFORMERS_CONFIG`

## Breaking-Change Mapping

| Older or non-portable surface | Current guidance |
| --- | --- |
| `LanguageModel.params()` | Treat as removed for normal web integrations |
| `topK` in `create()` | Ignore for interoperable browser-page code |
| `temperature` in `create()` | Ignore for interoperable browser-page code |
| `measureInputUsage()` | Prefer `measureContextUsage()`; fall back only for old implementations |
| `inputUsage` | Prefer `contextUsage`; fall back only for old implementations |
| `inputQuota` | Prefer `contextWindowMeasure` or `contextWindow`; fall back only for old implementations |
| `onquotaoverflow` | Prefer `contextOverflow` or `oncontextoverflow`; fall back only for old implementations |

## Compatibility Strategy

1. Prefer native APIs when they exist.
2. Dynamically import `prompt-api-polyfill` only when `LanguageModel` is missing.
3. Dynamically import individual Task API polyfills only for the globals the browser does not expose.
4. Wrap context measurement and overflow handling behind compatibility helpers instead of sprinkling version checks across app code.
5. Do not build product behavior that depends on `params()`, `topK`, or `temperature`.

## Production Guidance

1. Prefer backend-backed production configurations with the project-approved security posture.
2. Firebase AI Logic is the safest documented production backend among the shipped prompt polyfill backends because it supports App Check.
3. Do not hardcode real Gemini or OpenAI production secrets in client source.