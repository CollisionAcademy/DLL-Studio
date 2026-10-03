-- Opt-in only: existing member content remains private indefinitely.
ALTER TABLE dll.content ADD COLUMN IF NOT EXISTS public_at timestamptz;
CREATE INDEX IF NOT EXISTS content_public_release_idx ON dll.content(public_at)
WHERE public_at IS NOT NULL AND approved_at IS NOT NULL;
