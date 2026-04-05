-- ============================================================
-- SFP — Add Competition Teams
-- Run in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  admin_id uuid;
  t_id     uuid;

  team_names  text[]  := ARRAY[
    'VISIONARY VENTURES',
    'CRAZY DRIVERS',
    'TEAM CAPITAL',
    'THE PROOF OF CONCEPT',
    'BIHARIS IN FINANCE',
    'THE BUCKET MEN',
    'TENET',
    'UNSTOPPABLE',
    'GHODEBOYS',
    'NILAM',
    'TEST TEAM 1',
    'TEST TEAM 2',
    'TEST TEAM 3'
  ];
  team_codes  text[]  := ARRAY[
    'VVENT1',
    'CDRIV1',
    'TCAP01',
    'TPOC01',
    'BIFIN1',
    'TBUCK1',
    'TENET1',
    'UNSTOP',
    'GHODE1',
    'NILAM1',
    'TEST01',
    'TEST02',
    'TEST03'
  ];
  i integer;

BEGIN
  SELECT id INTO admin_id FROM auth.users LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No user found — sign in at least once before running this.';
  END IF;

  -- Insert / update each competition + test team
  FOR i IN 1 .. array_length(team_names, 1) LOOP
    SELECT id INTO t_id FROM teams WHERE upper(name) = upper(team_names[i]) LIMIT 1;

    IF t_id IS NULL THEN
      INSERT INTO teams (id, name, code, access_key, created_by, created_at)
      VALUES (uuid_generate_v4(), team_names[i], team_codes[i], 'PASSWORD', admin_id, now());
      RAISE NOTICE 'Created: %', team_names[i];
    ELSE
      UPDATE teams SET name = team_names[i], access_key = 'PASSWORD' WHERE id = t_id;
      RAISE NOTICE 'Updated: %', team_names[i];
    END IF;
  END LOOP;

  -- Also uppercase RISHU's existing team and set key to PASSWORD
  UPDATE teams SET name = 'RISHU''S TEAM', access_key = 'PASSWORD'
  WHERE upper(name) LIKE '%RISHU%';

  RAISE NOTICE 'Done — all teams ready with access key: PASSWORD';
END $$;
