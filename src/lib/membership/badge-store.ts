import { randomInt, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import {
  characterBadges,
  COLLECTION_SIZE,
  type BadgeRewards,
} from "./badge-catalog.ts";
import { AccessError } from "./errors.ts";
type Client = Pick<PoolClient, "query">;

export async function readRewards(
  client: Client,
  household: string,
): Promise<BadgeRewards> {
  const summary = (
    await client.query(
      `SELECT COALESCE((SELECT max(round) FROM dll.badge_collections WHERE household_id=$1 AND completed_at IS NOT NULL),0)+1 AS round,
    COALESCE((SELECT sum(points) FROM dll.character_challenges WHERE household_id=$1 AND completed_at IS NOT NULL),0)::int AS points,
    COALESCE((SELECT sum(remaining_cents) FROM dll.store_rewards WHERE household_id=$1),0)::int AS balance`,
      [household],
    )
  ).rows[0];
  const earned = await client.query(
    "SELECT badge_id FROM dll.character_challenges WHERE household_id=$1 AND round=$2 AND completed_at IS NOT NULL",
    [household, summary.round],
  );
  const trophies = await client.query(
    "SELECT round,completed_at FROM dll.badge_collections WHERE household_id=$1 AND completed_at IS NOT NULL ORDER BY round DESC",
    [household],
  );
  return {
    round: summary.round,
    earned: earned.rows.map((r) => r.badge_id),
    lifetimePoints: summary.points,
    balanceCents: summary.balance,
    trophies: trophies.rows,
  };
}

export async function startChallenge(
  client: Client,
  household: string,
  badgeId: string,
) {
  const badge = characterBadges.find((b) => b.id === badgeId);
  if (!badge) throw new AccessError("Choose a character badge.", 400);
  await client.query("SELECT id FROM dll.households WHERE id=$1 FOR UPDATE", [
    household,
  ]);
  const { round } = await readRewards(client, household);
  await client.query(
    "INSERT INTO dll.badge_collections(household_id,round) VALUES($1,$2) ON CONFLICT DO NOTHING",
    [household, round],
  );
  // Each new collection requires a newly issued challenge. Answers remain server-side.
  const a = randomInt(1, 6),
    b = randomInt(1, 6);
  const answer = a + b;
  const choices = [answer - 1, answer, answer + 1];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  await client.query(
    "INSERT INTO dll.character_challenges(id,household_id,round,badge_id,prompt,choices,answer) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(household_id,round,badge_id) DO NOTHING",
    [
      randomUUID(),
      household,
      round,
      badgeId,
      `${badge.name} has ${a} ${badge.object} and finds ${b} more. How many are there altogether?`,
      JSON.stringify(choices),
      answer,
    ],
  );
  const challenge = (
    await client.query(
      "SELECT id,prompt,choices,completed_at FROM dll.character_challenges WHERE household_id=$1 AND round=$2 AND badge_id=$3",
      [household, round, badgeId],
    )
  ).rows[0];
  if (challenge.completed_at)
    throw new AccessError(
      "You already earned this badge in this collection.",
      409,
    );
  return {
    id: challenge.id,
    prompt: challenge.prompt,
    choices: challenge.choices,
    round,
    badgeId,
  };
}

export async function completeChallenge(
  client: Client,
  household: string,
  id: string,
  answer: number,
) {
  await client.query("SELECT id FROM dll.households WHERE id=$1 FOR UPDATE", [
    household,
  ]);
  const challenge = (
    await client.query(
      "SELECT * FROM dll.character_challenges WHERE id=$1 AND household_id=$2",
      [id, household],
    )
  ).rows[0];
  if (!challenge) throw new AccessError("Open a badge challenge first.", 404);
  if (challenge.completed_at)
    return {
      message:
        "You already completed this challenge. No extra points or credit were added.",
    };
  if (challenge.answer !== answer)
    return {
      message: "Count together and try again. You can take your time!",
      correct: false,
    };
  await client.query(
    "UPDATE dll.character_challenges SET completed_at=now() WHERE id=$1",
    [id],
  );
  const count = (
    await client.query(
      "SELECT count(*)::int AS count FROM dll.character_challenges WHERE household_id=$1 AND round=$2 AND completed_at IS NOT NULL",
      [household, challenge.round],
    )
  ).rows[0].count;
  if (count === COLLECTION_SIZE) {
    await client.query(
      "UPDATE dll.badge_collections SET completed_at=now() WHERE household_id=$1 AND round=$2 AND completed_at IS NULL",
      [household, challenge.round],
    );
    await client.query(
      "INSERT INTO dll.store_rewards(household_id,round) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [household, challenge.round],
    );
    return {
      correct: true,
      message:
        "All 25 badges collected! $10 in store credit is saved for your family. Your collection is in the Trophy Book, and a fresh round is ready.",
    };
  }
  return {
    correct: true,
    message: `Badge earned! +10 adventure points. ${count} of 25 collected.`,
  };
}
