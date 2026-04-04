# Troubleshooting

## Missing global

Symptoms:

* `Proofreader is not defined`

Checks:

1. Confirm a secure context.
2. Confirm the target browser and channel support the API.
3. Confirm preview flags or origin-trial setup where required.
4. Confirm the code is running in a window, not in a worker or server runtime.

## `availability()` returns `unavailable`

Checks:

1. Retry with the same option shape the product will actually use.
2. Remove optional language or correction-detail constraints one by one to isolate the unsupported dimension.
3. Confirm device, storage, and network requirements from `references/compatibility.md`.
4. Keep the fallback path instead of forcing `create()`.

## `create()` throws `NotAllowedError`

Likely causes:

* the frame is blocked by permissions policy
* the browser requires user activation to start a download
* the user agent or user rejected model download or use

Checks:

1. Confirm the action is user initiated.
2. Confirm iframe delegation for `proofreader`.
3. Confirm browser policy or enterprise restrictions are not blocking access.

## `create()` or `proofread()` throws `NotSupportedError`

Likely causes:

* unsupported input language
* unsupported correction-type or explanation options in the current preview browser
* missing or unsupported explanation language when explanations are requested
* `includeCorrectionExplanations` is `true`, no `correctionExplanationLanguage` was set, and the language of the input text could not be determined

Remediation:

1. Canonicalize and reduce language constraints.
2. Remove unsupported correction-detail options for the current browser.
3. Set `correctionExplanationLanguage` explicitly when `includeCorrectionExplanations` is `true` to avoid failures from undetectable input language.
4. Keep browser-specific fallbacks explicit instead of silently dropping user-facing result fields.

## `create()` throws `OperationError` or `UnknownError`

Likely causes:

* browser download failure
* device no longer meets storage or runtime requirements
* transient built-in model management failure

Remediation:

1. Retry once after confirming the browser is still eligible to run the API.
2. If creation is still failing, surface the fallback path and avoid repeated automatic retries.
3. Check `edge://on-device-internals` or `chrome://on-device-internals` when the environment permits it.

## Incorrect or empty results

Likely causes:

* the input is empty or contains no proofreadable content
* the browser treated a mixed-language input as unsupported
* the feature expected general generation instead of literal proofreading

Remediation:

1. Trim and validate input before calling `proofread()`.
2. Set expected input languages when the product already knows them.
3. Re-scope the feature if the product actually needs writing, rewriting, or prompting.

## Worker or server usage

Likely causes:

* the implementation was placed in a worker, server action, or backend route

Remediation:

1. Move feature detection and session creation to a window context.
2. Keep server code limited to non-Proofreader fallback behavior.