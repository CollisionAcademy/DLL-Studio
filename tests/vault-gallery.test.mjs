import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  youtubeVideos,
  vaultCategories,
  vaultEmbedUrl,
} from "../src/lib/youtube-videos.ts";

test("the curated catalog has unique video IDs and local JPEG thumbnails", async () => {
  assert.ok(youtubeVideos.length >= 16);
  assert.equal(
    new Set(youtubeVideos.map((video) => video.id)).size,
    youtubeVideos.length,
  );
  for (const video of youtubeVideos) {
    assert.match(video.id, /^[\w-]{11}$/);
    assert.ok(video.title.trim());
    assert.ok(vaultCategories.slice(1).includes(video.category));
    const image = await readFile(
      new URL(`../public/story-vault/${video.id}.jpg`, import.meta.url),
    );
    assert.equal(image.readUInt16BE(0), 0xffd8);
    assert.ok(image.length < 1_000_000);
  }
});

test("every embed is privacy-enhanced, single-video and never autoplays", () => {
  for (const video of youtubeVideos) {
    const url = new URL(vaultEmbedUrl(video.id));
    assert.equal(url.origin, "https://www.youtube-nocookie.com");
    assert.equal(url.pathname, `/embed/${video.id}`);
    assert.equal(url.searchParams.get("autoplay"), "0");
    assert.equal(url.searchParams.get("rel"), "0");
    assert.equal(url.searchParams.get("controls"), "1");
    for (const key of ["list", "playlist", "loop", "enablejsapi"])
      assert.equal(url.searchParams.has(key), false);
  }
});

test("homepage shorts point at real Story Vault videos", async () => {
  const source = await readFile(
    new URL("../src/lib/home-features.ts", import.meta.url),
    "utf8",
  );
  const ids = [...source.matchAll(/"([A-Za-z0-9_-]{11})"/g)]
    .map((match) => match[1])
    .filter((id) => youtubeVideos.some((video) => video.id === id));
  assert.deepEqual(ids, [
    "ZVPQu1L-Nug",
    "bAY5G8xrOT8",
    "2KDh63guWD4",
    "jksEOv3y9zw",
    "vlI0XqdVEBE",
    "M7eBI4HHOjo",
  ]);
  for (const id of ids) {
    assert.ok(youtubeVideos.some((video) => video.id === id));
    const url = new URL(vaultEmbedUrl(id));
    assert.equal(url.searchParams.get("autoplay"), "0");
    assert.equal(url.origin, "https://www.youtube-nocookie.com");
  }
});

test("unknown videos cannot become embeds and language input is bounded", () => {
  assert.throws(() => vaultEmbedUrl("not-in-vault"), /Unknown/);
  const id = youtubeVideos[0].id;
  const spanish = new URL(vaultEmbedUrl(id, "es"));
  assert.equal(spanish.searchParams.get("cc_lang_pref"), "es");
  assert.equal(spanish.searchParams.get("cc_load_policy"), "1");
  const unsafe = new URL(vaultEmbedUrl(id, "en&autoplay=1"));
  assert.equal(unsafe.searchParams.get("hl"), "en");
  assert.equal(unsafe.searchParams.get("autoplay"), "0");
});
