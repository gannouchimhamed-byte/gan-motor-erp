-- ============================================================
-- AutoPro ERP — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Main ERP data store (single-row JSON approach for v1)
CREATE TABLE IF NOT EXISTS erp_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial empty row
INSERT INTO erp_data (id, state) VALUES ('main', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for v1 (we'll add auth in v2)
ALTER TABLE erp_data DISABLE ROW LEVEL SECURITY;

-- Grant access to anon role
GRANT ALL ON erp_data TO anon;
GRANT ALL ON erp_data TO authenticated;
