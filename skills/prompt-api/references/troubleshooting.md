# Browser Prompt API Troubleshooting

## `LanguageModel` is undefined

1. Confirm the code runs in a secure browser window context rather than on the server or in a worker.
2. Confirm the target browser build exposes the Prompt API.
3. Confirm that the current frame is allowed by the `language-model` permissions-policy.
4. If broader support is required, progressively load the project's maintained Prompt API polyfill.
5. Fall back to a non-AI experience when neither native support nor the approved polyfill path is available.

## `availability()` returns `unavailable`

1. Compare the requested modalities and languages with the feature requirements.
2. Remove unsupported tools or modalities before retrying.
3. Confirm that the browser implementation supports the Prompt API features the app is requesting.

## `availability()` returns `downloading`

1. Create the session only after user activation.
2. Pass a `monitor` callback to `LanguageModel.create()` and surface progress.
3. Delay prompt submission until the model finishes downloading.

## `SyntaxError`

1. Check whether `prefix: true` is applied to anything other than the final `assistant` message.
2. Check whether `initialPrompts` or prompt message arrays are empty after app logic transforms them.
3. Check whether a `system` message appears after any non-system message inside `initialPrompts`.

## `NotSupportedError`

1. Check whether `expectedInputs`, `expectedOutputs`, or `tools` declare combinations unsupported by the current implementation.
2. Keep the options passed to `availability()` and the options used for actual prompts aligned.
3. Check whether a normal prompt input contains a `system` role or whether an `assistant` message carries non-text content.
4. Reduce the integration to a text-only flow first, then reintroduce image, audio, or tools if needed.

## `TypeError`

1. Check that text content uses strings.
2. Check that image content uses `ImageBitmapSource` or `BufferSource` values.
3. Check that audio content uses `AudioBuffer`, `BufferSource`, or `Blob` values.

## iframe failures

1. Same-origin iframes inherit access from the top-level page.
2. Cross-origin iframes require `allow="language-model"` on the embedding iframe.
3. If the embedding page cannot grant that permission, move the Prompt API call to the top-level window.

## Session leaks or stale context

1. Reuse sessions intentionally instead of creating one per keystroke.
2. Call `destroy()` when leaving the feature, route, or component.
3. Reset or clone sessions when the app needs a fresh conversation branch.
4. Use the compatibility helpers from the wrapper template to read context metrics and register overflow handlers across browser versions.

## Removed model parameters

1. Remove any dependence on `LanguageModel.params()`.
2. Remove any feature logic that expects `topK` or `temperature` to affect standard web-page sessions.
3. If older browser versions still expose those properties, treat them as non-portable and ignore them.