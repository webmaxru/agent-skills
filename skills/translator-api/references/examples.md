# Examples

Use these patterns as shape references. Adapt them to the host framework and state model instead of copying them blindly.

## Support detection

```ts
type TranslatorAvailability = "unavailable" | "downloadable" | "downloading" | "available";

function detectTranslatorSupport(): { supported: boolean; reason: string | null } {
  const runtimeScope = globalThis as typeof globalThis & {
    isSecureContext?: boolean;
    Translator?: unknown;
  };

  if (!runtimeScope.isSecureContext) {
    return { supported: false, reason: "Translator requires HTTPS or localhost." };
  }

  if (!runtimeScope.Translator) {
    return { supported: false, reason: "Translator is unavailable in this browser." };
  }

  return { supported: true, reason: null };
}
```

## Availability and monitored session creation

```ts
const options = {
  sourceLanguage: "en",
  targetLanguage: "es",
};

const availability = (await Translator.availability(options)) as TranslatorAvailability;

if (availability === "unavailable") {
  throw new Error("Translator is unavailable for this language pair.");
}

const session = await Translator.create({
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

## Full-result translation

```ts
const session = await Translator.create({
  sourceLanguage: "en",
  targetLanguage: "fr",
});

const translated = await session.translate("Where is the nearest train station?");
console.log(translated);
```

## Streaming translation with cancellation

```ts
const controller = new AbortController();

const stream = session.translateStreaming(longText, {
  signal: controller.signal,
});

stopButton.addEventListener("click", () => {
  controller.abort(new DOMException("Translation canceled.", "AbortError"));
});

let output = "";
for await (const chunk of stream) {
  output += chunk;
  render(output);
}
```

## Measure input usage before translation

```ts
const estimatedUsage = await session.measureInputUsage(userText);

if (estimatedUsage > session.inputQuota) {
  throw new Error("The requested translation is too large for the current session quota.");
}
```

## Session recreation when languages change

```ts
let session: TranslatorSession | null = null;

async function ensureTranslator(sourceLanguage: string, targetLanguage: string) {
  if (
    session &&
    session.sourceLanguage === sourceLanguage &&
    session.targetLanguage === targetLanguage
  ) {
    return session;
  }

  session?.destroy();
  session = await Translator.create({ sourceLanguage, targetLanguage });
  return session;
}
```

## Cleanup

```ts
let session: TranslatorSession | null = null;

try {
  session = await Translator.create({
    sourceLanguage: "en",
    targetLanguage: "de",
  });

  const translated = await session.translate(userText);
  render(translated);
} finally {
  session?.destroy();
}
```

## Decision shortcuts

Treat `downloadable` and `downloading` as useful states to surface to users, not as hard failures.

Treat identical input and output strings as potentially valid identity translation when the requested language pair overlaps or resolves to a best-fit equivalent.

Keep translation requests scoped to one product-facing task at a time; if the app sends large texts sequentially, surface loading state instead of silently queueing work.