# Examples

Use these patterns as shape references. Adapt them to the host framework and state model instead of copying them blindly.

## Support and context creation

```ts
function detectWebNNSupport(): { supported: boolean; reason: string | null } {
  const runtimeScope = globalThis as typeof globalThis & {
    navigator?: Navigator & { ml?: unknown };
    isSecureContext?: boolean;
  };

  if (!runtimeScope.navigator) {
    return { supported: false, reason: "WebNN requires a browser window or dedicated worker context." };
  }

  if (!runtimeScope.isSecureContext) {
    return { supported: false, reason: "WebNN requires HTTPS or localhost." };
  }

  if (!("ml" in runtimeScope.navigator) || !runtimeScope.navigator.ml) {
    return { supported: false, reason: "navigator.ml is unavailable in this browser." };
  }

  return { supported: true, reason: null };
}

const support = detectWebNNSupport();
if (!support.supported) {
  console.warn(support.reason);
} else {
  const runtimeNavigator = (globalThis as typeof globalThis & {
    navigator: Navigator & {
      ml: {
        createContext(options?: { deviceType?: "cpu" | "gpu" | "npu"; powerPreference?: "default" | "high-performance" | "low-power" }): Promise<MLContext>;
      };
    };
  }).navigator;

  const context = await runtimeNavigator.ml.createContext({
    deviceType: "gpu",
    powerPreference: "high-performance",
  });
}
```

## Direct graph smoke test

```ts
const descriptor = { dataType: "float32", shape: [2, 2] } as const;
const context = await navigator.ml.createContext({ deviceType: "gpu" });
const builder = new MLGraphBuilder(context);

const scale = builder.constant(descriptor, new Float32Array(4).fill(0.2));
const inputA = builder.input("A", descriptor);
const inputB = builder.input("B", descriptor);
const outputC = builder.add(builder.mul(inputA, scale), inputB);
const graph = await builder.build({ C: outputC });

const [tensorA, tensorB, tensorC] = await Promise.all([
  context.createTensor({ ...descriptor, writable: true }),
  context.createTensor({ ...descriptor, writable: true }),
  context.createTensor({ ...descriptor, readable: true }),
]);

context.writeTensor(tensorA, new Float32Array([1, 1, 1, 1]));
context.writeTensor(tensorB, new Float32Array([0.8, 0.8, 0.8, 0.8]));
context.dispatch(graph, { A: tensorA, B: tensorB }, { C: tensorC });

const result = new Float32Array(await context.readTensor(tensorC));
console.log(result);
```

## Decision shortcut

Use direct WebNN when the feature owns the graph.

Use an adapter layer when the feature already has a stable browser inference runtime and only needs WebNN acceleration wired into that existing contract.