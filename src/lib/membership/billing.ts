import "server-only";
import Stripe from "stripe";
import { type PlanKey } from "./plans";
import { applySubscriptionState } from "./billing-store";
import { transaction } from "./db";
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw Error("Stripe unavailable");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export const priceVariables = {
  adventure: "STRIPE_DLL_ADVENTURE_CLUB_PRICE_ID",
  super: "STRIPE_DLL_SUPER_CREW_PRICE_ID",
  family: "STRIPE_DLL_FAMILY_PRICE_ID",
} as const;
export function priceFor(plan: Exclude<PlanKey, "crew">) {
  return process.env[priceVariables[plan]]?.trim();
}
export function planForPrice(id: string): PlanKey | null {
  const entries = Object.entries(priceVariables).filter(
    ([, variable]) => process.env[variable]?.trim() === id,
  );
  return entries.length === 1 ? (entries[0][0] as PlanKey) : null;
}
// Serialize per subscription and retrieve current provider state under the lock.
// This makes delivery retries and out-of-order subscription events harmless.
export async function syncSubscription(
  eventId: string,
  subscriptionId: string,
) {
  return transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      subscriptionId,
    ]);
    if (
      (
        await client.query("SELECT id FROM dll.billing_events WHERE id=$1", [
          eventId,
        ])
      ).rowCount
    )
      return;
    const sub = await stripe().subscriptions.retrieve(subscriptionId, {
      expand: ["latest_invoice"],
    });
    await applySubscriptionState(client, sub, planForPrice);
    await client.query(
      "INSERT INTO dll.billing_events(id) VALUES($1) ON CONFLICT DO NOTHING",
      [eventId],
    );
  });
}
