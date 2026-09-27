import "server-only";
import { randomUUID } from "node:crypto";
import { transaction } from "./db";
import { reserveVideoTransaction } from "./credit-store";
import { birthdayOccurrence, effectivePlan, hasEntitlement } from "./plans";
export async function reserveVideo(
  household: string,
  input: { requestKey: string; script: string; character: string },
  administrator = false,
) {
  return transaction((client) =>
    reserveVideoTransaction(client, household, input, administrator),
  );
}
export async function ensureBirthday(household: string, administrator = false) {
  return transaction(async (client) => {
    await client.query("SELECT id FROM dll.households WHERE id=$1 FOR UPDATE", [
      household,
    ]);
    const result = await client.query(
      "SELECT p.*,h.timezone,m.plan_key,m.status,m.period_end FROM dll.profiles p JOIN dll.households h ON h.id=p.household_id LEFT JOIN dll.memberships m ON m.household_id=h.id WHERE h.id=$1",
      [household],
    );
    const profile = result.rows[0];
    if (
      !profile?.birthday_month ||
      (!administrator &&
        !hasEntitlement(effectivePlan(profile), "birthday_video"))
    )
      return;
    const year = birthdayOccurrence(
      profile.birthday_month,
      profile.birthday_day,
      profile.timezone,
    );
    if (!year) return;
    await client.query(
      "INSERT INTO dll.video_requests(id,household_id,kind,occurrence_year,request_key,script,character_id,duration_seconds,state) VALUES($1,$2,'birthday',$3,$4,$5,$6,10,'queued') ON CONFLICT DO NOTHING",
      [
        randomUUID(),
        household,
        year,
        randomUUID(),
        "A gentle birthday celebration. Wave hello, reveal a colorful pretend birthday banner, and celebrate friendship. No names, numbers, candles, or personal details.",
        profile.character_id,
      ],
    );
  });
}
export async function releaseVideo(id: string, state: "failed" | "rejected") {
  await transaction(async (client) => {
    const row = (
      await client.query(
        "SELECT * FROM dll.video_requests WHERE id=$1 FOR UPDATE",
        [id],
      )
    ).rows[0];
    if (!row || ["ready", "failed", "rejected"].includes(row.state)) return;
    await client.query(
      "UPDATE dll.video_requests SET state=$2,updated_at=now() WHERE id=$1",
      [id, state],
    );
    if (row.period_id)
      await client.query(
        "INSERT INTO dll.credit_ledger(period_id,request_id,action,quantity) VALUES($1,$2,'release',-1) ON CONFLICT DO NOTHING",
        [row.period_id, id],
      );
  });
}
