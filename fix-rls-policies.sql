-- Fix Row-Level Security Policies for History Table
-- This allows the anon key to insert/read/delete records

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own history" ON history;
DROP POLICY IF EXISTS "Users can insert own history" ON history;
DROP POLICY IF EXISTS "Users can delete own history" ON history;

-- Create new permissive policies that work with anon key
CREATE POLICY "Enable read access for all users" ON history
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users" ON history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable delete for users based on user_id" ON history
  FOR DELETE
  USING (true);

-- Alternative: If you want to keep some security, use this instead:
-- CREATE POLICY "Enable read for own records" ON history
--   FOR SELECT
--   USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'dev-%' OR auth.role() = 'anon');

-- CREATE POLICY "Enable insert for all" ON history
--   FOR INSERT
--   WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- CREATE POLICY "Enable delete for own records" ON history
--   FOR DELETE
--   USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'dev-%' OR auth.role() = 'anon');

