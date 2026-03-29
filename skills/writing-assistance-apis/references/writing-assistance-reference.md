# Writing Assistance API Reference

Read this file before implementing browser writing assistance features.

## API surface

The Writing Assistance APIs expose three separate window globals in secure contexts:

* `Summarizer`
* `Writer`
* `Rewriter`

Each API has the same lifecycle shape:

1. Call `availability(options?)`.
2. Call `create(options?)` when the feature should start or resume a model session.
3. Use the session methods for batch or streaming output.
4. Measure usage when the feature needs quota-aware behavior.
5. Destroy the session when the UI no longer needs it.

## Shared creation behavior

All three APIs support these `create()` options:

* `signal`: aborts creation and future session activity tied to that signal.
* `monitor`: receives a `CreateMonitor` whose `downloadprogress` events expose fractional progress via `loaded` and `total`.
* `sharedContext`: session-wide context loaded during initialization.
* `expectedInputLanguages`: array of canonical language tags expected in the main input.
* `expectedContextLanguages`: array of canonical language tags expected in `sharedContext` or per-call `context`.
* `outputLanguage`: canonical language tag for desired output.

Creation can fail if:

* the document is not fully active
* the API is blocked by permissions policy
* the browser reports the requested options as unavailable
* download initiation requires user activation and the page has none
* initialization exceeds the API's input quota

## Availability states

`availability()` resolves to one of four states:

* `unavailable`: the browser cannot support the requested combination.
* `downloadable`: the browser could support it after a new download.
* `downloading`: a required download is already in progress.
* `available`: the browser can create the session now.

Treat `downloadable` and `downloading` as usable only after a real `create()` path has started or completed. A passive availability result does not mean the current page owns the download.

## Summarizer specifics

`Summarizer.create()` supports these extra options (defaults noted):

* `type`: `tldr`, `teaser`, `key-points` (default), `headline`
* `format`: `plain-text`, `markdown` (default)
* `length`: `short` (default), `medium`, `long`
* `preference`: `auto` (default), `speed`, `capability`
  * `auto`: implementation-defined balance between speed and capability; may adapt to system constraints.
  * `speed`: prioritize low latency and fast execution; may produce less nuanced summaries.
  * `capability`: prioritize comprehensiveness and coherence; may increase latency.

Session members:

* `summarize(input, options?)`
* `summarizeStreaming(input, options?)`
* `measureInputUsage(input, options?)`
* `inputQuota`
* `sharedContext`, `type`, `format`, `length`, `preference`
* `expectedInputLanguages`, `expectedContextLanguages`, `outputLanguage`
* `destroy()`

Per-call options:

* `context`
* `signal`

Use `Summarizer` only when the task is to condense or restate existing content as a summary. It is not a general question-answering or prompt-completion surface.

## Writer specifics

`Writer.create()` supports these extra options (defaults noted):

* `tone`: `formal`, `neutral` (default), `casual`
* `format`: `plain-text`, `markdown` (default)
* `length`: `short` (default), `medium`, `long`

Session members:

* `write(input, options?)`
* `writeStreaming(input, options?)`
* `measureInputUsage(input, options?)`
* `inputQuota`
* `sharedContext`, `tone`, `format`, `length`
* `expectedInputLanguages`, `expectedContextLanguages`, `outputLanguage`
* `destroy()`

Per-call options:

* `context`
* `signal`

Use `Writer` when the input is a writing task or prompt for new text, not an existing body of prose that needs transformation.

## Rewriter specifics

`Rewriter.create()` supports these extra options (defaults noted):

* `tone`: `as-is` (default), `more-formal`, `more-casual`
* `format`: `as-is` (default), `plain-text`, `markdown`
* `length`: `as-is` (default), `shorter`, `longer`

Session members:

* `rewrite(input, options?)`
* `rewriteStreaming(input, options?)`
* `measureInputUsage(input, options?)`
* `inputQuota`
* `sharedContext`, `tone`, `format`, `length`
* `expectedInputLanguages`, `expectedContextLanguages`, `outputLanguage`
* `destroy()`

Per-call options:

* `context`
* `signal`

Use `Rewriter` when the application needs to preserve the source text's purpose while changing tone, format, or length.

## Permissions and iframe rules

Each API has its own permissions-policy feature with a default allowlist of `self`:

* `summarizer`
* `writer`
* `rewriter`

Same-origin frames inherit access by default. Cross-origin frames need explicit delegation, for example:

```html
<iframe src="https://child.example" allow="summarizer; writer; rewriter"></iframe>
```

## Input, context, and language guidance

* Keep `sharedContext` short and stable. It consumes model quota during creation.
* Keep per-call `context` specific to the current request.
* Language tags must be structurally valid and canonicalizable.
* Unsupported or ambiguous language combinations can surface `NotSupportedError`.
* If the output language is omitted, the browser usually defaults to the input language.

## Lifecycle guidance

* Reuse a session only when the same option set continues to apply.
* Use batch methods when the full response is needed before continuing product logic.
* Use streaming methods when the UI benefits from partial output.
* Use `AbortController` for stop buttons or route changes.
* Call `destroy()` when the session is no longer needed so the browser can release model resources.