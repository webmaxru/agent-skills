# Examples

Use these patterns when adapting the skill to a browser app.

## Feature detection

```ts
const hasProofreader = typeof self !== "undefined" && "Proofreader" in self;
```

## Availability check before session creation

```ts
if (!("Proofreader" in self)) {
  throw new Error("Proofreader API is unavailable in this browser.");
}

const options = {
  expectedInputLanguages: ["en"],
};

const availability = await Proofreader.availability(options);

if (availability === "unavailable") {
  throw new Error("Proofreader API is not supported for this environment.");
}
```

## Session creation with download progress

```ts
const controller = new AbortController();

const proofreader = await Proofreader.create({
  ...options,
  signal: controller.signal,
  monitor(monitor) {
    monitor.addEventListener("downloadprogress", event => {
      const progressEvent = event as Event & { loaded: number; total?: number };
      const fraction =
        typeof progressEvent.total === "number" && progressEvent.total > 0
          ? progressEvent.loaded / progressEvent.total
          : progressEvent.loaded;

      console.log("download progress", fraction);
    });
  },
});
```

## Batch proofreading

```ts
const result = await proofreader.proofread("I seen him yesterday at the store.");

console.log(result.correctedInput);
console.log(result.corrections);
```

## Rendering correction ranges

```ts
function renderCorrections(input: string, corrections: Array<{ startIndex: number; endIndex: number; correction: string }>) {
  let cursor = 0;

  for (const correction of corrections) {
    const unchanged = input.slice(cursor, correction.startIndex);
    const original = input.slice(correction.startIndex, correction.endIndex);
    console.log({ unchanged, original, replacement: correction.correction });
    cursor = correction.endIndex;
  }

  console.log({ tail: input.slice(cursor) });
}
```

## Quota-aware preflight

```ts
const requested = await proofreader.measureInputUsage(longDraft);

if (requested > 10000) {
  throw new Error("Input is too large for the current proofreading flow.");
}
```

## Cleanup on route disposal

```ts
function disposeSession(session: { destroy(): void } | null) {
  session?.destroy();
}
```

## Cross-origin iframe delegation

```html
<iframe src="https://child.example" allow="proofreader"></iframe>
```