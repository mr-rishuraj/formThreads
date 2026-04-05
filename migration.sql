-- ============================================================
-- SFP Round 2 — Full Migration
-- Run in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. teams: add access_key ──────────────────────────────────
ALTER TABLE teams ADD COLUMN IF NOT EXISTS access_key text;
UPDATE teams SET access_key = upper(substring(md5(id::text || name), 1, 8)) WHERE access_key IS NULL;
ALTER TABLE teams ALTER COLUMN access_key SET NOT NULL;

-- ── 2. questions: make form_id nullable (standalone support) ──
ALTER TABLE questions ALTER COLUMN form_id DROP NOT NULL;

-- ── 3. team_questions: per-team question with status ─────────
CREATE TABLE IF NOT EXISTS team_questions (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id      uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  question_id  uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('draft', 'pending', 'completed')),
  assigned_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_tq_team    ON team_questions(team_id);
CREATE INDEX IF NOT EXISTS idx_tq_question ON team_questions(question_id);

-- ── 4. messages: add team_id + sender columns, make sender_id optional ──
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sender  text CHECK (sender IN ('admin', 'participant'));

CREATE INDEX IF NOT EXISTS idx_msg_team_question ON messages(team_id, question_id);

-- ── 5. RLS ────────────────────────────────────────────────────

-- teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teams_select_all"   ON teams;
DROP POLICY IF EXISTS "teams_admin_mutate" ON teams;
CREATE POLICY "teams_select_all"   ON teams FOR SELECT USING (true);
CREATE POLICY "teams_admin_mutate" ON teams FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "questions_select_all"   ON questions;
DROP POLICY IF EXISTS "questions_admin_mutate" ON questions;
CREATE POLICY "questions_select_all"   ON questions FOR SELECT USING (true);
CREATE POLICY "questions_admin_mutate" ON questions FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- team_questions
ALTER TABLE team_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tq_select_all"   ON team_questions;
DROP POLICY IF EXISTS "tq_admin_mutate" ON team_questions;
CREATE POLICY "tq_select_all"   ON team_questions FOR SELECT USING (true);
CREATE POLICY "tq_admin_mutate" ON team_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "msg_select_all" ON messages;
DROP POLICY IF EXISTS "msg_insert_all" ON messages;
DROP POLICY IF EXISTS "msg_admin_update" ON messages;
CREATE POLICY "msg_select_all"   ON messages FOR SELECT USING (true);
CREATE POLICY "msg_insert_all"   ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "msg_admin_update" ON messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ── 6. Realtime publication ───────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE team_questions;
