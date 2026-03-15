export type LanguageDetectorAvailability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

export type LanguageDetectionResult = {
  detectedLanguage: string;
  confidence: number;
};

export type DownloadProgress = {
  loaded: number;
  total: number | null;
  fraction: number | null;
};

export type LanguageDetectorCreateOptions = {
  expectedInputLanguages?: string[];
  signal?: AbortSignal;
  onDownloadProgress?: (progress: DownloadProgress) => void;
};

export type LanguageDetectorDetectOptions = {
  signal?: AbortSignal;
};

export interface LanguageDetectorSession {
  detect(input: string, options?: LanguageDetectorDetectOptions): Promise<LanguageDetectionResult[]>;
  measureInputUsage(input: string, options?: LanguageDetectorDetectOptions): Promise<number>;
  destroy(): void;
  readonly expectedInputLanguages: readonly string[] | null;
  readonly inputQuota: number;
}

declare const LanguageDetector: {
  availability(options?: Pick<LanguageDetectorCreateOptions, "expectedInputLanguages">): Promise<LanguageDetectorAvailability>;
  create(
    options?: Omit<LanguageDetectorCreateOptions, "onDownloadProgress"> & {
      monitor?: (monitor: EventTarget) => void;
    },
  ): Promise<LanguageDetectorSession>;
};

function attachMonitor(
  onDownloadProgress: LanguageDetectorCreateOptions["onDownloadProgress"],
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

export function isLanguageDetectorSupported(): boolean {
  if (typeof self === "undefined") {
    return false;
  }

  return Boolean(globalThis.isSecureContext && "LanguageDetector" in self);
}

export async function getLanguageDetectorAvailability(
  options: Pick<LanguageDetectorCreateOptions, "expectedInputLanguages"> = {},
): Promise<LanguageDetectorAvailability> {
  if (!isLanguageDetectorSupported()) {
    return "unavailable";
  }

  return LanguageDetector.availability(options);
}

export async function createLanguageDetectorSession(
  options: LanguageDetectorCreateOptions = {},
): Promise<LanguageDetectorSession | null> {
  const availability = await getLanguageDetectorAvailability(options);
  if (availability === "unavailable") {
    return null;
  }

  return LanguageDetector.create({
    ...options,
    monitor: attachMonitor(options.onDownloadProgress),
  });
}

export function pickPrimaryLanguage(
  results: LanguageDetectionResult[],
  minimumConfidence = 0.8,
): LanguageDetectionResult | null {
  const best = results[0];
  if (!best) {
    return null;
  }

  if (best.detectedLanguage === "und" || best.confidence < minimumConfidence) {
    return null;
  }

  return best;
}