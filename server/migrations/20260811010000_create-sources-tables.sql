-- Migration: create-sources-tables
-- Created at: 2026-08-11T01:00:00.000Z

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Table 1: sources — The Catalog
CREATE TABLE IF NOT EXISTS sources (
  id                UUID PRIMARY KEY,
  notebook_id       UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  type              VARCHAR(20) NOT NULL
                      CONSTRAINT sources_type_check
                      CHECK (type IN ('pdf', 'text', 'markdown', 'url', 'youtube')),
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CONSTRAINT sources_status_check
                      CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  metadata          JSONB NOT NULL DEFAULT '{}',
  file_size         INTEGER NULL,
  chunk_count       INTEGER NOT NULL DEFAULT 0,
  char_count        INTEGER NOT NULL DEFAULT 0,
  error_message     TEXT NULL,
  processed_at      TIMESTAMPTZ NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ NULL
);

-- Indexes for sources
CREATE INDEX IF NOT EXISTS idx_sources_notebook_id
  ON sources (notebook_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sources_user_id
  ON sources (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sources_status
  ON sources (status)
  WHERE deleted_at IS NULL;

-- Table 2: source_contents — The Full Text
CREATE TABLE IF NOT EXISTS source_contents (
  id                UUID PRIMARY KEY,
  source_id         UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for source_contents lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_source_contents_source_id
  ON source_contents (source_id);

-- Table 3: source_chunks — The Search Index
CREATE TABLE IF NOT EXISTS source_chunks (
  id                UUID PRIMARY KEY,
  source_id         UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  notebook_id       UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  chunk_index       INTEGER NOT NULL,
  token_count       INTEGER NOT NULL DEFAULT 0,
  embedding         vector(1536) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for source_chunks
CREATE INDEX IF NOT EXISTS idx_source_chunks_source_id
  ON source_chunks (source_id);

CREATE INDEX IF NOT EXISTS idx_source_chunks_notebook_id
  ON source_chunks (notebook_id);

-- HNSW index for vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_source_chunks_embedding
  ON source_chunks
  USING hnsw (embedding vector_cosine_ops);
