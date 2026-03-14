export type PromptRole = "system" | "user" | "assistant";
export type PromptContentType = "text" | "image" | "audio";

export type PromptExpected = {
  type: PromptContentType;
  languages?: string[];
};

export type PromptTool = {
  name: string;
  description: string;
  inputSchema: object;
  execute: (...arguments_: any[]) => Promise<string>;
};

export type PromptTextContent = { type: "text"; value: string };
export type PromptImageContent = { type: "image"; value: ImageBitmapSource | BufferSource };
export type PromptAudioContent = { type: "audio"; value: AudioBuffer | BufferSource | Blob };
export type PromptMessageContent = PromptTextContent | PromptImageContent | PromptAudioContent;

export type PromptMessage = {
  role: PromptRole;
  content: string | PromptMessageContent[];
  prefix?: boolean;
};

export type PromptInput = string | PromptMessage[];

export type PromptMonitorEvent = Event & { loaded: number };
export type PromptMonitor = EventTarget;

export interface PromptLanguageModel {
  prompt(
    input: PromptInput,
    options?: {
      signal?: AbortSignal;
      responseConstraint?: object;
      omitResponseConstraintInput?: boolean;
    },
  ): Promise<string>;
  promptStreaming(
    input: PromptInput,
    options?: {
      signal?: AbortSignal;
      responseConstraint?: object;
      omitResponseConstraintInput?: boolean;
    },
  ): ReadableStream<string>;
  append(input: PromptInput, options?: { signal?: AbortSignal }): Promise<void>;
  measureContextUsage?(
    input: PromptInput,
    options?: {
      signal?: AbortSignal;
      responseConstraint?: object;
      omitResponseConstraintInput?: boolean;
    },
  ): Promise<number>;
  measureInputUsage?(
    input: PromptInput,
    options?: {
      signal?: AbortSignal;
      responseConstraint?: object;
      omitResponseConstraintInput?: boolean;
    },
  ): Promise<number>;
  clone(options?: { signal?: AbortSignal }): Promise<PromptLanguageModel>;
  destroy(): void;
  readonly contextUsage?: number;
  readonly inputUsage?: number;
  readonly contextWindowMeasure?: number;
  readonly contextWindow?: number;
  readonly inputQuota?: number;
  oncontextoverflow?: ((event: Event) => void) | null;
  contextOverflow?: ((event: Event) => void) | null;
  onquotaoverflow?: ((event: Event) => void) | null;
}

export interface PromptLanguageModelStatic {
  availability(options?: {
    expectedInputs?: PromptExpected[];
    expectedOutputs?: PromptExpected[];
    tools?: PromptTool[];
  }): Promise<string>;
  create(options?: {
    expectedInputs?: PromptExpected[];
    expectedOutputs?: PromptExpected[];
    initialPrompts?: PromptMessage[];
    tools?: PromptTool[];
    signal?: AbortSignal;
    monitor?: (monitor: PromptMonitor) => void;
  }): Promise<PromptLanguageModel>;
}

declare const LanguageModel: PromptLanguageModelStatic;

export type PromptAvailability = Awaited<ReturnType<typeof LanguageModel.availability>>;
export type PromptSession = Awaited<ReturnType<typeof LanguageModel.create>>;

export type BrowserPromptOptions = {
  expectedInputs?: PromptExpected[];
  expectedOutputs?: PromptExpected[];
  initialPrompts?: PromptMessage[];
  tools?: PromptTool[];
  signal?: AbortSignal;
  onDownloadProgress?: (fraction: number) => void;
};

export function getPromptContextUsage(session: PromptSession): number | null {
  if (typeof session.contextUsage === "number") {
    return session.contextUsage;
  }

  if (typeof session.inputUsage === "number") {
    return session.inputUsage;
  }

  return null;
}

export function getPromptContextWindow(session: PromptSession): number | null {
  if (typeof session.contextWindowMeasure === "number") {
    return session.contextWindowMeasure;
  }

  if (typeof session.contextWindow === "number") {
    return session.contextWindow;
  }

  if (typeof session.inputQuota === "number") {
    return session.inputQuota;
  }

  return null;
}

export function setPromptContextOverflowHandler(
  session: PromptSession,
  handler: ((event: Event) => void) | null,
): void {
  if ("oncontextoverflow" in session) {
    session.oncontextoverflow = handler;
    return;
  }

  if ("contextOverflow" in session) {
    session.contextOverflow = handler;
    return;
  }

  if ("onquotaoverflow" in session) {
    session.onquotaoverflow = handler;
  }
}

function isPromptMessageArray(input: PromptInput): input is PromptMessage[] {
  return Array.isArray(input);
}

function assertValidPromptContentArray(content: PromptMessageContent[], role: PromptRole): void {
  if (content.length === 0) {
    throw new SyntaxError("Prompt message content arrays must not be empty.");
  }

  for (const item of content) {
    if (item.type === "text" && typeof item.value !== "string") {
      throw new TypeError("Text prompt content must use string values.");
    }

    if (role === "assistant" && item.type !== "text") {
      throw new DOMException("Assistant messages must contain only text content.", "NotSupportedError");
    }
  }
}

function assertValidPromptMessages(messages: PromptMessage[], options: { allowSystemRole: boolean }): void {
  if (messages.length === 0) {
    throw new SyntaxError("Prompt message arrays must not be empty.");
  }

  let seenNonSystemRole = false;

  messages.forEach((message, index) => {
    if (message.role === "system") {
      if (!options.allowSystemRole) {
        throw new DOMException("System messages are only valid in initialPrompts.", "NotSupportedError");
      }

      if (seenNonSystemRole) {
        throw new SyntaxError("System messages must appear before non-system messages.");
      }
    } else {
      seenNonSystemRole = true;
    }

    if (message.prefix) {
      const isFinalMessage = index === messages.length - 1;
      if (!isFinalMessage || message.role !== "assistant") {
        throw new SyntaxError("prefix: true is only valid on the final assistant message.");
      }
    }

    if (typeof message.content !== "string") {
      assertValidPromptContentArray(message.content, message.role);
    }
  });
}

function assertValidPromptInput(input: PromptInput, options: { allowSystemRole: boolean }): void {
  if (!isPromptMessageArray(input)) {
    return;
  }

  assertValidPromptMessages(input, options);
}

export async function getPromptAvailability(
  options: Pick<BrowserPromptOptions, "expectedInputs" | "expectedOutputs" | "tools"> = {},
): Promise<PromptAvailability> {
  return LanguageModel.availability({
    expectedInputs: options.expectedInputs,
    expectedOutputs: options.expectedOutputs,
    tools: options.tools,
  });
}

export async function createPromptSession(
  options: BrowserPromptOptions = {},
): Promise<PromptSession | null> {
  if (options.initialPrompts) {
    assertValidPromptMessages(options.initialPrompts, { allowSystemRole: true });
  }

  const availability = await getPromptAvailability({
    expectedInputs: options.expectedInputs,
    expectedOutputs: options.expectedOutputs,
    tools: options.tools,
  });

  if (availability === "unavailable") {
    return null;
  }

  return LanguageModel.create({
    expectedInputs: options.expectedInputs,
    expectedOutputs: options.expectedOutputs,
    initialPrompts: options.initialPrompts,
    tools: options.tools,
    signal: options.signal,
    monitor(monitor: PromptMonitor) {
      if (!options.onDownloadProgress) {
        return;
      }

      monitor.addEventListener("downloadprogress", (event: Event) => {
        options.onDownloadProgress?.((event as PromptMonitorEvent).loaded);
      });
    },
  });
}

export async function promptText(
  session: PromptSession,
  input: PromptInput,
  options: {
    signal?: AbortSignal;
    responseConstraint?: object;
    omitResponseConstraintInput?: boolean;
  } = {},
): Promise<string> {
  assertValidPromptInput(input, { allowSystemRole: false });

  return session.prompt(input, {
    signal: options.signal,
    responseConstraint: options.responseConstraint,
    omitResponseConstraintInput: options.omitResponseConstraintInput,
  });
}

export async function* promptTextStream(
  session: PromptSession,
  input: PromptInput,
  options: { signal?: AbortSignal; responseConstraint?: object; omitResponseConstraintInput?: boolean } = {},
): AsyncGenerator<string> {
  assertValidPromptInput(input, { allowSystemRole: false });

  const stream = session.promptStreaming(input, {
    signal: options.signal,
    responseConstraint: options.responseConstraint,
    omitResponseConstraintInput: options.omitResponseConstraintInput,
  });

  for await (const chunk of stream) {
    yield chunk;
  }
}

export async function appendPromptMessages(
  session: PromptSession,
  input: PromptInput,
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  assertValidPromptInput(input, { allowSystemRole: false });

  await session.append(input, {
    signal: options.signal,
  });
}

export async function measurePromptContextUsage(
  session: PromptSession,
  input: PromptInput,
  options: {
    signal?: AbortSignal;
    responseConstraint?: object;
    omitResponseConstraintInput?: boolean;
  } = {},
): Promise<number> {
  assertValidPromptInput(input, { allowSystemRole: false });

  if (typeof session.measureContextUsage === "function") {
    return session.measureContextUsage(input, {
      signal: options.signal,
      responseConstraint: options.responseConstraint,
      omitResponseConstraintInput: options.omitResponseConstraintInput,
    });
  }

  if (typeof session.measureInputUsage === "function") {
    return session.measureInputUsage(input, {
      signal: options.signal,
      responseConstraint: options.responseConstraint,
      omitResponseConstraintInput: options.omitResponseConstraintInput,
    });
  }

  throw new DOMException("No compatible context measurement API is available.", "NotSupportedError");
}

export async function clonePromptSession(
  session: PromptSession,
  options: { signal?: AbortSignal } = {},
): Promise<PromptSession> {
  return session.clone({
    signal: options.signal,
  });
}

export function destroyPromptSession(session: PromptSession | null): void {
  session?.destroy();
}