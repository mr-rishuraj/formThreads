-- ============================================================
-- SFP Round 2 — Test Seed
-- Run AFTER migration.sql
-- ============================================================

DO $$
DECLARE
  admin_id  uuid;
  team_id   uuid;
  q1 uuid := uuid_generate_v4();
  q2 uuid := uuid_generate_v4();
  q3 uuid := uuid_generate_v4();
  q4 uuid := uuid_generate_v4();
  q5 uuid := uuid_generate_v4();
  q6 uuid := uuid_generate_v4();
BEGIN

  -- Get first user as owner
  SELECT id INTO admin_id FROM auth.users LIMIT 1;

  -- Check if team already exists
  SELECT id INTO team_id FROM teams WHERE name = 'RISHU''s Team' LIMIT 1;

  IF team_id IS NULL THEN
    team_id := uuid_generate_v4();
    INSERT INTO teams (id, name, code, access_key, created_by, created_at)
    VALUES (team_id, 'RISHU''s Team', 'RISHU1', 'RISHU123', admin_id, now());
  ELSE
    UPDATE teams SET access_key = 'RISHU123' WHERE id = team_id;
  END IF;

  -- Insert questions
  INSERT INTO questions (id, title, description, created_at) VALUES
    (q1, 'What is your project idea?',
         'Describe your project in 2-3 sentences. What does it do and what makes it interesting?', now()),
    (q2, 'What problem does your solution address?',
         'Explain the core problem. Who faces this problem and how often?', now()),
    (q3, 'Who are your target users?',
         'Define your primary user segment. Include age, background, or context if relevant.', now()),
    (q4, 'What is your tech stack?',
         'List the technologies, frameworks, and tools you plan to use.', now()),
    (q5, 'How does your solution stand out?',
         'What makes your approach different from existing solutions or competitors?', now()),
    (q6, 'What is your implementation plan?',
         'Break down your plan into phases or milestones. What will you build first?', now());

  -- Assign to team with mixed statuses
  INSERT INTO team_questions (team_id, question_id, status, assigned_at) VALUES
    (team_id, q1, 'completed', now()),
    (team_id, q2, 'completed', now()),
    (team_id, q3, 'pending',   now()),
    (team_id, q4, 'pending',   now()),
    (team_id, q5, 'draft',     now()),
    (team_id, q6, 'draft',     now());

  RAISE NOTICE 'Done. Team ID: %  |  Access Key: RISHU123', team_id;
END $$;
