# Examples

Use these patterns as shape references. Adapt them to the host framework and state model instead of copying them blindly.

## Support detection

```ts
type LanguageDetectorAvailability = "unavailable" | "downloadable" | "downloading" | "available";

function detectLanguageDetectorSupport(): { supported: boolean; reason: string | null } {
  const runtimeScope = globalThis as typeof globalThis & {
    isSecureContext?: boolean;
    LanguageDetector?: unknown;
  };

  if (!runtimeScope.isSecureContext) {
    return { supported: false, reason: "Language Detector requires HTTPS or localhost." };
  }

  if (!runtimeScope.LanguageDetector) {
    return { supported: false, reason: "LanguageDetector is unavailable in this browser." };
  }

  return { supported: true, reason: null };
}

const support = detectLanguageDetectorSupport();
if (!support.supported) {
  console.warn(support.reason);
}
```

## Availability and monitored session creation

```ts
const options = {
  expectedInputLanguages: ["en", "es", "fr"],
};

const availability = (await LanguageDetector.availability(options)) as LanguageDetectorAvailability;

if (availability === "unavailable") {
  throw new Error("Language Detector is unavailable for this scenario.");
}

const session = await LanguageDetector.create({
  ...options,
  monitor(monitor) {
    monitor.addEventListener("downloadprogress", event => {
      const progressEvent = event as Event & { loaded: number; total?: number };
      const total = typeof progressEvent.total === "number" ? progressEvent.total : null;
      const loaded = typeof progressEvent.loaded === "number" ? progressEvent.loaded : 0;
      console.log({ loaded, total });
    });
  },
});
```

## Detection with confidence-aware ranking

```ts
const results = await session.detect("Hallo und herzlich willkommen!");

for (const result of results) {
  console.log(result.detectedLanguage, result.confidence);
}

const best = results[0];
const und = results.at(-1);

if (!best || best.detectedLanguage === "und" || best.confidence < 0.8) {
  console.warn("Treat the language as uncertain.");
}
```

## Abort a long-running call

```ts
const controller = new AbortController();

const pending = session.detect(userText, {
  signal: controller.signal,
});

stopButton.addEventListener("click", () => {
  controller.abort(new DOMException("Detection canceled.", "AbortError"));
});

await pending;
```

## Cleanup

```ts
let session: LanguageDetectorSession | null = null;

try {
  session = await LanguageDetector.create();
  const results = await session.detect(userText);
  render(results);
} finally {
  session?.destroy();
}
```

## Decision shortcuts

Use `expectedInputLanguages` only when the product genuinely expects a narrower set of languages.

Keep the full ranked result list when downstream product logic can benefit from secondary candidates or uncertainty handling.