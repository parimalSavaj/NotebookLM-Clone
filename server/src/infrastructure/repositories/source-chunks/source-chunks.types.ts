export type SourceChunkRow = {
  id: string;
  source_id: string;
  notebook_id: string;
  content: string;
  chunk_index: number;
  token_count: number;
  embedding: string;
  created_at: Date;
};
