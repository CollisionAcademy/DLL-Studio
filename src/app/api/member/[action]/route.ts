import { z } from "zod";
import {
  account,
  entitled,
  AccessError,
  bodyJson,
  failure,
  originCheck,
} from "@/lib/membership/access";
import { db, transaction } from "@/lib/membership/db";
import { getCharacter } from "@/lib/characters";
import { ensureBirthday, reserveVideo } from "@/lib/membership/videos";
import { hasEntitlement, plans } from "@/lib/membership/plans";
const character = z.string().refine((v) => Boolean(getCharacter(v)));
const profileSchema = z
  .object({
    character,
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
    timezone: z.string().max(80),
    consent: z.literal(true),
  })
  .strict()
  .refine(
    (v) =>
      new Date(Date.UTC(2000, v.month - 1, v.day)).getUTCMonth() ===
      v.month - 1,
  )
  .refine((v) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: v.timezone });
      return true;
    } catch {
      return false;
    }
  });
export async function GET(
  _request: Request,
  context: { params: Promise<{ action: string }> },
) {
  try {
    const { action } = await context.params;
    if (!["dashboard", "parent", "content"].includes(action))
      throw new AccessError("Not found.", 404);
    const user = await account();
    if (action === "content") {
      if (!hasEntitlement(user.plan, "member_content"))
        throw new AccessError("A membership unlocks these stories.");
      const rows = await db().query(
        "SELECT id,title,kind,body FROM dll.content WHERE approved_at IS NOT NULL AND (member_at<=now() OR ($1 AND early_at<=now()) OR ($2 AND first_at<=now())) ORDER BY member_at DESC",
        [
          hasEntitlement(user.plan, "early_access"),
          hasEntitlement(user.plan, "first_access"),
        ],
      );
      return Response.json(
        { items: rows.rows },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    await ensureBirthday(user.id, user.isAdmin);
    const [credits, badges, boxes, videos] = await Promise.all([
      db().query(
        "SELECT p.video_limit,p.ends_at,p.video_limit-COALESCE(sum(l.quantity),0)::int AS remaining FROM dll.service_periods p LEFT JOIN dll.credit_ledger l ON l.period_id=p.id WHERE p.household_id=$1 AND p.starts_at<=now() AND p.ends_at>now() GROUP BY p.id ORDER BY p.starts_at DESC LIMIT 1",
        [user.id],
      ),
      db().query(
        "SELECT badge_id,points FROM dll.badges WHERE household_id=$1",
        [user.id],
      ),
      db().query(
        "SELECT id,item_count,state,created_at FROM dll.box_allocations WHERE household_id=$1 ORDER BY created_at DESC LIMIT 12",
        [user.id],
      ),
      db().query(
        "SELECT id,kind,state,duration_seconds,parent_publish,created_at FROM dll.video_requests WHERE household_id=$1 ORDER BY created_at DESC LIMIT 30",
        [user.id],
      ),
    ]);
    const parent =
      action === "parent"
        ? (
            await db().query(
              "SELECT h.parent_confirmed_at,h.timezone,p.character_id,p.birthday_month,p.birthday_day FROM dll.households h LEFT JOIN dll.profiles p ON p.household_id=h.id WHERE h.id=$1",
              [user.id],
            )
          ).rows[0]
        : undefined;
    return Response.json(
      {
        plan: user.plan,
        isAdmin: user.isAdmin,
        entitlements: plans[user.plan].entitlements,
        credits: credits.rows[0] || { remaining: 0, video_limit: 0 },
        badges: badges.rows,
        boxes: action === "parent" ? boxes.rows : [],
        videos: videos.rows,
        parent,
        cancelAtPeriodEnd: Boolean(user.membership?.cancel_at_period_end),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  try {
    originCheck(request);
    const { action } = await context.params;
    const body = await bodyJson(request);
    if (action === "vote") {
      const user = await entitled("voting");
      const input = z
        .object({ option: z.enum(["picnic", "workshop", "mystery"]) })
        .strict()
        .safeParse(body);
      if (!input.success)
        throw new AccessError("Choose one of the story buttons.", 400);
      await transaction(async (client) => {
        await client.query(
          "INSERT INTO dll.votes(household_id,poll_id,option_id) VALUES($1,'next-adventure-v1',$2) ON CONFLICT(household_id,poll_id) DO UPDATE SET option_id=$2",
          [user.id, input.data.option],
        );
        await client.query(
          "INSERT INTO dll.badges(household_id,badge_id) VALUES($1,'idea-helper') ON CONFLICT DO NOTHING",
          [user.id],
        );
      });
      return Response.json({
        message: "Your choice is saved. You earned the Idea Helper badge!",
      });
    }
    const user = await account(true);
    if (action === "confirm-parent") {
      if (
        !z
          .object({ confirmed: z.literal(true) })
          .strict()
          .safeParse(body).success
      )
        throw new AccessError("A parent or guardian must confirm.", 400);
      await db().query(
        "UPDATE dll.households SET parent_confirmed_at=now() WHERE id=$1",
        [user.id],
      );
    } else {
      const parent = (
        await db().query(
          "SELECT parent_confirmed_at FROM dll.households WHERE id=$1",
          [user.id],
        )
      ).rows[0];
      if (!parent.parent_confirmed_at)
        throw new AccessError("Confirm your parent account first.");
      if (action === "profile") {
        if (!hasEntitlement(user.plan, "birthday_video"))
          throw new AccessError("Join Adventure Club to save a birthday.");
        const input = profileSchema.safeParse(body);
        if (!input.success)
          throw new AccessError(
            "Check the birthday, character, timezone, and permission.",
            400,
          );
        const p = input.data;
        await transaction(async (client) => {
          await client.query(
            "UPDATE dll.households SET timezone=$2 WHERE id=$1",
            [user.id, p.timezone],
          );
          await client.query(
            "INSERT INTO dll.profiles(household_id,character_id,birthday_month,birthday_day,consent_at) VALUES($1,$2,$3,$4,now()) ON CONFLICT(household_id) DO UPDATE SET character_id=$2,birthday_month=$3,birthday_day=$4,consent_at=now(),birthday_saved_at=now()",
            [user.id, p.character, p.month, p.day],
          );
          await client.query(
            "INSERT INTO dll.audit(actor,action,target) VALUES($1,'birthday-consent-v1',$1)",
            [user.id],
          );
        });
        await ensureBirthday(user.id, user.isAdmin);
      } else if (action === "delete-profile") {
        await transaction(async (client) => {
          await client.query(
            "SELECT id FROM dll.households WHERE id=$1 FOR UPDATE",
            [user.id],
          );
          await client.query("DELETE FROM dll.profiles WHERE household_id=$1", [
            user.id,
          ]);
          await client.query(
            "UPDATE dll.video_requests SET state='rejected',asset_url=NULL,script='',parent_publish=false WHERE household_id=$1 AND kind='birthday'",
            [user.id],
          );
          await client.query(
            "INSERT INTO dll.audit(actor,action,target) VALUES($1,'birthday-consent-withdrawn',$1)",
            [user.id],
          );
        });
      } else if (action === "video") {
        if (!hasEntitlement(user.plan, "custom_video"))
          throw new AccessError("Super Crew unlocks custom video adventures.");
        const input = z
          .object({
            script: z.string().trim().min(1).max(500),
            character,
            requestKey: z.uuid(),
          })
          .strict()
          .safeParse(body);
        if (!input.success)
          throw new AccessError(
            "Choose a character and a story of 1–500 characters.",
            400,
          );
        if (!process.env.FAL_KEY || !process.env.OPENAI_API_KEY)
          throw new AccessError(
            "Video creation is being prepared. Your credit has not been used.",
            503,
          );
        return Response.json({
          id: await reserveVideo(user.id, input.data, user.isAdmin),
          message: user.isAdmin
            ? "Your administrator story is in the safety review queue. No membership credit is required."
            : "Your story is in the safety review queue. One credit is reserved.",
        });
      } else if (action === "publish") {
        const input = z
          .object({ id: z.uuid(), permission: z.boolean() })
          .strict()
          .safeParse(body);
        if (!input.success)
          throw new AccessError("Check your publishing choice.", 400);
        const result = await db().query(
          "UPDATE dll.video_requests SET parent_publish=$3 WHERE id=$1 AND household_id=$2 AND state='ready' RETURNING id",
          [input.data.id, user.id, input.data.permission],
        );
        if (!result.rowCount)
          throw new AccessError("That reviewed video is not available.", 404);
        await db().query(
          "INSERT INTO dll.audit(actor,action,target) VALUES($1,$2,$3)",
          [
            user.id,
            input.data.permission
              ? "publication-permission-granted"
              : "publication-permission-revoked",
            input.data.id,
          ],
        );
      } else throw new AccessError("Not found.", 404);
    }
    return Response.json({ message: "Your changes are saved." });
  } catch (error) {
    return failure(error);
  }
}
