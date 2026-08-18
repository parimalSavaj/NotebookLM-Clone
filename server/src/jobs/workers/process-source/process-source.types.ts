import { SourceType } from "../../../domain/enums/source-type.enum.ts";

export const PROCESS_SOURCE_JOB = "source/process" as const;

export type ProcessSourcePayload = {
  sourceId: string;
  notebookId: string;
  type: SourceType;
  content?: string;
  url?: string;
  fileBase64?: string;
  originalFilename?: string;
};

export type ProcessSourceResult = {
  sourceId: string;
  chunkCount: number;
  charCount: number;
};
