import type Stripe from "stripe";
import type { PoolClient } from "pg";
import { plans, type PlanKey } from "./plans.ts";
export async function applySubscriptionState(
  client: Pick<PoolClient, "query">,
  sub: Stripe.Subscription,
  resolvePlan: (id: string) => PlanKey | null,
) {
  const customer =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const household = (
    await client.query(
      "SELECT id FROM dll.households WHERE customer_id=$1 FOR UPDATE",
      [customer],
    )
  ).rows[0];
  if (!household || sub.metadata.application !== "dll-studios") return;
  const item = sub.items.data[0];
  if (!item) throw Error("Subscription has no billing item");
  const plan = sub.items.data.length === 1 ? resolvePlan(item.price.id) : null;
  const invoice = sub.latest_invoice as Stripe.Invoice | null;
  const paid =
    invoice?.status === "paid" &&
    invoice.amount_paid > 0 &&
    invoice.lines.data.some(
      (line) =>
        line.period.start === item.current_period_start &&
        line.period.end === item.current_period_end,
    ) &&
    ["subscription_create", "subscription_cycle"].includes(
      invoice.billing_reason || "",
    );
  const start = new Date(item.current_period_start * 1000);
  const end = new Date(item.current_period_end * 1000);
  const existing = (
    await client.query("SELECT * FROM dll.memberships WHERE household_id=$1", [
      household.id,
    ])
  ).rows[0];
  // Never grant an unpaid period; preserve already-paid access during renewal retries.
  if (plan && paid && sub.status === "active") {
    const periodId = `${sub.id}:${item.current_period_start}`;
    await client.query(
      "INSERT INTO dll.service_periods(id,household_id,subscription_id,starts_at,ends_at,plan_key,video_limit) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING",
      [
        periodId,
        household.id,
        sub.id,
        start,
        end,
        plan,
        plans[plan].entitlements.custom_video_monthly_limit,
      ],
    );
    const period = (
      await client.query("SELECT * FROM dll.service_periods WHERE id=$1", [
        periodId,
      ])
    ).rows[0];
    await client.query(
      `INSERT INTO dll.memberships(household_id,subscription_id,plan_key,status,period_start,period_end,cancel_at_period_end) VALUES($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT(household_id) DO UPDATE SET subscription_id=$2,plan_key=$3,status=$4,period_start=$5,period_end=$6,cancel_at_period_end=$7,updated_at=now()`,
      [
        household.id,
        sub.id,
        period.plan_key,
        sub.status,
        start,
        end,
        sub.cancel_at_period_end,
      ],
    );
    if (plans[period.plan_key as PlanKey].entitlements.gift_box)
      await client.query(
        "INSERT INTO dll.box_allocations(household_id,period_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [household.id, periodId],
      );
  } else if (existing?.subscription_id === sub.id) {
    await client.query(
      "UPDATE dll.memberships SET status=$2,cancel_at_period_end=$3,updated_at=now() WHERE household_id=$1",
      [household.id, plan ? sub.status : "unmapped", sub.cancel_at_period_end],
    );
  }
}
