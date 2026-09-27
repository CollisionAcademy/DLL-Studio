import { timingSafeEqual } from "node:crypto";
import { db, transaction } from "@/lib/membership/db";
import {
  falFetch,
  moderateScript,
  prepareVideoPrompt,
  providerUrl,
  submitVideo,
  videoEndpoint,
} from "@/lib/membership/fal";
import { releaseVideo } from "@/lib/membership/videos";
import { InvalidVideoError } from "@/lib/membership/mp4";
import { archiveVideo } from "@/lib/membership/video-storage";
export const maxDuration = 120;
export const GET = POST;
export async function POST(request: Request) {
  const expected = Buffer.from(
    `Bearer ${process.env.CRON_SECRET || process.env.DLL_JOB_SECRET || ""}`,
  );
  const actual = Buffer.from(request.headers.get("authorization") || "");
  if (
    !(process.env.CRON_SECRET || process.env.DLL_JOB_SECRET) ||
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  )
    return new Response("Unauthorized", { status: 401 });
  if (
    !process.env.FAL_KEY ||
    !process.env.OPENAI_API_KEY ||
    (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN)
  )
    return new Response("Providers not configured", { status: 503 });
  try {
    // A crash during submit is ambiguous: retain the credit and require reconciliation, never blindly resubmit.
    await db().query(
      "UPDATE dll.video_requests SET state=CASE WHEN provider_request_id IS NOT NULL THEN 'processing' WHEN dispatched_at IS NULL THEN 'moderating' ELSE 'uncertain' END,updated_at=now() WHERE state='submitting' AND updated_at<now()-interval '5 minutes'",
    );
    const job = await transaction(async (client) => {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('dll-video-dispatch'))",
      );
      const dispatched = Number(
        (
          await client.query(
            "SELECT count(*) FROM dll.video_requests WHERE dispatched_at>now()-interval '1 day'",
          )
        ).rows[0].count,
      );
      const dailyLimit = Math.max(
        0,
        Math.min(100, Number(process.env.DLL_VIDEO_DAILY_LIMIT || 10)),
      );
      const row = (
        await client.query(
          "SELECT * FROM dll.video_requests WHERE state IN ('moderating','queued','processing') AND updated_at<now()-interval '20 seconds' AND (state='processing' OR $1) ORDER BY updated_at FOR UPDATE SKIP LOCKED LIMIT 1",
          [dispatched < dailyLimit],
        )
      ).rows[0];
      if (!row) return null;
      await client.query(
        "UPDATE dll.video_requests SET state='submitting',updated_at=now(),dispatched_at=CASE WHEN state='queued' AND generation_prompt IS NOT NULL THEN now() ELSE dispatched_at END WHERE id=$1",
        [row.id],
      );
      return row;
    });
    if (!job) return Response.json({ state: "idle" });
    if (job.state === "processing") {
      try {
        const statusResponse = await falFetch(job.provider_status_url);
        if (!statusResponse.ok) throw Error("Provider status unavailable");
        const status = await statusResponse.json();
        if (status.status === "COMPLETED") {
          const response = await falFetch(job.provider_response_url);
          if (!response.ok) {
            if (response.status === 422) {
              await releaseVideo(job.id, "failed");
              return Response.json({ state: "failed" });
            }
            throw Error("Result unavailable");
          }
          const result = await response.json();
          if (!result.video?.url) {
            await releaseVideo(job.id, "failed");
            return Response.json({ state: "failed" });
          }
          const url = await archiveVideo(
            job.id,
            providerUrl(result.video.url, true),
            job.duration_seconds,
          );
          await transaction(async (client) => {
            const updated = await client.query(
              "UPDATE dll.video_requests SET state='ready',asset_url=$2,auto_delivered_at=now(),updated_at=now() WHERE id=$1 AND state='submitting' RETURNING id",
              [job.id, url],
            );
            if (!updated.rowCount) return;
            if (job.period_id)
              await client.query(
                "INSERT INTO dll.credit_ledger(period_id,request_id,action,quantity) VALUES($1,$2,'consume',0) ON CONFLICT DO NOTHING",
                [job.period_id, job.id],
              );
            await client.query(
              "INSERT INTO dll.audit(actor,action,target) VALUES('video-worker','video-auto-delivered',$1)",
              [job.id],
            );
          });
        } else
          await db().query(
            "UPDATE dll.video_requests SET state='processing',updated_at=now() WHERE id=$1 AND state='submitting'",
            [job.id],
          );
      } catch (error) {
        if (error instanceof InvalidVideoError) {
          await releaseVideo(job.id, "failed");
          return Response.json({ state: "failed" });
        }
        await db().query(
          "UPDATE dll.video_requests SET state='processing',updated_at=now() WHERE id=$1 AND state='submitting'",
          [job.id],
        );
      }
    } else {
      if (job.state === "moderating" || !job.generation_prompt) {
        try {
          if ((await moderateScript(job.script)) === "rejected") {
            await releaseVideo(job.id, "rejected");
            return Response.json({ state: "rejected" });
          }
          const prompt = await prepareVideoPrompt(job);
          await db().query(
            "UPDATE dll.video_requests SET state='queued',generation_prompt=$2,updated_at=now() WHERE id=$1 AND state='submitting'",
            [job.id, prompt],
          );
          return Response.json({ state: "queued" });
        } catch {
          await db().query(
            "UPDATE dll.video_requests SET state='moderating',updated_at=now() WHERE id=$1 AND state='submitting'",
            [job.id],
          );
          return new Response("Moderation temporarily unavailable", {
            status: 503,
          });
        }
      }
      try {
        const remote = await submitVideo(job);
        await db().query(
          "UPDATE dll.video_requests SET state='processing',provider_endpoint=$2,provider_request_id=$3,provider_status_url=$4,provider_response_url=$5,updated_at=now() WHERE id=$1 AND state='submitting'",
          [job.id, videoEndpoint, remote.id, remote.status, remote.result],
        );
      } catch {
        await db().query(
          "UPDATE dll.video_requests SET state='uncertain',updated_at=now() WHERE id=$1 AND state='submitting'",
          [job.id],
        );
      }
    }
    return Response.json({ processed: job.id });
  } catch {
    return new Response("Worker temporarily unavailable", { status: 503 });
  }
}
