import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { characterBadges } from "../src/lib/membership/badge-catalog.ts";
import {
  startChallenge,
  completeChallenge,
  readRewards,
} from "../src/lib/membership/badge-store.ts";

test("25 distinct badges award exactly $10 per round; retries, wrong answers and other households cannot mint rewards", async () => {
  const db = await PGlite.create();
  try {
    for (const name of [
      "001_membership",
      "003_badge_rewards",
      "003_badge_rewards",
    ]) {
      await db.exec(
        await readFile(
          new URL(`../migrations/${name}.sql`, import.meta.url),
          "utf8",
        ),
      );
    }
    await db.exec(
      "INSERT INTO dll.households(id) VALUES('family'),('other'); INSERT INTO dll.badges VALUES('family','idea-helper',10)",
    );
    assert.equal(characterBadges.length, 25);
    assert.equal(new Set(characterBadges.map((b) => b.id)).size, 25);
    const start = (badge) =>
      db.transaction((tx) => startChallenge(tx, "family", badge));
    const complete = (id, answer, who = "family") =>
      db.transaction((tx) => completeChallenge(tx, who, id, answer));
    await assert.rejects(start("fake"), /Choose a character badge/);
    let firstId, lastId;
    for (let i = 0; i < 25; i++) {
      const challenge = await start(characterBadges[i].id);
      assert.equal(
        "answer" in challenge,
        false,
        "answers are not returned to browser",
      );
      assert.equal((await start(characterBadges[i].id)).id, challenge.id);
      if (!firstId) firstId = challenge.id;
      const answer = (
        await db.query(
          "SELECT answer FROM dll.character_challenges WHERE id=$1",
          [challenge.id],
        )
      ).rows[0].answer;
      assert.equal((await complete(challenge.id, 0)).correct, false);
      await assert.rejects(
        complete(challenge.id, answer, "other"),
        /Open a badge challenge/,
      );
      await complete(challenge.id, answer);
      await complete(challenge.id, answer);
      const state = await readRewards(db, "family");
      assert.equal(state.lifetimePoints, (i + 1) * 10);
      assert.equal(state.balanceCents, i === 24 ? 1000 : 0);
      lastId = challenge.id;
    }
    let state = await readRewards(db, "family");
    assert.equal(state.round, 2);
    assert.equal(state.earned.length, 0);
    assert.equal(state.trophies.length, 1);
    await complete(lastId, 0);
    assert.equal((await readRewards(db, "family")).balanceCents, 1000);
    for (const badge of characterBadges) {
      const challenge = await start(badge.id);
      assert.notEqual(
        challenge.id,
        firstId,
        "new rounds issue new challenge instances",
      );
      const answer = (
        await db.query(
          "SELECT answer FROM dll.character_challenges WHERE id=$1",
          [challenge.id],
        )
      ).rows[0].answer;
      await complete(challenge.id, answer);
    }
    state = await readRewards(db, "family");
    assert.equal(state.balanceCents, 2000);
    assert.equal(state.lifetimePoints, 500);
    assert.equal(state.trophies.length, 2);
    assert.equal((await readRewards(db, "other")).balanceCents, 0);
    assert.equal(
      (
        await db.query(
          "SELECT points FROM dll.badges WHERE household_id='family'",
        )
      ).rows[0].points,
      10,
    );
    await db.query(
      "UPDATE dll.store_rewards SET remaining_cents=400 WHERE household_id='family' AND round=1",
    );
    assert.equal(
      (await readRewards(db, "family")).balanceCents,
      1400,
      "balance retains unused partial credit",
    );
  } finally {
    await db.close();
  }
});
