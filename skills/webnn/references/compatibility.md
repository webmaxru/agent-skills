# Compatibility

WebNN remains experimental. Treat browser support and backend behavior as an explicit project dependency, not as ambient browser capability.

## Baseline support notes

* WebNN is primarily available in Chromium-based browsers.
* `navigator.ml`, `ML`, `MLContext`, and `MLGraphBuilder` landed in Chromium milestone 112.
* `MLTensor` landed in milestone 124.
* `MLContext.dispatch()` and `opSupportLimits()` landed in milestone 128.
* `MLContext.createTensor()`, `readTensor()`, and `writeTensor()` landed in milestone 129.
* The scalar `builder.constant(type, value)` overload is listed from milestone 132.
* The W3C WebNN spec (CR published January 2026) replaced `deviceType` with an `accelerated: boolean` flag and expanded Worker support to all worker types. Implementation rollout in Chromium is ongoing; check the target milestone before relying on these changes.

## Execution context requirements

* Secure context is required.
* `Window` and all `Worker` contexts are supported (DedicatedWorker, SharedWorker, ServiceWorker).
* Non-browser, server-side, or headless-only environments do not expose WebNN directly.

## Platform backend notes

* Windows 11 24H2+ can use ONNX Runtime through the Windows ML path when the relevant Chromium WebNN ONNX Runtime feature is enabled.
* Older or differently configured Windows builds can still fall back to TFLite or legacy DirectML-related paths.
* DirectML was officially deprecated in 2025. Do not build new product assumptions around DirectML-specific behavior.
* Apple Silicon systems on current macOS releases can route through Core ML when that backend is enabled.
* Linux and ChromeOS commonly rely on TFLite-based paths with CPU-first fallback behavior.
* Android support also depends on TFLite-backed delegates and can fall back to CPU.

## Device selection guidance

* The current spec uses two orthogonal options in `MLContextOptions`:
  * `powerPreference`: `"default"` | `"high-performance"` | `"low-power"` — indicates speed vs. power consumption intent.
  * `accelerated`: boolean (default `true`) — when `true`, the browser prefers massively parallel acceleration (GPU or NPU) guided by `powerPreference`; when `false`, the application prefers CPU inference.
* Omit both to get the browser's default behavior.
* Use `{ accelerated: false }` when CPU-only execution is required for broad reach or determinism.
* Use `{ powerPreference: "high-performance" }` for throughput-oriented workloads; the browser selects the best accelerated device available.
* Use `{ powerPreference: "low-power" }` when the feature benefits from sustained local inference with minimal battery impact.
* If a `GPUDevice` is already held from WebGPU, pass it directly to `createContext(gpuDevice)` to share the GPU device.
* Neither `accelerated` nor `powerPreference` guarantees that every operator will run on a specific device. Backends can partition graphs and fall back per operator.
* Earlier Chromium builds used a now-removed `deviceType: "cpu" | "gpu" | "npu"` option. Treat any code using `deviceType` as targeting a legacy API surface that the spec has removed.

## Chromium preview notes

* Chromium-based previews can require `#web-machine-learning-neural-network`.
* Experimental surfaces can additionally require `#experimental-web-machine-learning-neural-network`.
* Windows ML or ONNX Runtime-specific behavior can depend on the Chromium WebNN ONNX Runtime feature flag.
* Development-only flags such as `--no-sandbox` or `--disable-gpu-sandbox` are not acceptable shipping guidance.

Validate the actual target browser and milestone before attributing failures to application code.