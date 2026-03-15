# Compatibility

WebNN remains experimental. Treat browser support and backend behavior as an explicit project dependency, not as ambient browser capability.

## Baseline support notes

* WebNN is primarily available in Chromium-based browsers.
* `navigator.ml`, `ML`, `MLContext`, and `MLGraphBuilder` landed in Chromium milestone 112.
* `MLTensor` landed in milestone 124.
* `MLContext.dispatch()` and `opSupportLimits()` landed in milestone 128.
* `MLContext.createTensor()`, `readTensor()`, and `writeTensor()` landed in milestone 129.
* The scalar `builder.constant(type, value)` overload is listed from milestone 132.

## Execution context requirements

* Secure context is required.
* `Window` and `DedicatedWorker` contexts are supported.
* Non-browser, server-side, or headless-only environments do not expose WebNN directly.

## Platform backend notes

* Windows 11 24H2+ can use ONNX Runtime through the Windows ML path when the relevant Chromium WebNN ONNX Runtime feature is enabled.
* Older or differently configured Windows builds can still fall back to TFLite or legacy DirectML-related paths.
* DirectML was officially deprecated in 2025. Do not build new product assumptions around DirectML-specific behavior.
* Apple Silicon systems on current macOS releases can route through Core ML when that backend is enabled.
* Linux and ChromeOS commonly rely on TFLite-based paths with CPU-first fallback behavior.
* Android support also depends on TFLite-backed delegates and can fall back to CPU.

## Device selection guidance

* `cpu` is the safest default when the feature must work broadly.
* `gpu` is appropriate for throughput-oriented workloads.
* `npu` is appropriate for supported hardware when the feature benefits from sustained local inference and power efficiency.
* A requested device is not a guarantee that every operator will run on that device.
* On some backends, the graph can be partitioned and unsupported pieces can still fall back to CPU.

## Chromium preview notes

* Chromium-based previews can require `#web-machine-learning-neural-network`.
* Experimental surfaces can additionally require `#experimental-web-machine-learning-neural-network`.
* Windows ML or ONNX Runtime-specific behavior can depend on the Chromium WebNN ONNX Runtime feature flag.
* Development-only flags such as `--no-sandbox` or `--disable-gpu-sandbox` are not acceptable shipping guidance.

Validate the actual target browser and milestone before attributing failures to application code.