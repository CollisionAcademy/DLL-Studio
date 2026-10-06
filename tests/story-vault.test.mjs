import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { publicStoryVaultQuery } from "../src/lib/membership/public-content-query.ts";
import { nextPlaylistIndex } from "../src/lib/membership/playlist.ts";
import { hasEntitlement, planKeys } from "../src/lib/membership/plans.ts";

test("play all advances once through the entire video queue and stops", () => {
  for (const length of [1, 3, 16]) {
    const visited = [0];
    let index = 0;
    while (nextPlaylistIndex(index, length) !== null) {
      index = nextPlaylistIndex(index, length);
      visited.push(index);
    }
    assert.deepEqual(
      visited,
      Array.from({ length }, (_, i) => i),
    );
  }
  assert.equal(nextPlaylistIndex(0, 0), null);
  assert.equal(nextPlaylistIndex(-1, 3), null);
  for (const plan of planKeys)
    assert.equal(hasEntitlement(plan, "story_vault"), true);
});

test("public vault lists published episodes and stories without revealing private content or storage URLs", async () => {
  const db = await PGlite.create();
  try {
    for (const file of ["001_membership.sql", "004_content_public_release.sql"])
      await db.exec(
        await readFile(
          new URL(`../migrations/${file}`, import.meta.url),
          "utf8",
        ),
      );
    await db.exec(`INSERT INTO dll.content(id,title,kind,asset_url,approved_at,member_at,public_at) VALUES
      ('episode','A video','episode','https://private.example/video.mp4',now(),now(),now()),
      ('story','B story','story',NULL,now(),now(),now()),
      ('private','Private','episode','https://private.example/private.mp4',now(),now(),NULL),
      ('future','Future','episode','https://private.example/future.mp4',now(),now(),now()+interval '1 day'),
      ('draft','Draft','episode','https://private.example/draft.mp4',NULL,now(),now()),
      ('missing','Missing','episode',NULL,now(),now(),now()),
      ('activity','Sheet','activity',NULL,now(),now(),now())`);
    const { rows } = await db.query(publicStoryVaultQuery);
    assert.deepEqual(
      rows.map((r) => r.id),
      ["episode", "story"],
    );
    assert.ok(rows.every((r) => !("asset_url" in r)));
  } finally {
    await db.close();
  }
});
