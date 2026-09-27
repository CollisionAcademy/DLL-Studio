import {
  account,
  entitled,
  AccessError,
  failure,
} from "@/lib/membership/access";
import { db } from "@/lib/membership/db";
import { providerUrl } from "@/lib/membership/fal";
import { hasEntitlement } from "@/lib/membership/plans";
import { readPrivateVideo } from "@/lib/membership/video-storage";
import { z } from "zod";
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await account();
    if (id === "activity-sheet") {
      await entitled("activities");
      return new Response(
        "DLL STUDIOS — THE TOGETHER CHALLENGE\n\nDraw a wobbly invention for Leo.\nCircle three shapes you can see.\nTell a grown-up how Luca and Vienna could help.\nMake up a gentle funny ending with Bianna.\n\nWORD SEARCH — Find CREW, PLAY, KIND\nC R E W A\nP L A Y B\nK I N D C\nD O G S D\n\nGrown-ups: enjoy at your own pace. Everyone brings a good idea!",
        {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="dll-together-activity.txt"',
            "Cache-Control": "private, no-store",
          },
        },
      );
    }
    if (!z.uuid().safeParse(id).success) {
      const content = (
        await db().query(
          "SELECT * FROM dll.content WHERE id=$1 AND approved_at IS NOT NULL AND (member_at<=now() OR ($2 AND early_at<=now()) OR ($3 AND first_at<=now()))",
          [
            id,
            hasEntitlement(user.plan, "early_access"),
            hasEntitlement(user.plan, "first_access"),
          ],
        )
      ).rows[0];
      if (!hasEntitlement(user.plan, "member_content") || !content?.asset_url)
        throw new AccessError("This content is not available.", 404);
      // Only trusted provider media is accepted. Content links never go into public HTML.
      const response = await fetch(providerUrl(content.asset_url, true), {
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw Error("Media unavailable");
      return new Response(response.body, {
        headers: {
          "Content-Type":
            content.kind === "activity" ? "application/pdf" : "video/mp4",
          "Cache-Control": "private, no-store",
        },
      });
    }
    const row = (
      await db().query(
        "SELECT asset_url FROM dll.video_requests WHERE id=$1 AND household_id=$2 AND state='ready' AND (staff_approved_at IS NOT NULL OR auto_delivered_at IS NOT NULL)",
        [id, user.id],
      )
    ).rows[0];
    if (!row?.asset_url)
      throw new AccessError("That video is not ready to watch.", 404);
    if (
      new URL(row.asset_url).hostname.endsWith(
        ".private.blob.vercel-storage.com",
      )
    )
      return await readPrivateVideo(row.asset_url);
    const response = await fetch(providerUrl(row.asset_url, true), {
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw Error("Media unavailable");
    return new Response(response.body, {
      headers: {
        "Content-Type": "video/mp4",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return failure(error);
  }
}
