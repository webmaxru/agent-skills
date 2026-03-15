# Compatibility

Writing Assistance APIs remain browser-specific and rollout-sensitive. Treat support as an explicit product dependency.

## Baseline support notes

* The specification defines `Summarizer`, `Writer`, and `Rewriter` as secure-context `Window` APIs.
* The primary specification is a W3C Community Group draft, not a standards-track recommendation.
* Firefox and Safari do not currently document support for these APIs.
* Worker contexts are not part of the current exposed surface.

## Microsoft Edge preview notes

* Microsoft Edge documents the Writing Assistance APIs as a developer preview in Canary or Dev starting with version `138.0.3309.2`.
* Edge currently documents preview enablement through separate flags for Summarizer, Writer, and Rewriter.
* Edge preview guidance currently targets Windows 10 or 11 and macOS 13.3+.
* Edge preview guidance currently requires at least 20 GB free storage, at least 5.5 GB VRAM, and an unmetered connection for the initial model download.
* Edge exposes device-readiness details through `edge://on-device-internals`.

## Chrome notes

* The supplied Chrome documentation explicitly covers `Summarizer` and points to the same built-in AI platform family for Writer and Rewriter.
* Chrome documents stable support for built-in AI APIs on supported desktop platforms beginning in milestone 138 for the covered rollout.
* Chrome documents desktop support on Windows 10 or 11, macOS 13+, Linux, and Chromebook Plus devices, but not on mobile browsers.
* Chrome documents minimum hardware requirements of more than 4 GB VRAM or a CPU path with at least 16 GB RAM and 4 CPU cores, plus at least 22 GB of free storage and an unmetered network for the initial download.
* Validate the exact Chrome rollout status for Writer and Rewriter against current browser docs before promising stable availability in product requirements.

## Secure context and frame rules

* Secure context is required.
* The APIs are intended for top-level windows and same-origin frames by default.
* Cross-origin frames need explicit permissions-policy delegation for each API they use.
* If the feature must run inside an embedded frame the app does not control, make iframe delegation a hard prerequisite.

## Creation and download behavior

* `availability()` can report `downloadable`, `downloading`, or `available` depending on model state and browser privacy masking.
* A first successful `create()` can require user activation if it needs to initiate a download.
* The initial model download can take noticeable time and should be surfaced in the UI when the feature depends on immediate readiness.
* Browsers can preserve download progress even if a create call is aborted.

## TypeScript and typings

* Browser DOM typings for these APIs are not guaranteed in every TypeScript version.
* Preserve local declaration files or project typings when a codebase already has them.
* Add narrow, feature-specific typings instead of widening the whole global namespace with speculative fields.

## Product guidance

* Do not ship these APIs as the only path for critical workflows unless the supported browser matrix is intentionally narrow.
* Keep a visible fallback for unsupported browsers, blocked frames, and devices that fail the preview hardware requirements.
* Re-check compatibility when browser milestones, preview flags, or bundled model requirements change.