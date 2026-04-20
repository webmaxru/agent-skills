# Translator API Reference

Use this file when the integration needs exact Translator API behavior, lifecycle constraints, or permissions-policy rules.

## Core surface

The Translator API is a secure-context `Window` API for on-device text translation between human languages.

Primary classes and methods:

* `Translator.availability({ sourceLanguage, targetLanguage })`
* `Translator.create({ sourceLanguage, targetLanguage, signal, monitor })`
* `translator.translate(input, { signal })`
* `translator.translateStreaming(input, { signal })`
* `translator.measureInputUsage(input, { signal })`
* `translator.destroy()`

Core properties:

* `translator.sourceLanguage`
* `translator.targetLanguage`
* `translator.inputQuota`

## Language inputs

* `sourceLanguage` and `targetLanguage` are required and use BCP 47 language tags.
* User agents can canonicalize or best-fit the requested language pair during `availability()` and `create()`.
* Treat the exact requested pair as product state, but do not assume the backing model uses the exact same canonicalized subtags internally.

## Availability model

`availability()` returns one of these states:

* `unavailable`
* `downloadable`
* `downloading`
* `available`

Important behaviors:

* `availability()` is the preflight check for whether a translator can likely be created for a language pair.
* A return value other than `unavailable` does not guarantee instant readiness; the browser can still need download time or user approval.
* Browsers can privacy-mask per-pair model state; Chrome reports all language pairs as `downloadable` until a translator is first created for that specific pair, so the real download state is only revealed after the first creation attempt.
* Identity translation is always a valid outcome for same-language or best-fit equivalent language pairs, so those cases should not be treated as unsupported.

## Creation and monitoring

`Translator.create()` initializes a session for a fixed language pair.

Creation options:

* `sourceLanguage`
* `targetLanguage`
* `signal`
* `monitor`

`monitor` receives a monitor object that emits `downloadprogress` events while model material is downloading.

Use monitored creation when the UI needs to show download state or first-run latency.

## Translation calls

`translate()` returns a promise for the full translated result.

`translateStreaming()` returns a `ReadableStream` that yields translated chunks incrementally.

Use `translate()` when downstream logic needs the complete translated string.

Use `translateStreaming()` when the UI should render partial translated output as it arrives.

Empty strings and input that contains no translatable content (whitespace only, control characters) are returned unchanged per the specification; `sourceLanguage` and `targetLanguage` are ignored in those cases.

## Input quota and usage

* `inputQuota` exposes the session quota for future translation operations. Its type is `unrestricted double`, so it may be `+∞` if the implementation imposes no specific quota beyond available memory or JavaScript string limits.
* `measureInputUsage()` estimates how much of that quota the given input would consume. It returns `0` when `inputQuota` is `+∞` (no quota limits apply).
* Use `measureInputUsage()` for large or user-generated text before starting translation when product logic needs predictable limits.
* Guard quota checks by confirming `inputQuota` is finite before treating a `0` usage estimate as meaningful.

## Lifecycle and cleanup

* Sessions are fixed to the language pair used during creation.
* Recreate the session when the product changes the source or target language.
* Call `destroy()` when the session is no longer needed.
* Use separate `AbortController` instances for session creation and for individual translation calls when the product needs fine-grained stop behavior.

## Permissions policy and context rules

* The API is gated by the `translator` permissions-policy feature.
* The default allowlist is `self`.
* Top-level windows and same-origin frames are allowed by default.
* Cross-origin frames need explicit delegation through `allow="translator"`.
* The API is exposed on `Window`, not in Web Workers.
* Secure context is required.

## Error shapes worth handling

The specification explicitly calls out these implementation-defined error names for translation failures:

* `NotAllowedError`: use is blocked by user choice or policy.
* `NotReadableError`: the user agent filtered the translation output, for example because it was detected to be harmful, inaccurate, or nonsensical.
* `UnknownError`: an implementation-defined translation failure.

Additional failures can still surface through shared infrastructure, such as:

* `OperationError` during initialization.
* `QuotaExceededError` when input usage exceeds the session quota.
* `AbortError` when the attached signal is canceled.
* `InvalidStateError` if document lifecycle requirements are no longer met during an operation.