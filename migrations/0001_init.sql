-- Initial schema: submissions, waitlist, showcase_items
-- Apply locally:  pnpm db:migrate:local
-- Apply remotely: pnpm db:migrate:remote

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS showcase_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the showcase with the items that were previously hardcoded
-- (order preserved via sort_order).
INSERT INTO showcase_items (name, url, sort_order) VALUES
  ('Happy Horse 2', 'https://happyhorse2.com/', 1),
  ('Hubble Birthday', 'https://hubblebirthday.com/', 2),
  ('vget', 'https://www.vget.io/', 3),
  ('submitnow', 'https://www.submitnow.dev/', 4),
  ('OG Image Generator', 'https://myogimage.com', 5),
  ('Black''s Screen', 'https://www.blacksscreen.com/', 6),
  ('Pinpoint Answer', 'https://pinpointanswer.today/', 7),
  ('Dead Pixel Test', 'https://deadpixelstest.com/', 8),
  ('Ouke Machinery', 'https://www.oukemac.com/', 9),
  ('Ouke Machinery', 'https://oukepoultry.com/', 10),
  ('Robot Apex', 'https://ai-apex.top/', 11),
  ('PicArt - Online Puzzle Tool', 'https://www.puzzletool.online/', 12),
  ('Escape From Duckov Wiki', 'https://www.escapefromduckov.io/', 13),
  ('FileMerges', 'https://filemerges.net/', 14),
  ('Khuzama Valley Investment', 'https://khuzamainv.com/', 15);
