# WebNN Reference

The W3C WebNN specification at `https://www.w3.org/TR/webnn/` is the authoritative source for API semantics. Use `https://webnn.io/en/api-reference/reference` as the practical index for interface details, compatibility notes, and examples.

## Core execution model

* `navigator.ml` is the browser entry point.
* `navigator.ml.createContext()` creates an `MLContext` with optional `deviceType` and `powerPreference` preferences.
* `MLGraphBuilder` constructs a graph from `MLOperand` inputs, constants, and operations.
* `builder.build()` compiles the graph asynchronously into an `MLGraph`.
* `MLContext.createTensor()` creates reusable `MLTensor` objects for graph I/O.
* `MLContext.writeTensor()` copies input data into writable tensors.
* `MLContext.dispatch()` schedules graph execution.
* `await MLContext.readTensor()` reads output data back to script.

## Context and device terms

* `deviceType`: `cpu`, `gpu`, or `npu`.
* `powerPreference`: `default`, `high-performance`, or `low-power`.
* `context.lost`: a promise that resolves when the execution context becomes invalid.
* `opSupportLimits()`: reports device-dependent support limits and data type coverage for operators.

## Integration rules

* WebNN requires a secure context.
* WebNN surfaces are available in `Window` and `DedicatedWorker` contexts.
* `dispatch()` does not report completion. Read output tensors to synchronize with the executed result.
* Requested devices are preferences. Implementations can partition graphs or fall back per operator.
* Reuse compiled graphs and tensors when shapes remain stable.
* Destroy tensors, graphs, and contexts when the feature is disposed.

## When to prefer direct WebNN graphs

Use direct `MLGraphBuilder` flows when:

* the application owns the graph logic,
* the graph is small or deterministic,
* the feature needs tight control over tensors and execution lifecycle,
* the team wants minimal runtime indirection.

## When to preserve an adapter layer

Use an adapter around an existing local runtime when:

* the application already loads models through ONNX Runtime Web or another in-browser runtime,
* pre-processing and post-processing are already centralized there,
* the task is to prefer WebNN acceleration instead of rewriting the full inference path.

Keep WebNN as the preferred local acceleration path, not as a reason to invent a second inference architecture.