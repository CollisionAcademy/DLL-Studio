import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { mp4Duration } from "../src/lib/membership/mp4.ts";
import { databaseUrl } from "../src/lib/membership/database-url.ts";

// A dry run needs no credentials and changes no hosted content.
const source = process.argv[2];
const publish = process.argv.includes("--publish");
if (!source)
  throw Error("Use import-story-vault.mjs <video-folder> [--publish]");
const root = path.resolve(source);
async function discover(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) files.push(...(await discover(file)));
    else if (entry.isFile() && /\.mp4$/i.test(entry.name)) files.push(file);
  }
  return files;
}
const report = [];
let client;
let storage;
if (publish) {
  const { default: nextEnv } = await import("@next/env");
  nextEnv.loadEnvConfig(process.cwd());
  if (!process.env.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN)
    throw Error(
      "DLL DATABASE_URL and private BLOB_READ_WRITE_TOKEN are required",
    );
  const { default: pg } = await import("pg");
  storage = await import("@vercel/blob");
  client = new pg.Client({
    connectionString: databaseUrl(process.env.DATABASE_URL),
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
}
try {
  const files = await discover(root);
  if (!files.length) throw Error("No MP4 videos found");
  for (const file of files) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    const bytes = await readFile(file);
    const duration = mp4Duration(bytes);
    const hash = createHash("sha256").update(bytes).digest("hex");
    const stem = path.basename(file, path.extname(file));
    const slug = stem
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    // Reuse the established Halloween entry and its public-release schedule.
    const id = /^dll-studio-the-halloween-ghost-30-second/.test(slug)
      ? "halloween-ghost-2026"
      : `vault-${slug}-${hash.slice(0, 12)}`;
    const title = stem.replace(/_/g, " ").replace(/\s*\(\d+\)$/, "");
    const entry = {
      id,
      title,
      source: relative,
      bytes: bytes.length,
      duration,
      sha256: hash,
    };
    if (publish) {
      const existing = (
        await client.query("SELECT asset_url FROM dll.content WHERE id=$1", [
          id,
        ])
      ).rows[0];
      let url = existing?.asset_url;
      if (
        url &&
        !new URL(url).hostname.endsWith(".private.blob.vercel-storage.com")
      )
        throw Error(`Existing ${id} uses different storage; left unchanged`);
      const pathname = `member-episodes/story-vault/${hash}.mp4`;
      if (!url) {
        const stored = await storage.get(pathname, { access: "private" });
        url = stored?.blob.url;
        await stored?.stream?.cancel();
      }
      if (!url)
        url = (
          await storage.put(pathname, bytes, {
            access: "private",
            addRandomSuffix: false,
            multipart: true,
            contentType: "video/mp4",
          })
        ).url;
      const stored = await storage.get(url, { access: "private" });
      if (!stored || stored.statusCode !== 200)
        throw Error(`Cannot verify ${id}`);
      const uploadedHash = createHash("sha256");
      for await (const chunk of stored.stream) uploadedHash.update(chunk);
      if (uploadedHash.digest("hex") !== hash)
        throw Error(`Stored bytes differ for ${id}; database left unchanged`);
      const anonymous = await fetch(url);
      await anonymous.body?.cancel();
      if (anonymous.ok) throw Error(`Storage must be private for ${id}`);
      // New library entries are member-only. Existing approvals and dates stay intact.
      await client.query(
        `INSERT INTO dll.content(id,title,kind,asset_url,approved_at,member_at)
        VALUES($1,$2,'episode',$3,now(),now()) ON CONFLICT(id) DO NOTHING`,
        [id, title, url],
      );
      const saved = (
        await client.query("SELECT asset_url FROM dll.content WHERE id=$1", [
          id,
        ])
      ).rows[0];
      if (saved?.asset_url !== url)
        throw Error(`Concurrent change to ${id}; left unchanged`);
      entry.imported = true;
    }
    report.push(entry);
    console.log(
      JSON.stringify({
        title,
        duration,
        bytes: bytes.length,
        imported: publish,
      }),
    );
  }
} finally {
  await client?.end();
  await mkdir("verification", { recursive: true });
  await writeFile(
    "verification/story-vault-import.json",
    JSON.stringify(report, null, 2),
  );
}
