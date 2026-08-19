export type ConversationRow = {
  id: string;
  notebook_id: string;
  user_id: string;
  title: string | null;
  summary: string | null;
  message_count: number;
  created_at: Date;
  updated_at: Date;
};
