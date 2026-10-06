import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import pg from "pg";
import { get } from "@vercel/blob";

// Run in the production build when the database secret cannot be exported.
// The manifest contains only the source videos explicitly approved for publication.
const manifest = JSON.parse(await readFile(process.argv[2], "utf8"));
if (!Array.isArray(manifest) || !manifest.length)
  throw Error("A nonempty staged video manifest is required");
const ids = new Set();
for (const item of manifest) {
  if (
    !/^(vault-[a-z0-9-]+-[a-f0-9]{12}|halloween-ghost-2026)$/.test(item.id) ||
    ids.has(item.id) ||
    typeof item.title !== "string" ||
    !item.title.trim() ||
    !/^[a-f0-9]{64}$/.test(item.sha256) ||
    !Number.isSafeInteger(item.bytes) ||
    item.bytes <= 0 ||
    !new URL(item.asset_url).hostname.endsWith(
      ".private.blob.vercel-storage.com",
    )
  )
    throw Error("Invalid staged video manifest");
  ids.add(item.id);
}
if (!process.env.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN)
  throw Error("Production database and private storage configuration required");
const connection = new URL(process.env.DATABASE_URL);
if (
  connection.searchParams.get("uselibpqcompat") !== "true" &&
  ["prefer", "require", "verify-ca"].includes(
    connection.searchParams.get("sslmode") || "",
  )
)
  connection.searchParams.set("sslmode", "verify-full");
const client = new pg.Client({
  connectionString: connection.toString(),
  connectionTimeoutMillis: 15000,
});
async function verify(item, url) {
  const stored = await get(url, { access: "private", useCache: false });
  if (!stored || stored.statusCode !== 200)
    throw Error(`Missing staged video: ${item.id}`);
  const hash = createHash("sha256");
  let size = 0;
  for await (const chunk of stored.stream) {
    hash.update(chunk);
    size += chunk.length;
  }
  if (hash.digest("hex") !== item.sha256 || size !== item.bytes)
    throw Error(`Source verification failed: ${item.id}`);
}
await client.connect();
try {
  // Verify storage before opening the database transaction.
  for (const item of manifest) {
    await verify(item, item.asset_url);
    console.log(`Verified ${item.title}`);
  }
  await client.query("BEGIN");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('dll-story-vault-import'))",
  );
  await client.query(
    "ALTER TABLE dll.content ADD COLUMN IF NOT EXISTS public_at timestamptz",
  );
  for (const item of manifest) {
    const existing = (
      await client.query(
        "SELECT kind,asset_url FROM dll.content WHERE id=$1 FOR UPDATE",
        [item.id],
      )
    ).rows[0];
    let url = item.asset_url;
    if (existing) {
      if (
        existing.kind !== "episode" ||
        !existing.asset_url ||
        !new URL(existing.asset_url).hostname.endsWith(
          ".private.blob.vercel-storage.com",
        )
      )
        throw Error(`Existing content conflict: ${item.id}`);
      if (existing.asset_url !== url) await verify(item, existing.asset_url);
      url = existing.asset_url;
    }
    await client.query(
      `INSERT INTO dll.content(id,title,kind,asset_url,approved_at,member_at,public_at)
      VALUES($1,$2,'episode',$3,now(),now(),now())
      ON CONFLICT(id) DO UPDATE SET
        public_at=LEAST(COALESCE(dll.content.public_at,now()),now()),
        member_at=LEAST(dll.content.member_at,now()),
        approved_at=COALESCE(dll.content.approved_at,now()),
        body=CASE WHEN dll.content.id='halloween-ghost-2026'
          THEN 'A spooky little adventure with the DLL crew. Free for everyone.'
          ELSE dll.content.body END
      WHERE dll.content.asset_url=EXCLUDED.asset_url AND dll.content.kind='episode'`,
      [item.id, item.title, url],
    );
    const saved = (
      await client.query(
        "SELECT asset_url FROM dll.content WHERE id=$1 AND kind='episode' AND approved_at IS NOT NULL AND member_at<=now() AND public_at<=now()",
        [item.id],
      )
    ).rows[0];
    if (saved?.asset_url !== url) throw Error(`Publication failed: ${item.id}`);
  }
  await client.query("COMMIT");
  console.log(
    `Published ${manifest.length} verified source videos to the free Story vault.`,
  );
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
