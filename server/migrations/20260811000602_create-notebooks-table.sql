-- Migration: create-notebooks-table
-- Created at: 2026-08-11T00:06:02.000Z

CREATE TABLE IF NOT EXISTS notebooks (
  id                    UUID PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  title                 VARCHAR(255) NOT NULL,
  description           TEXT NULL,
  emoji                 VARCHAR(10) NULL,
  ai_provider           VARCHAR(50) NOT NULL DEFAULT 'openai'
                          CONSTRAINT notebooks_ai_provider_check
                          CHECK (ai_provider IN ('openai', 'google', 'anthropic', 'groq')),
  ai_model              VARCHAR(100) NOT NULL DEFAULT 'gpt-4o-mini',
  active_source_count   INTEGER NOT NULL DEFAULT 0,
  last_opened_at        TIMESTAMPTZ NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ NULL
);

-- Foreign key index
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id
  ON notebooks (user_id);

-- Partial unique index: same user cannot have two active notebooks with the same title
CREATE UNIQUE INDEX IF NOT EXISTS idx_notebooks_user_id_title_active
  ON notebooks (user_id, title)
  WHERE deleted_at IS NULL;
