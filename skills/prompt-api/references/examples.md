# Browser Prompt API Examples

Use these examples when the integration needs a spec-valid prompt shape.

## Text Prompt Shorthand

```ts
const session = await LanguageModel.create({
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
});

const result = await session.prompt("Summarize this page in three bullets.");
```

## Text Prompt Message Array

```ts
const session = await LanguageModel.create({
  initialPrompts: [
    {
      role: "system",
      content: "You are a concise documentation assistant.",
    },
  ],
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
});

const result = await session.prompt([
  {
    role: "user",
    content: "Rewrite this release note for developers.",
  },
]);
```

## Image Prompt

```ts
const imageBitmap = await createImageBitmap(file);

const session = await LanguageModel.create({
  expectedInputs: [
    { type: "text", languages: ["en"] },
    { type: "image" },
  ],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
});

const result = await session.prompt([
  {
    role: "user",
    content: [
      { type: "text", value: "Describe the uploaded image for alt text." },
      { type: "image", value: imageBitmap },
    ],
  },
]);
```

## Audio Prompt

```ts
const audioBuffer = await captureAudioBuffer();

const session = await LanguageModel.create({
  expectedInputs: [
    { type: "text", languages: ["en"] },
    { type: "audio" },
  ],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
});

const result = await session.prompt([
  {
    role: "user",
    content: [
      { type: "text", value: "Transcribe and summarize this clip." },
      { type: "audio", value: audioBuffer },
    ],
  },
]);
```

## Prefix-Constrained Assistant Output

```ts
const session = await LanguageModel.create({
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
});

const result = await session.prompt([
  {
    role: "user",
    content: "Return a JSON object with only a title field for this article.",
  },
  {
    role: "assistant",
    content: '{"title": ',
    prefix: true,
  },
]);
```

## Tool-Enabled Session

```ts
const session = await LanguageModel.create({
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
  tools: [
    {
      name: "lookupWeather",
      description: "Looks up the weather for a city.",
      inputSchema: {
        type: "object",
        properties: {
          city: { type: "string" },
        },
        required: ["city"],
      },
      async execute(args) {
        const { city } = args as { city: string };
        return JSON.stringify({ city, summary: "72F and clear" });
      },
    },
  ],
});

const result = await session.prompt("What is the weather in Seattle?");
```

## Invalid Shapes To Avoid

1. Do not place `system` messages in normal `prompt()`, `append()`, or `measureContextUsage()` input.
2. Do not set `prefix: true` on any message except the final `assistant` message.
3. Do not attach image or audio content to an `assistant` message.
4. Do not pass an empty message array.

## Progressive Enhancement Pattern

```ts
async function ensurePromptApi(): Promise<void> {
  if ("LanguageModel" in globalThis) {
    return;
  }

  await import("prompt-api-polyfill");
}
```

## Polyfill Installation Snippets

```bash
npm install prompt-api-polyfill
npm install built-in-ai-task-apis-polyfills
```

## `package.json` Snippet For Native-First Apps

```json
{
  "dependencies": {
    "prompt-api-polyfill": "^1.14.1",
    "built-in-ai-task-apis-polyfills": "^1.8.0"
  }
}
```

Use this pattern when the application prefers native built-in AI APIs first and only loads polyfills when a required global is missing.

## Task API Polyfill Loading Pattern

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

await Promise.all(polyfills);
```

## Prompt API Polyfill Backend Selection

```ts
window.FIREBASE_CONFIG = firebaseConfig;
// or: window.GEMINI_CONFIG = { apiKey: "..." };
// or: window.OPENAI_CONFIG = { apiKey: "..." };
// or: window.TRANSFORMERS_CONFIG = { apiKey: "dummy", device: "webgpu" };

if (!("LanguageModel" in globalThis)) {
  await import("prompt-api-polyfill");
}
```

## Compatibility Pattern For Context Metrics

```ts
const usage = getPromptContextUsage(session);
const windowSize = getPromptContextWindow(session);
setPromptContextOverflowHandler(session, () => {
  console.warn("Prompt context is full or nearing the implementation limit.");
});
```