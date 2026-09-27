import {
  account,
  AccessError,
  bodyJson,
  failure,
  originCheck,
} from "@/lib/membership/access";
import { db, transaction } from "@/lib/membership/db";
import { releaseVideo } from "@/lib/membership/videos";
import { z } from "zod";
async function staff() {
  const user = await account(true);
  if (!user.isAdmin) throw new AccessError("Staff access required.");
  return user;
}
export async function GET() {
  try {
    await staff();
    return Response.json(
      {
        videos: (
          await db().query(
            "SELECT id,kind,script,character_id,state,asset_url,duration_seconds,provider_request_id FROM dll.video_requests WHERE state IN ('review','uncertain') ORDER BY created_at LIMIT 50",
          )
        ).rows,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    originCheck(request);
    const user = await staff();
    const input = z
      .object({
        id: z.uuid(),
        approve: z.boolean(),
        verifiedDuration: z.number().min(0).max(20),
        reviewed: z.literal(true),
      })
      .strict()
      .safeParse(await bodyJson(request));
    if (!input.success)
      throw new AccessError(
        "Confirm a full safety, character, and duration review.",
        400,
      );
    if (!input.data.approve) await releaseVideo(input.data.id, "rejected");
    else
      await transaction(async (client) => {
        const row = (
          await client.query(
            "SELECT * FROM dll.video_requests WHERE id=$1 FOR UPDATE",
            [input.data.id],
          )
        ).rows[0];
        if (
          !row ||
          row.state !== "review" ||
          Math.abs(row.duration_seconds - input.data.verifiedDuration) > 1
        )
          throw new AccessError(
            "Video is not reviewable or duration is incorrect.",
            409,
          );
        await client.query(
          "UPDATE dll.video_requests SET state='ready',staff_approved_at=now(),updated_at=now() WHERE id=$1",
          [row.id],
        );
        if (row.period_id)
          await client.query(
            "INSERT INTO dll.credit_ledger(period_id,request_id,action,quantity) VALUES($1,$2,'consume',0) ON CONFLICT DO NOTHING",
            [row.period_id, row.id],
          );
        await client.query(
          "INSERT INTO dll.audit(actor,action,target) VALUES($1,'video-approved',$2)",
          [user.id, row.id],
        );
      });
    return Response.json({ message: "Review saved." });
  } catch (error) {
    return failure(error);
  }
}
