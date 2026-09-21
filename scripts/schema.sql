-- ============================================================
-- Borderless Maastricht – Supabase Schema
-- Einmalig im Supabase SQL Editor ausführen
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS source_registry (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  url               text        UNIQUE NOT NULL,
  source_name       text        NOT NULL,
  country           text        NOT NULL,
  category          text        NOT NULL,
  update_frequency  text        NOT NULL,
  last_crawled_at   timestamptz,
  last_hash         text,
  is_active         boolean     DEFAULT true
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id        uuid        REFERENCES source_registry(id) ON DELETE CASCADE,
  chunk_index      int         NOT NULL,
  content          text        NOT NULL,
  embedding        vector(1536),
  url              text        NOT NULL,
  source_name      text        NOT NULL,
  country          text        NOT NULL,
  category         text        NOT NULL,
  last_crawled_at  timestamptz NOT NULL,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding  vector(1536),
  match_count      int     DEFAULT 5,
  filter_country   text    DEFAULT NULL
)
RETURNS TABLE (
  id              uuid,
  content         text,
  url             text,
  source_name     text,
  country         text,
  category        text,
  last_crawled_at timestamptz,
  similarity      float
)
LANGUAGE sql STABLE AS $$
  SELECT
    id, content, url, source_name, country, category, last_crawled_at,
    1 - (embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE filter_country IS NULL OR country = filter_country
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
