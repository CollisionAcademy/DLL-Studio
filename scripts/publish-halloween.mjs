import nextEnv from "@next/env";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { put, get } from "@vercel/blob";
import pg from "pg";
import { databaseUrl } from "../src/lib/membership/database-url.ts";
import { mp4Duration } from "../src/lib/membership/mp4.ts";

nextEnv.loadEnvConfig(process.cwd());
const mode = process.argv[2];
if (!["prepare", "activate", "verify"].includes(mode))
  throw Error("Use prepare, activate, or verify");
const id = "halloween-ghost-2026";
const client = new pg.Client({
  connectionString: databaseUrl(process.env.DATABASE_URL),
  connectionTimeoutMillis: 15000,
});
await client.connect();
try {
  if (mode === "prepare") {
    const { BLOB_READ_WRITE_TOKEN: token } = JSON.parse(
      await readFile(".env.halloween-storage.json", "utf8"),
    );
    const bytes = await readFile(
      "../videos/dll_cast/Holloween/dll-studio-the-halloween-ghost-30-second (1).mp4",
    );
    const duration = mp4Duration(bytes);
    if (Math.abs(duration - 30) > 1) throw Error("Unexpected video duration");
    const hash = createHash("sha256").update(bytes).digest("hex");
    const pathname = `member-episodes/${id}-${hash.slice(0, 16)}.mp4`;
    let blob = await get(pathname, { access: "private", token });
    let url = blob?.blob.url;
    if (blob?.stream) await blob.stream.cancel();
    if (!url)
      url = (
        await put(pathname, bytes, {
          access: "private",
          token,
          addRandomSuffix: false,
          contentType: "video/mp4",
        })
      ).url;
    const stored = await get(url, { access: "private", token });
    if (!stored || stored.statusCode !== 200)
      throw Error("Upload cannot be read");
    const storedHash = createHash("sha256")
      .update(Buffer.from(await new Response(stored.stream).arrayBuffer()))
      .digest("hex");
    if (storedHash !== hash) throw Error("Uploaded bytes differ");
    const anonymous = await fetch(url);
    await anonymous.body?.cancel();
    if (anonymous.ok) throw Error("Storage unexpectedly permits public access");
    await client.query(
      await readFile("migrations/004_content_public_release.sql", "utf8"),
    );
    await client.query(
      `INSERT INTO dll.content(id,title,kind,body,asset_url,member_at)
      VALUES($1,$2,'episode',$3,$4,now()) ON CONFLICT(id) DO NOTHING`,
      [
        id,
        "The Halloween Ghost!",
        "A spooky little adventure with the DLL Studio gang. Members get the first 48 hours; then everyone can join the fun.",
        url,
      ],
    );
    const { rows } = await client.query(
      "SELECT asset_url FROM dll.content WHERE id=$1",
      [id],
    );
    if (rows[0].asset_url !== url)
      throw Error("Existing episode has a different asset; left unchanged");
    await mkdir("verification", { recursive: true });
    await writeFile(
      "verification/halloween-upload.json",
      JSON.stringify(
        {
          id,
          bytes: bytes.length,
          duration,
          sha256: hash,
          anonymousStorageStatus: anonymous.status,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        prepared: true,
        bytes: bytes.length,
        duration,
        anonymousStorageStatus: anonymous.status,
      }),
    );
  }
  if (mode === "activate") {
    await client.query("BEGIN");
    await client.query(
      `UPDATE dll.content SET approved_at=now(),member_at=now(),early_at=now(),first_at=now(),public_at=now()+interval '48 hours'
      WHERE id=$1 AND approved_at IS NULL AND asset_url IS NOT NULL`,
      [id],
    );
    await client.query(
      `UPDATE dll.content SET body=$2 || to_char(public_at AT TIME ZONE 'America/New_York','FMMonth FMDD, YYYY at FMHH12:MI AM') || ' Eastern. Everyone is welcome when the countdown ends!'
      WHERE id=$1 AND approved_at IS NOT NULL`,
      [
        id,
        "Members-only premiere! Watch now with any active DLL paid membership. Public release: ",
      ],
    );
    await client.query("COMMIT");
  }
  const { rows } = await client.query(
    "SELECT id,title,approved_at,member_at,public_at,public_at-member_at AS exclusive_window FROM dll.content WHERE id=$1",
    [id],
  );
  console.log(JSON.stringify(rows, null, 2));
  if (mode === "activate")
    await writeFile(
      "verification/halloween-release.json",
      JSON.stringify(rows[0], null, 2),
    );
} finally {
  await client.end();
}
