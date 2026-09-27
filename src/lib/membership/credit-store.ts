import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { AccessError } from "./errors.ts";
import { effectivePlan, hasEntitlement } from "./plans.ts";
export async function reserveVideoTransaction(
  client: Pick<PoolClient, "query">,
  household: string,
  input: { requestKey: string; script: string; character: string },
  administrator = false,
) {
  await client.query("SELECT id FROM dll.households WHERE id=$1 FOR UPDATE", [
    household,
  ]);
  const existing = (
    await client.query(
      "SELECT id,script,character_id FROM dll.video_requests WHERE household_id=$1 AND request_key=$2",
      [household, input.requestKey],
    )
  ).rows[0];
  if (existing) {
    if (
      existing.script !== input.script ||
      existing.character_id !== input.character
    ) {
      throw new AccessError(
        "This submission key already belongs to a different story. Start a new request.",
        409,
      );
    }
    return existing.id as string;
  }
  if (administrator) {
    const id = randomUUID();
    await client.query(
      "INSERT INTO dll.video_requests(id,household_id,kind,request_key,script,character_id,duration_seconds) VALUES($1,$2,'custom',$3,$4,$5,15)",
      [id, household, input.requestKey, input.script, input.character],
    );
    await client.query(
      "INSERT INTO dll.audit(actor,action,target) VALUES($1,'admin-video-request',$2)",
      [household, id],
    );
    return id;
  }
  const membership = (
    await client.query("SELECT * FROM dll.memberships WHERE household_id=$1", [
      household,
    ])
  ).rows[0];
  if (!hasEntitlement(effectivePlan(membership), "custom_video"))
    throw new AccessError("Upgrade to create your own adventure.");
  const period = (
    await client.query(
      "SELECT * FROM dll.service_periods WHERE household_id=$1 AND starts_at<=now() AND ends_at>now() ORDER BY starts_at DESC LIMIT 1 FOR UPDATE",
      [household],
    )
  ).rows[0];
  if (!period)
    throw new AccessError(
      "Your paid billing period is not available yet.",
      409,
    );
  const used = Number(
    (
      await client.query(
        "SELECT COALESCE(sum(quantity),0) AS used FROM dll.credit_ledger WHERE period_id=$1",
        [period.id],
      )
    ).rows[0].used,
  );
  if (used >= period.video_limit)
    throw new AccessError(
      "All this month’s video credits are in use. Your next credits arrive after your next paid renewal.",
      409,
    );
  const recent = (
    await client.query(
      "SELECT count(*) AS count FROM dll.video_requests WHERE household_id=$1 AND created_at>now()-interval '1 day'",
      [household],
    )
  ).rows[0];
  if (Number(recent.count) >= 8)
    throw new AccessError("Please try again tomorrow.", 429);
  const id = randomUUID();
  await client.query(
    "INSERT INTO dll.video_requests(id,household_id,period_id,kind,request_key,script,character_id,duration_seconds) VALUES($1,$2,$3,'custom',$4,$5,$6,15)",
    [id, household, period.id, input.requestKey, input.script, input.character],
  );
  await client.query(
    "INSERT INTO dll.credit_ledger(period_id,request_id,action,quantity) VALUES($1,$2,'reserve',1)",
    [period.id, id],
  );
  return id;
}
