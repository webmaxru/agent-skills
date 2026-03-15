export type WritingAvailability = "unavailable" | "downloadable" | "downloading" | "available";
export type WritingApiKind = "summarizer" | "writer" | "rewriter";

export type DownloadProgress = {
  loaded: number;
  total: number | null;
  fraction: number | null;
};

export type SharedCreateOptions = {
  sharedContext?: string;
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  outputLanguage?: string;
  signal?: AbortSignal;
  onDownloadProgress?: (progress: DownloadProgress) => void;
};

export type SummarizerCreateOptions = SharedCreateOptions & {
  type?: "tldr" | "teaser" | "key-points" | "headline";
  format?: "plain-text" | "markdown";
  length?: "short" | "medium" | "long";
  preference?: "auto" | "speed" | "capability";
};

export type WriterCreateOptions = SharedCreateOptions & {
  tone?: "formal" | "neutral" | "casual";
  format?: "plain-text" | "markdown";
  length?: "short" | "medium" | "long";
};

export type RewriterCreateOptions = SharedCreateOptions & {
  tone?: "as-is" | "more-formal" | "more-casual";
  format?: "as-is" | "plain-text" | "markdown";
  length?: "as-is" | "shorter" | "longer";
};

export interface SummarizerSession {
  summarize(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  summarizeStreaming(input: string, options?: { context?: string; signal?: AbortSignal }): ReadableStream<string>;
  measureInputUsage(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<number>;
  destroy(): void;
  readonly inputQuota: number;
}

export interface WriterSession {
  write(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  writeStreaming(input: string, options?: { context?: string; signal?: AbortSignal }): ReadableStream<string>;
  measureInputUsage(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<number>;
  destroy(): void;
  readonly inputQuota: number;
}

export interface RewriterSession {
  rewrite(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  rewriteStreaming(input: string, options?: { context?: string; signal?: AbortSignal }): ReadableStream<string>;
  measureInputUsage(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<number>;
  destroy(): void;
  readonly inputQuota: number;
}

declare const Summarizer: {
  availability(options?: Omit<SummarizerCreateOptions, "signal" | "onDownloadProgress" | "sharedContext"> & Pick<SharedCreateOptions, "expectedInputLanguages" | "expectedContextLanguages" | "outputLanguage">): Promise<WritingAvailability>;
  create(options?: Omit<SummarizerCreateOptions, "onDownloadProgress"> & {
    monitor?: (monitor: EventTarget) => void;
  }): Promise<SummarizerSession>;
};

declare const Writer: {
  availability(options?: Omit<WriterCreateOptions, "signal" | "onDownloadProgress" | "sharedContext"> & Pick<SharedCreateOptions, "expectedInputLanguages" | "expectedContextLanguages" | "outputLanguage">): Promise<WritingAvailability>;
  create(options?: Omit<WriterCreateOptions, "onDownloadProgress"> & {
    monitor?: (monitor: EventTarget) => void;
  }): Promise<WriterSession>;
};

declare const Rewriter: {
  availability(options?: Omit<RewriterCreateOptions, "signal" | "onDownloadProgress" | "sharedContext"> & Pick<SharedCreateOptions, "expectedInputLanguages" | "expectedContextLanguages" | "outputLanguage">): Promise<WritingAvailability>;
  create(options?: Omit<RewriterCreateOptions, "onDownloadProgress"> & {
    monitor?: (monitor: EventTarget) => void;
  }): Promise<RewriterSession>;
};

function attachMonitor(
  onDownloadProgress: SharedCreateOptions["onDownloadProgress"],
): ((monitor: EventTarget) => void) | undefined {
  if (!onDownloadProgress) {
    return undefined;
  }

  return monitor => {
    monitor.addEventListener("downloadprogress", event => {
      const progressEvent = event as Event & { loaded: number; total?: number };
      const total = typeof progressEvent.total === "number" ? progressEvent.total : null;
      const loaded = typeof progressEvent.loaded === "number" ? progressEvent.loaded : 0;

      onDownloadProgress({
        loaded,
        total,
        fraction: total && total > 0 ? loaded / total : loaded <= 1 ? loaded : null,
      });
    });
  };
}

export function isWritingAssistanceSupported(kind: WritingApiKind): boolean {
  if (typeof self === "undefined") {
    return false;
  }

  switch (kind) {
    case "summarizer":
      return "Summarizer" in self;
    case "writer":
      return "Writer" in self;
    case "rewriter":
      return "Rewriter" in self;
  }
}

export async function getSummarizerAvailability(
  options: Omit<SummarizerCreateOptions, "signal" | "onDownloadProgress" | "sharedContext"> = {},
): Promise<WritingAvailability> {
  return Summarizer.availability(options);
}

export async function getWriterAvailability(
  options: Omit<WriterCreateOptions, "signal" | "onDownloadProgress" | "sharedContext"> = {},
): Promise<WritingAvailability> {
  return Writer.availability(options);
}

export async function getRewriterAvailability(
  options: Omit<RewriterCreateOptions, "signal" | "onDownloadProgress" | "sharedContext"> = {},
): Promise<WritingAvailability> {
  return Rewriter.availability(options);
}

export async function createSummarizerSession(
  options: SummarizerCreateOptions = {},
): Promise<SummarizerSession | null> {
  const availability = await getSummarizerAvailability(options);
  if (availability === "unavailable") {
    return null;
  }

  return Summarizer.create({
    ...options,
    monitor: attachMonitor(options.onDownloadProgress),
  });
}

export async function createWriterSession(
  options: WriterCreateOptions = {},
): Promise<WriterSession | null> {
  const availability = await getWriterAvailability(options);
  if (availability === "unavailable") {
    return null;
  }

  return Writer.create({
    ...options,
    monitor: attachMonitor(options.onDownloadProgress),
  });
}

export async function createRewriterSession(
  options: RewriterCreateOptions = {},
): Promise<RewriterSession | null> {
  const availability = await getRewriterAvailability(options);
  if (availability === "unavailable") {
    return null;
  }

  return Rewriter.create({
    ...options,
    monitor: attachMonitor(options.onDownloadProgress),
  });
}

export async function readStream(stream: ReadableStream<string>): Promise<string> {
  let output = "";
  for await (const chunk of stream) {
    output += chunk;
  }
  return output;
}