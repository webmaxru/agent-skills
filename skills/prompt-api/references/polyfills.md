# Browser Prompt API Polyfills

Use this reference when the feature needs concrete package installation or backend configuration examples for Prompt API and Built-in AI Task API polyfills.

## Packages

1. Prompt API polyfill: `prompt-api-polyfill`
2. Built-in AI Task API polyfills: `built-in-ai-task-apis-polyfills`
3. User-supplied update for this skill: both packages are now fully released on npm and can be used as the maintained progressive-enhancement path when native support is absent.

## Installation

```bash
npm install prompt-api-polyfill built-in-ai-task-apis-polyfills
```

## `package.json` Example

```json
{
  "dependencies": {
    "prompt-api-polyfill": "^1.14.1",
    "built-in-ai-task-apis-polyfills": "^1.8.0"
  }
}
```

## Native-First Prompt API Loading

```ts
if (!("LanguageModel" in globalThis)) {
  await import("prompt-api-polyfill");
}
```

## Native-First Task API Loading

```ts
const polyfills: Promise<unknown>[] = [];

if (!("Summarizer" in globalThis)) {
  polyfills.push(import("built-in-ai-task-apis-polyfills/summarizer"));
}

if (!("Writer" in globalThis)) {
  polyfills.push(import("built-in-ai-task-apis-polyfills/writer"));
}

if (!("Rewriter" in globalThis)) {
  polyfills.push(import("built-in-ai-task-apis-polyfills/rewriter"));
}

if (!("LanguageDetector" in globalThis)) {
  polyfills.push(import("built-in-ai-task-apis-polyfills/language-detector"));
}

if (!("Translator" in globalThis)) {
  polyfills.push(import("built-in-ai-task-apis-polyfills/translator"));
}

if (!("Classifier" in globalThis)) {
  polyfills.push(import("built-in-ai-task-apis-polyfills/classifier"));
}

await Promise.all(polyfills);
```

## Behavioral Notes

1. User-supplied update for this skill: the Task API polyfills are implemented on top of the Prompt API with the same system prompts used to back the native Task APIs, so prefer them over ad hoc custom shims when native support is missing.
2. User-supplied update for this skill: the polyfills are described as being tested against web-platform tests, which makes them the maintained compatibility path rather than a custom wrapper.
3. Keep Task API polyfill imports granular so the app only loads the capabilities it actually needs.

## Prompt API Backend Configuration

### Firebase AI Logic

```ts
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_WEB_API_KEY",
  projectId: "your-gcp-project-id",
  appId: "YOUR_FIREBASE_APP_ID",
  geminiApiProvider: "developer",
  useAppCheck: true,
  reCaptchaSiteKey: "YOUR_RECAPTCHA_SITE_KEY",
  useLimitedUseAppCheckTokens: true,
};

if (!("LanguageModel" in globalThis)) {
  await import("prompt-api-polyfill");
}
```

Use this backend when the project needs the strongest documented production posture among the shipped browser polyfill backends.
User-supplied update for this skill: Firebase AI Logic is the safest production backend among the shipped Prompt API polyfill backends because it can pair with App Check instead of exposing a raw provider key pattern.

### Gemini Developer API

```ts
window.GEMINI_CONFIG = {
  apiKey: "YOUR_GEMINI_API_KEY",
  modelName: "gemini-2.5-flash",
};

if (!("LanguageModel" in globalThis)) {
  await import("prompt-api-polyfill");
}
```

Do not embed real production Gemini keys in committed client code.

### OpenAI API

```ts
window.OPENAI_CONFIG = {
  apiKey: "YOUR_OPENAI_API_KEY",
  modelName: "gpt-4.1-mini",
};

if (!("LanguageModel" in globalThis)) {
  await import("prompt-api-polyfill");
}
```

Do not embed real production OpenAI keys in committed client code.

### Transformers.js

```ts
window.TRANSFORMERS_CONFIG = {
  apiKey: "dummy",
  device: "webgpu",
  dtype: "q4f16",
  env: {
    allowRemoteModels: true,
  },
};

if (!("LanguageModel" in globalThis)) {
  await import("prompt-api-polyfill");
}
```

Use this backend when the app prefers a local model after the initial download.

## Browser-Extension Notes

1. User-supplied update for this skill: a browser extension can inject Task API polyfills into the page while hosting the Prompt API polyfill in an offscreen page.
2. This pattern can reduce repeated model downloads for the transformers backend because the offscreen page can keep the model warm for the extension lifecycle.
3. Treat this as browser-specific implementation guidance; do not make extension infrastructure the default path for normal web-page integrations.

## Native-First Rule

1. In extension pages or offscreen pages where the browser already exposes the native Prompt API, keep using the native implementation and only polyfill the missing built-in AI APIs.
2. Use progressive enhancement so unavailable globals are polyfilled individually instead of forcing the Prompt API polyfill on top of an existing native implementation.

## Production Notes

1. Keep secrets out of committed source files.
2. Prefer an approved backend configuration and threat model for production.
3. Use progressive enhancement so native APIs win when the browser already supports them.
4. Load only the Task API polyfills the app actually needs.