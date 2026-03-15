# Examples

Use these patterns when adapting the skill to a browser app.

## Feature detection

```ts
const hasWritingAssistance =
  typeof self !== "undefined" &&
  ("Summarizer" in self || "Writer" in self || "Rewriter" in self);
```

## Availability check before session creation

```ts
if (!("Writer" in self)) {
  throw new Error("Writer API is unavailable in this browser.");
}

const availability = await Writer.availability({
  outputLanguage: "en",
});

if (availability === "unavailable") {
  throw new Error("Writer API is not supported for this environment.");
}
```

## Session creation with download progress

```ts
const controller = new AbortController();

const summarizer = await Summarizer.create({
  type: "key-points",
  format: "markdown",
  length: "short",
  signal: controller.signal,
  monitor(monitor) {
    monitor.addEventListener("downloadprogress", event => {
      const fraction = event.total ? event.loaded / event.total : event.loaded;
      console.log("download progress", fraction);
    });
  },
});
```

## Batch summarization

```ts
const summary = await summarizer.summarize(articleText, {
  context: "Summaries should help a developer skim release notes quickly.",
});
```

## Streaming writing

```ts
const writer = await Writer.create({
  tone: "formal",
  format: "plain-text",
  length: "medium",
});

let output = "";
for await (const chunk of writer.writeStreaming("Draft a launch email for a beta feature.")) {
  output += chunk;
  renderOutput(output);
}
```

## Streaming rewrite with cancellation

```ts
const abortController = new AbortController();
const rewriter = await Rewriter.create({
  tone: "more-casual",
  length: "shorter",
});

const stream = rewriter.rewriteStreaming(existingCopy, {
  context: "Keep the CTA intact and preserve the product name.",
  signal: abortController.signal,
});

stopButton.addEventListener("click", () => abortController.abort());

let rewritten = "";
for await (const chunk of stream) {
  rewritten += chunk;
  preview(rewritten);
}
```

## Quota-aware preflight

```ts
const requested = await rewriter.measureInputUsage(longText, {
  context: "Shorten this help article without changing the support steps.",
});

if (requested > rewriter.inputQuota) {
  throw new Error("Input is too large for this session.");
}
```

## Cleanup on route disposal

```ts
function disposeSession(session: { destroy(): void } | null) {
  session?.destroy();
}
```

## Plain text extraction before summarization

```ts
const article = document.querySelector("article");
const articleText = article instanceof HTMLElement ? article.innerText.trim() : "";
```