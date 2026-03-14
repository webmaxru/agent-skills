# Browser Prompt API Polyfills

Use this reference when the feature needs concrete package installation or backend configuration examples for Prompt API and Built-in AI Task API polyfills.

## Packages

1. Prompt API polyfill: `prompt-api-polyfill`
2. Built-in AI Task API polyfills: `built-in-ai-task-apis-polyfills`

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

### Gemini API

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

## Production Notes

1. Keep secrets out of committed source files.
2. Prefer an approved backend configuration and threat model for production.
3. Use progressive enhancement so native APIs win when the browser already supports them.
4. Load only the Task API polyfills the app actually needs.