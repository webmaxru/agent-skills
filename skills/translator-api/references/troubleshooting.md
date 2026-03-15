# Troubleshooting

## Missing `Translator`

Symptoms:

* `ReferenceError: Translator is not defined`
* feature detection fails

Checks:

1. Confirm a secure context.
2. Confirm the target browser and channel support the API.
3. Confirm preview flags are enabled where required.
4. Confirm the code is running in a window, not in a worker or server runtime.

## `availability()` returns `unavailable`

Checks:

1. Retry with the same `sourceLanguage` and `targetLanguage` shape the product will actually use.
2. Confirm browser, channel, and flag requirements from `references/compatibility.md`.
3. Confirm that the current frame is not blocked by permissions policy.
4. Keep the fallback path instead of forcing `create()`.

## `create()` throws `NotAllowedError`

Likely causes:

* the frame is blocked by permissions policy
* the browser requires user activation to start a download
* the user agent or user rejected model download or use

Checks:

1. Confirm the action is user initiated.
2. Confirm iframe delegation for `translator`.
3. Confirm browser policy or enterprise restrictions are not blocking access.

## `create()` throws `OperationError`

Likely causes:

* model initialization failed after availability passed
* preview browser state or flags changed between checks

Remediation:

1. Retry only after checking browser version, flags, and download readiness.
2. Recreate the session from a fresh user action instead of reusing stale state.

## `translate()` or `translateStreaming()` throws `AbortError`

Likely causes:

* the attached `AbortSignal` was canceled
* the session was destroyed through a shared controller or explicit cleanup

Remediation:

1. Separate session-lifecycle controllers from per-call controllers when the product needs finer control.
2. Confirm the UI stop path is not reusing an already-aborted signal.

## Translation throws `QuotaExceededError`

Likely causes:

* the input is too large for the current session quota

Remediation:

1. Call `measureInputUsage()` before translation when the product accepts large input.
2. Truncate, chunk, or reject oversized input instead of retrying unchanged.

## Translation throws `NotReadableError` or `UnknownError`

Likely causes:

* the user agent filtered the translation output
* translation failed for an implementation-defined reason

Remediation:

1. Surface a visible fallback or retry affordance instead of silently failing.
2. Avoid immediately retrying the same request without changing browser state or input shape.

## Output looks unchanged

Likely causes:

* the source and target languages overlap and the browser resolved to identity translation
* the input contains no translatable content
* the text is already in the target language or effectively equivalent under best-fit matching

Remediation:

1. Treat unchanged output as a potentially valid result before labeling it a failure.
2. Confirm the selected source and target languages match the product intent.

## Worker integration fails

Likely cause:

* the API is not exposed in Web Workers

Remediation:

1. Move the translation boundary to a window-owned module or UI controller.
2. Stop and explain the platform mismatch if the feature contract requires worker-only execution.