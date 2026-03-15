export type TranslatorAvailability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

export type DownloadProgress = {
  loaded: number;
  total: number | null;
  fraction: number | null;
};

export type TranslatorCreateOptions = {
  sourceLanguage: string;
  targetLanguage: string;
  signal?: AbortSignal;
  onDownloadProgress?: (progress: DownloadProgress) => void;
};

export type TranslatorRunOptions = {
  signal?: AbortSignal;
};

export interface TranslatorSession {
  translate(input: string, options?: TranslatorRunOptions): Promise<string>;
  translateStreaming(input: string, options?: TranslatorRunOptions): ReadableStream<string>;
  measureInputUsage(input: string, options?: TranslatorRunOptions): Promise<number>;
  destroy(): void;
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
  readonly inputQuota: number;
}

declare const Translator: {
  availability(
    options: Pick<TranslatorCreateOptions, "sourceLanguage" | "targetLanguage">,
  ): Promise<TranslatorAvailability>;
  create(
    options: Omit<TranslatorCreateOptions, "onDownloadProgress"> & {
      monitor?: (monitor: EventTarget) => void;
    },
  ): Promise<TranslatorSession>;
};

function attachMonitor(
  onDownloadProgress: TranslatorCreateOptions["onDownloadProgress"],
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

export function isTranslatorSupported(): boolean {
  if (typeof self === "undefined") {
    return false;
  }

  return Boolean(globalThis.isSecureContext && "Translator" in self);
}

export async function getTranslatorAvailability(
  options: Pick<TranslatorCreateOptions, "sourceLanguage" | "targetLanguage">,
): Promise<TranslatorAvailability> {
  if (!isTranslatorSupported()) {
    return "unavailable";
  }

  return Translator.availability(options);
}

export async function createTranslatorSession(
  options: TranslatorCreateOptions,
): Promise<TranslatorSession | null> {
  const availability = await getTranslatorAvailability(options);
  if (availability === "unavailable") {
    return null;
  }

  return Translator.create({
    ...options,
    monitor: attachMonitor(options.onDownloadProgress),
  });
}

export async function translateText(
  session: TranslatorSession,
  input: string,
  options: TranslatorRunOptions = {},
): Promise<string> {
  return session.translate(input, options);
}

export async function collectTranslationStream(
  stream: ReadableStream<string> & AsyncIterable<string>,
): Promise<string> {
  let output = "";

  for await (const chunk of stream) {
    output += chunk;
  }

  return output;
}