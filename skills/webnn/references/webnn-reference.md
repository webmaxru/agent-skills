# WebNN Reference

The W3C WebNN specification at `https://www.w3.org/TR/webnn/` is the authoritative source for API semantics. Use `https://webnn.io/en/api-reference/reference` as the practical index for interface details, compatibility notes, and examples.

## Core execution model

* `navigator.ml` is the browser entry point.
* `navigator.ml.createContext(options?)` creates an `MLContext` with optional `powerPreference` and `accelerated` preferences.
* `navigator.ml.createContext(gpuDevice)` creates a WebGPU-backed `MLContext` from an existing `GPUDevice`.
* `MLGraphBuilder` constructs a graph from `MLOperand` inputs, constants, and operations.
* `builder.build()` compiles the graph asynchronously into an `MLGraph`. Can only be called once per builder.
* `MLContext.createTensor()` creates reusable `MLTensor` objects for graph I/O.
* `MLContext.createConstantTensor(descriptor, inputData)` creates a pre-initialized constant tensor (useful for weights).
* `MLContext.writeTensor()` copies input data into writable tensors.
* `MLContext.dispatch()` schedules graph execution.
* `await MLContext.readTensor(tensor)` reads output data back to script as an `ArrayBuffer`.
* `await MLContext.readTensor(tensor, outputData)` reads output data into an existing `AllowSharedBufferSource` buffer.

## Context and device options

* `powerPreference`: `default`, `high-performance`, or `low-power`. Indicates speed vs. power consumption preference.
* `accelerated`: boolean, default `true`. When `true`, the browser prefers massively parallel acceleration (GPU or NPU) informed by `powerPreference`. When `false`, the application prefers CPU inference.
* `context.accelerated`: readonly boolean attribute reflecting whether the context was created with hardware acceleration.
* `context.lost`: a promise that resolves when the execution context becomes invalid.
* `opSupportLimits()`: reports device-dependent support limits and data type coverage for operators.

## Integration rules

* WebNN requires a secure context.
* WebNN surfaces are available in `Window` and all `Worker` contexts (DedicatedWorker, SharedWorker, ServiceWorker).
* `dispatch()` does not report completion. Read output tensors to synchronize with the executed result.
* `accelerated` and `powerPreference` are preferences. Implementations select the best available backend match.
* Reuse compiled graphs and tensors when shapes remain stable.
* Destroy tensors, graphs, and contexts when the feature is disposed.

## When to prefer direct WebNN graphs

Use direct `MLGraphBuilder` flows when:

* the application owns the graph logic,
* the graph is small or deterministic,
* the feature needs tight control over tensors and execution lifecycle,
* the team wants minimal runtime indirection.

## Operator labels

Every operator-options dictionary accepts an optional `label` string for debugging. Labels are language-independent identifiers (e.g. `"matmul#1"`) and appear in error messages when operations fail. Labels are not intended to be natural language strings.

## When to preserve an adapter layer

Use an adapter around an existing local runtime when:

* the application already loads models through ONNX Runtime Web or another in-browser runtime,
* pre-processing and post-processing are already centralized there,
* the task is to prefer WebNN acceleration instead of rewriting the full inference path.

Keep WebNN as the preferred local acceleration path, not as a reason to invent a second inference architecture.