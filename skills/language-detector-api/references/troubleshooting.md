# Troubleshooting

## Missing `LanguageDetector`

Symptoms:

* `ReferenceError: LanguageDetector is not defined`
* feature detection fails

Checks:

1. Confirm a secure context.
2. Confirm the target browser and channel support the API.
3. Confirm preview flags are enabled where required.
4. Confirm the code is running in a window, not in a worker or server runtime.

## `availability()` returns `unavailable`

Checks:

1. Retry with the same `expectedInputLanguages` shape the product will actually use.
2. Remove `expectedInputLanguages` temporarily to check whether the constraint itself is the blocker.
3. Confirm browser, channel, and flag requirements from `references/compatibility.md`.
4. Keep the fallback path instead of forcing `create()`.

## `create()` throws `NotAllowedError`

Likely causes:

* the frame is blocked by permissions policy
* the browser requires user activation to start a download
* the user agent or user rejected model download or use

Checks:

1. Confirm the action is user initiated.
2. Confirm iframe delegation for `language-detector`.
3. Confirm browser policy or enterprise restrictions are not blocking access.

## `create()` or `detect()` throws `AbortError`

Likely causes:

* the attached `AbortSignal` was canceled
* the session was destroyed through a shared controller or explicit cleanup

Remediation:

1. Separate session-lifecycle controllers from per-call controllers when the product needs finer control.
2. Confirm the UI stop path is not reusing an already-aborted signal.

## `detect()` throws `InvalidStateError`

Likely causes:

* the document stopped being fully active
* the page navigated, backgrounded, or changed lifecycle state during the call

Remediation:

1. Retry only after the document is active again.
2. Recreate the session after a major route or lifecycle transition if needed.

## `detect()` throws `QuotaExceededError`

Likely causes:

* the input is too large for the current session quota

Remediation:

1. Call `measureInputUsage()` before detection when the product accepts large input.
2. Truncate, chunk, or reject oversized input instead of retrying unchanged.

## Results look wrong or too uncertain

Likely causes:

* the text is too short
* the text mixes multiple languages
* the input language is poorly represented for the current model set

Remediation:

1. Increase input length when the product can do so safely.
2. Preserve ranked candidates instead of using only the top result.
3. Treat low confidence or a dominant `und` result as an expected uncertainty signal.

## Worker integration fails

Likely cause:

* the API is not exposed in Web Workers

Remediation:

1. Move the detection boundary to a window-owned module or UI controller.
2. Stop and explain the platform mismatch if the feature contract requires worker-only execution.