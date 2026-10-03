import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { publicEpisodeQuery } from "../src/lib/membership/public-content-query.ts";

test("public release fails closed until approved, member-live, and at the release boundary", async () => {
  const db = await PGlite.create();
  try {
    for (const name of [
      "001_membership.sql",
      "004_content_public_release.sql",
      "004_content_public_release.sql",
    ])
      await db.exec(
        await readFile(
          new URL(`../migrations/${name}`, import.meta.url),
          "utf8",
        ),
      );
    await db.exec(`INSERT INTO dll.content(id,title,kind,asset_url,approved_at,member_at)
      VALUES ('halloween-ghost','Halloween','episode','https://example.private.blob.vercel-storage.com/video.mp4',now(),now()-interval '1 hour')`);
    const visible = async () =>
      (await db.query(publicEpisodeQuery, ["halloween-ghost"])).rows.length;
    assert.equal(
      await visible(),
      0,
      "no public date keeps existing content private",
    );
    await db.exec("UPDATE dll.content SET public_at=now()+interval '48 hours'");
    assert.equal(await visible(), 0, "48-hour embargo denies public access");
    await db.exec("BEGIN; UPDATE dll.content SET public_at=now()");
    assert.equal(await visible(), 1, "opens exactly at the release timestamp");
    await db.exec("COMMIT; UPDATE dll.content SET approved_at=NULL");
    assert.equal(
      await visible(),
      0,
      "unapproved media stays hidden after release",
    );
    await db.exec(
      "UPDATE dll.content SET approved_at=now(),member_at=now()+interval '1 day'",
    );
    assert.equal(await visible(), 0, "future member release stays hidden");
    await db.exec("UPDATE dll.content SET member_at=now(),asset_url=NULL");
    assert.equal(await visible(), 0, "missing video stays hidden");
    assert.equal(
      (await db.query(publicEpisodeQuery, ["unknown"])).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
