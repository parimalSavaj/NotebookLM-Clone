export type SourceRow = {
  id: string;
  notebook_id: string;
  user_id: string;
  title: string;
  type: string;
  status: string;
  metadata: Record<string, unknown>;
  file_size: number | null;
  chunk_count: number;
  char_count: number;
  error_message: string | null;
  processed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
