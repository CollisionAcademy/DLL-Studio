import { db } from "@/lib/membership/db";
import { publicEpisodeQuery } from "@/lib/membership/public-content-query";
import { readPrivateVideo } from "@/lib/membership/video-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { rows } = await db().query(publicEpisodeQuery, [id]);
    if (!rows[0])
      return new Response("Not found", {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      });
    return await readPrivateVideo(rows[0].asset_url);
  } catch {
    return new Response("Video temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
