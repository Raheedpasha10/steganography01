-- Supabase Database Setup for SteganoText Pro
-- Run this in your Supabase SQL Editor

-- Create history table
CREATE TABLE IF NOT EXISTS history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('encode', 'decode')),
  technique TEXT NOT NULL,
  text_preview TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own history
CREATE POLICY "Users can view own history" ON history
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = 'dev-user');

-- Create policy to allow users to insert their own history
CREATE POLICY "Users can insert own history" ON history
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = 'dev-user');

-- Create policy to allow users to delete their own history
CREATE POLICY "Users can delete own history" ON history
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = 'dev-user');

-- Grant permissions
GRANT ALL ON history TO authenticated;
GRANT ALL ON history TO anon;

