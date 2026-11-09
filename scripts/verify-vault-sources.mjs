// Explicit catalog verification only; this never adds new uploads automatically.
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = await readFile("src/lib/youtube-videos.ts", "utf8");
const ids = [...source.matchAll(/id: "([\w-]{11})"/g)].map((match) => match[1]);
await mkdir("verification", { recursive: true });
await mkdir("public/story-vault", { recursive: true });
const results = [];
for (const id of ids) {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const response = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    { signal: AbortSignal.timeout(15000) },
  );
  if (!response.ok) throw Error(`${id}: metadata ${response.status}`);
  const metadata = await response.json();
  if (metadata.author_url !== "https://www.youtube.com/@DLL-Studio")
    throw Error(`${id}: unexpected channel`);
  const thumbnail = new URL(metadata.thumbnail_url);
  if (
    thumbnail.origin !== "https://i.ytimg.com" ||
    !thumbnail.pathname.startsWith(`/vi/${id}/`)
  )
    throw Error(`${id}: unexpected thumbnail`);
  const image = await fetch(thumbnail, { signal: AbortSignal.timeout(15000) });
  if (!image.ok || !image.headers.get("content-type")?.startsWith("image/"))
    throw Error(`${id}: thumbnail unavailable`);
  const bytes = Buffer.from(await image.arrayBuffer());
  if (bytes.length > 1_000_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8)
    throw Error(`${id}: invalid JPEG`);
  await writeFile(resolve("public/story-vault", `${id}.jpg`), bytes);
  results.push({
    id,
    title: metadata.title,
    url,
    author: metadata.author_name,
    thumbnail: thumbnail.href,
    bytes: bytes.length,
  });
  console.log(`${id}: ${metadata.title}`);
}
await writeFile(
  "verification/vault-sources.json",
  JSON.stringify(
    { checkedAt: new Date().toISOString(), videos: results },
    null,
    2,
  ),
);
