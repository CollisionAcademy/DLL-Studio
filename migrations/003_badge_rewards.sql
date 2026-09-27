CREATE TABLE IF NOT EXISTS dll.badge_collections (
 household_id text NOT NULL REFERENCES dll.households(id),
 round integer NOT NULL CHECK(round > 0), completed_at timestamptz,
 PRIMARY KEY(household_id, round)
);
CREATE TABLE IF NOT EXISTS dll.character_challenges (
 id uuid PRIMARY KEY, household_id text NOT NULL, round integer NOT NULL,
 badge_id text NOT NULL, prompt text NOT NULL, choices jsonb NOT NULL,
 answer integer NOT NULL, completed_at timestamptz,
 points integer NOT NULL DEFAULT 10 CHECK(points=10),
 FOREIGN KEY(household_id,round) REFERENCES dll.badge_collections(household_id,round),
 UNIQUE(household_id,round,badge_id)
);
CREATE TABLE IF NOT EXISTS dll.store_rewards (
 id bigserial PRIMARY KEY, household_id text NOT NULL, round integer NOT NULL,
 amount_cents integer NOT NULL DEFAULT 1000 CHECK(amount_cents=1000),
 remaining_cents integer NOT NULL DEFAULT 1000 CHECK(remaining_cents BETWEEN 0 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(household_id,round) REFERENCES dll.badge_collections(household_id,round),
 UNIQUE(household_id,round)
);
CREATE INDEX IF NOT EXISTS character_challenge_owner ON dll.character_challenges(household_id,completed_at);
