-- Migration: create-chat-tables
-- Created at: 2026-08-18T00:00:00.000Z

-- Table 1: conversations
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY,
  notebook_id     UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  title           VARCHAR(255) NULL,
  summary         TEXT NULL,
  message_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_notebook_id
  ON conversations (notebook_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id
  ON conversations (user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON conversations (notebook_id, updated_at DESC);

-- Table 2: messages
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  notebook_id     UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL
                    CONSTRAINT messages_role_check
                    CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  sources_used    JSONB NULL,
  token_count     INTEGER NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON messages (conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_notebook_id
  ON messages (notebook_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON messages (conversation_id, created_at);
