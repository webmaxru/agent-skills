export type ProofreaderAvailability = "unavailable" | "downloadable" | "downloading" | "available";
export type CorrectionType = "spelling" | "punctuation" | "capitalization" | "grammar";

export type DownloadProgress = {
  loaded: number;
  total: number | null;
  fraction: number | null;
};

export type ProofreaderCreateOptions = {
  expectedInputLanguages?: string[];
  includeCorrectionTypes?: boolean;
  includeCorrectionExplanations?: boolean;
  correctionExplanationLanguage?: string;
  signal?: AbortSignal;
  onDownloadProgress?: (progress: DownloadProgress) => void;
};

export type ProofreadOptions = {
  signal?: AbortSignal;
};

export type ProofreadCorrection = {
  startIndex: number;
  endIndex: number;
  correction: string;
  types?: CorrectionType[];
  explanation?: string;
};

export type ProofreadResult = {
  correctedInput: string;
  corrections: ProofreadCorrection[];
};

export interface ProofreaderSession {
  proofread(input: string, options?: ProofreadOptions): Promise<ProofreadResult>;
  measureInputUsage(input: string, options?: ProofreadOptions): Promise<number>;
  destroy(): void;
  readonly includeCorrectionTypes: boolean;
  readonly includeCorrectionExplanations: boolean;
  readonly expectedInputLanguages: readonly string[] | null;
  readonly correctionExplanationLanguage: string | null;
}

declare const Proofreader: {
  availability(options?: Omit<ProofreaderCreateOptions, "signal" | "onDownloadProgress">): Promise<ProofreaderAvailability>;
  create(options?: Omit<ProofreaderCreateOptions, "onDownloadProgress"> & {
    monitor?: (monitor: EventTarget) => void;
  }): Promise<ProofreaderSession>;
};

function attachMonitor(
  onDownloadProgress: ProofreaderCreateOptions["onDownloadProgress"],
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

export function isProofreaderSupported(): boolean {
  return typeof self !== "undefined" && "Proofreader" in self;
}

export async function getProofreaderAvailability(
  options: Omit<ProofreaderCreateOptions, "signal" | "onDownloadProgress"> = {},
): Promise<ProofreaderAvailability> {
  return Proofreader.availability(options);
}

export async function createProofreaderSession(
  options: ProofreaderCreateOptions = {},
): Promise<ProofreaderSession | null> {
  const availability = await getProofreaderAvailability(options);
  if (availability === "unavailable") {
    return null;
  }

  return Proofreader.create({
    ...options,
    monitor: attachMonitor(options.onDownloadProgress),
  });
}