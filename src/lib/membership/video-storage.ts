import "server-only";
import { put, get } from "@vercel/blob";
import { providerUrl } from "./fal";
import { validateVideo, InvalidVideoError } from "./mp4";
export async function archiveVideo(
  id: string,
  source: string,
  duration: number,
) {
  const response = await fetch(providerUrl(source, true), {
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok || !response.body)
    throw Error("Generated video unavailable");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength < 1000 || bytes.byteLength > 100 * 1024 * 1024)
    throw new InvalidVideoError("Invalid video size");
  validateVideo(new Uint8Array(bytes), duration);
  const blob = await put(`member-videos/${id}.mp4`, Buffer.from(bytes), {
    access: "private",
    contentType: "video/mp4",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}
export async function readPrivateVideo(url: string) {
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(".private.blob.vercel-storage.com")
  )
    throw Error("Invalid private video URL");
  const result = await get(url, { access: "private" });
  if (!result || result.statusCode !== 200)
    throw Error("Video temporarily unavailable");
  return new Response(result.stream, {
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
