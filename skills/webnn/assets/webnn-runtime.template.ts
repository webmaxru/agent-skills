export type WebNNPowerPreference = "default" | "high-performance" | "low-power";

export type WebNNAvailability = {
  supported: boolean;
  reason: string | null;
};

export type WebNNContextOptions = {
  powerPreference?: WebNNPowerPreference;
  accelerated?: boolean;
};

export type PreparedWebNNRuntime =
  | {
      mode: "webnn";
      context: MLContext;
      options: Required<WebNNContextOptions>;
    }
  | {
      mode: "fallback";
      reason: string;
      options: Required<WebNNContextOptions>;
    };

type NavigatorWithWebNN = Navigator & {
  ml?: {
    createContext(options?: WebNNContextOptions): Promise<MLContext>;
  };
};

type WebNNRuntimeScope = typeof globalThis & {
  navigator?: NavigatorWithWebNN;
  isSecureContext?: boolean;
};

function getNavigatorWithWebNN(): NavigatorWithWebNN {
  return navigator as NavigatorWithWebNN;
}

function getWebNNRuntimeScope(): WebNNRuntimeScope {
  return globalThis as WebNNRuntimeScope;
}

export function detectWebNN(): WebNNAvailability {
  const runtimeScope = getWebNNRuntimeScope();
  if (!runtimeScope.navigator) {
    return {
      supported: false,
      reason: "WebNN requires a browser window or dedicated worker integration boundary.",
    };
  }

  if (!runtimeScope.isSecureContext) {
    return {
      supported: false,
      reason: "WebNN requires HTTPS or localhost.",
    };
  }

  const browserNavigator = runtimeScope.navigator;
  if (!browserNavigator.ml) {
    return {
      supported: false,
      reason: "navigator.ml is unavailable in this browser.",
    };
  }

  return {
    supported: true,
    reason: null,
  };
}

export async function prepareWebNNRuntime(
  options: WebNNContextOptions = {},
): Promise<PreparedWebNNRuntime> {
  const normalizedOptions: Required<WebNNContextOptions> = {
    powerPreference: options.powerPreference ?? "default",
    accelerated: options.accelerated ?? true,
  };

  const support = detectWebNN();
  if (!support.supported) {
    return {
      mode: "fallback",
      reason: support.reason ?? "WebNN is unavailable.",
      options: normalizedOptions,
    };
  }

  try {
    const context = await getWebNNRuntimeScope().navigator!.ml!.createContext(normalizedOptions);
    return {
      mode: "webnn",
      context,
      options: normalizedOptions,
    };
  } catch (error) {
    return {
      mode: "fallback",
      reason: error instanceof Error ? error.message : String(error),
      options: normalizedOptions,
    };
  }
}

export function watchWebNNContextLoss(
  context: MLContext,
  onLost: (message: string | null) => void,
): void {
  void context.lost.then((info: { message?: string } | undefined) => {
    onLost(info?.message ?? null);
  });
}

export async function createWritableTensor(
  context: MLContext,
  descriptor: MLOperandDescriptor,
): Promise<MLTensor> {
  return context.createTensor({
    ...descriptor,
    writable: true,
  });
}

export async function createReadableTensor(
  context: MLContext,
  descriptor: MLOperandDescriptor,
): Promise<MLTensor> {
  return context.createTensor({
    ...descriptor,
    readable: true,
  });
}

export function disposeWebNNResources(resources: {
  tensors?: Array<MLTensor | null | undefined>;
  graph?: MLGraph | null;
  context?: MLContext | null;
}): void {
  for (const tensor of resources.tensors ?? []) {
    tensor?.destroy();
  }

  resources.graph?.destroy();
  resources.context?.destroy();
}