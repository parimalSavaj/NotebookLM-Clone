export type NotebookRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  ai_provider: string;
  ai_model: string;
  active_source_count: number;
  last_opened_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
