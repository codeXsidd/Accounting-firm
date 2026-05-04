-- ============================================================
-- AccountFlow Pro — Supabase Setup SQL
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. clients table
CREATE TABLE IF NOT EXISTS clients (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  notion_page_id TEXT,
  status        TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started','In Progress','Completed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. onboarding_data table
CREATE TABLE IF NOT EXISTS onboarding_data (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id      UUID REFERENCES clients(id) ON DELETE CASCADE,
  client_type    TEXT,
  basic_info     JSONB DEFAULT '{}',
  business_info  JSONB DEFAULT '{}',
  tax_info       JSONB DEFAULT '{}',
  financial_info JSONB DEFAULT '{}',
  signature      TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. documents table
CREATE TABLE IF NOT EXISTS documents (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  file_type   TEXT NOT NULL,
  file_name   TEXT,
  file_url    TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_notion ON clients(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_client ON onboarding_data(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);

-- 5. Row Level Security (RLS) — disable for demo
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STORAGE BUCKET — run separately or via Supabase Dashboard:
-- Dashboard > Storage > New Bucket
-- Name: onboarding-docs
-- Public: false (private)
-- ============================================================
