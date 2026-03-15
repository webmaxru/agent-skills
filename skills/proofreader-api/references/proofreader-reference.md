# Proofreader API Reference

Read this file before implementing browser Proofreader API features.

## API surface

The Proofreader API exposes a secure-context `Window` global:

* `Proofreader`

Its lifecycle follows this shape:

1. Call `Proofreader.availability(options?)`.
2. Call `Proofreader.create(options?)` when the feature should start or resume a proofreading session.
3. Use `session.proofread(input, options?)` to generate corrected text and structured corrections.
4. Use `session.measureInputUsage(input, options?)` when the feature needs quota-aware behavior.
5. Call `destroy()` or abort the owning signal when the UI no longer needs the session.

## Creation behavior

The specification defines these `create()` options:

* `signal`: aborts creation and future activity tied to that signal.
* `monitor`: receives a `CreateMonitor` whose `downloadprogress` events expose `loaded` and `total`.
* `expectedInputLanguages`: canonical language tags expected in the text to proofread.
* `includeCorrectionTypes`: requests correction labels such as spelling or grammar.
* `includeCorrectionExplanations`: requests plain-language explanations for each correction.
* `correctionExplanationLanguage`: requests the language used for correction explanations.

Creation can fail if:

* the document is not fully active
* the API is blocked by permissions policy
* the requested options are unavailable for the browser's current model capabilities
* download initiation requires user activation and the page has none
* initialization fails because the device or browser runtime no longer qualifies

## Availability states

`availability()` resolves to one of four states:

* `unavailable`: the browser cannot support the requested combination.
* `downloadable`: the browser could support it after a new download.
* `downloading`: a required download is already in progress.
* `available`: the browser can create the session now.

Treat `downloadable` and `downloading` as preparatory states. The UI should still drive a real `create()` path before claiming the feature is ready.

## Session members

The specification defines these session members:

* `proofread(input, options?)`
* `measureInputUsage(input, options?)`
* `destroy()`
* `includeCorrectionTypes`
* `includeCorrectionExplanations`
* `expectedInputLanguages`
* `correctionExplanationLanguage`

Per-call options currently include:

* `signal`

## Result shape

`proofread()` resolves to a `ProofreadResult` with:

* `correctedInput`: the corrected full text
* `corrections`: an ordered array of corrections

Each `ProofreadCorrection` can contain:

* `startIndex`
* `endIndex`
* `correction`
* `types`
* `explanation`

The specification enumerates these correction types:

* `spelling`
* `punctuation`
* `capitalization`
* `grammar`

## Language and option guidance

* Keep `expectedInputLanguages` explicit when the product depends on supported language routing.
* Language tags must be structurally valid and canonicalizable.
* `availability()` can best-fit requested languages to supported language tags.
* If `includeCorrectionExplanations` is enabled without a usable explanation language, some browsers may surface `NotSupportedError`.
* Empty or non-proofreadable input should resolve to an empty corrected string instead of a fabricated answer.

## Permissions and frame rules

Access is gated by the `proofreader` permissions-policy feature with a default allowlist of `self`.

Same-origin frames inherit access by default. Cross-origin frames need explicit delegation, for example:

```html
<iframe src="https://child.example" allow="proofreader"></iframe>
```

## Product boundaries

* Use Proofreader for grammar, spelling, punctuation, and similar correction workflows.
* Do not route generic assistant, chat, or open-ended generation tasks through this API.
* Keep browser-specific preview gaps in compatibility handling instead of assuming the full specification ships everywhere.