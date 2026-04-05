-- ============================================================
-- SFP — Add Competition Teams
-- Run in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  admin_id uuid;

  -- helper to insert a team if it doesn't exist yet
  PROCEDURE upsert_team(p_name text, p_code text, p_key text) AS $$
  DECLARE
    existing_id uuid;
  BEGIN
    SELECT id INTO existing_id FROM teams WHERE upper(name) = upper(p_name) LIMIT 1;
    IF existing_id IS NULL THEN
      INSERT INTO teams (id, name, code, access_key, created_by, created_at)
      VALUES (uuid_generate_v4(), p_name, p_code, p_key, admin_id, now());
      RAISE NOTICE 'Created team: %  (code: %  key: %)', p_name, p_code, p_key;
    ELSE
      -- Update access key in case it changed
      UPDATE teams SET access_key = p_key, name = p_name WHERE id = existing_id;
      RAISE NOTICE 'Updated team: %  (already existed)', p_name;
    END IF;
  END;
  $$;

BEGIN
  -- Get the admin user
  SELECT id INTO admin_id FROM auth.users LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No user found in auth.users — make sure you have signed in at least once.';
  END IF;

  -- ── Competition teams (all uppercase, access key = PASSWORD) ──
  CALL upsert_team('VISIONARY VENTURES',    'VVENT1', 'PASSWORD');
  CALL upsert_team('CRAZY DRIVERS',         'CDRIV1', 'PASSWORD');
  CALL upsert_team('TEAM CAPITAL',          'TCAP01', 'PASSWORD');
  CALL upsert_team('THE PROOF OF CONCEPT',  'TPOC01', 'PASSWORD');
  CALL upsert_team('BIHARIS IN FINANCE',    'BIFIN1', 'PASSWORD');
  CALL upsert_team('THE BUCKET MEN',        'TBUCK1', 'PASSWORD');
  CALL upsert_team('TENET',                 'TENET1', 'PASSWORD');
  CALL upsert_team('UNSTOPPABLE',           'UNSTOP', 'PASSWORD');
  CALL upsert_team('GHODEBOYS',             'GHODE1', 'PASSWORD');
  CALL upsert_team('NILAM',                 'NILAM1', 'PASSWORD');

  -- ── Test teams ────────────────────────────────────────────────
  CALL upsert_team('TEST TEAM 1', 'TEST01', 'PASSWORD');
  CALL upsert_team('TEST TEAM 2', 'TEST02', 'PASSWORD');
  CALL upsert_team('TEST TEAM 3', 'TEST03', 'PASSWORD');

  -- ── Also uppercase RISHU's team and set key to PASSWORD ───────
  UPDATE teams SET name = 'RISHU''S TEAM', access_key = 'PASSWORD'
  WHERE upper(name) LIKE '%RISHU%';

  RAISE NOTICE '✓ All teams inserted/updated.';
END $$;
