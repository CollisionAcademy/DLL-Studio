import {
  account,
  AccessError,
  bodyJson,
  failure,
  originCheck,
} from "@/lib/membership/access";
import { priceFor, planForPrice, stripe } from "@/lib/membership/billing";
import { transaction } from "@/lib/membership/db";
import { isPlan, plans, type PlanKey } from "@/lib/membership/plans";
export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  try {
    originCheck(request);
    const user = await account(true);
    const { action } = await context.params;
    if (user.isAdmin && action === "checkout")
      throw new AccessError(
        "Your administrator account already has full access without a subscription.",
        409,
      );
    const base = new URL(request.url).origin;
    const result = await transaction(async (client) => {
      const household = (
        await client.query(
          "SELECT * FROM dll.households WHERE id=$1 FOR UPDATE",
          [user.id],
        )
      ).rows[0];
      if (!household.parent_confirmed_at)
        throw new AccessError(
          "Confirm that you are the parent or guardian in your parent dashboard first.",
        );
      const api = stripe();
      if (action === "portal") {
        if (!household.customer_id)
          throw new AccessError("There is no billing account yet.", 409);
        return api.billingPortal.sessions.create({
          customer: household.customer_id,
          return_url: `${base}/parent`,
        });
      }
      if (action !== "checkout") throw new AccessError("Unknown action.", 404);
      const body = await bodyJson(request);
      if (!isPlan(body.plan) || body.plan === "crew")
        throw new AccessError("Choose a paid plan.", 400);
      const plan: Exclude<PlanKey, "crew"> = body.plan;
      if (process.env.DLL_CHECKOUT_ENABLED !== "true")
        throw new AccessError("Membership checkout is not open yet.", 503);
      const price = priceFor(body.plan);
      if (!price || planForPrice(price) !== plan)
        throw new AccessError(
          "This plan is not available for checkout yet.",
          503,
        );
      const configured = await api.prices.retrieve(price);
      if (
        !configured.active ||
        configured.currency !== "usd" ||
        configured.unit_amount !== plans[plan].cents ||
        configured.recurring?.interval !== "month" ||
        configured.recurring.interval_count !== 1
      )
        throw new AccessError(
          "This plan’s billing setup needs attention.",
          503,
        );
      let customer = household.customer_id;
      if (!customer) {
        customer = (
          await api.customers.create(
            { metadata: { application: "dll-studios", household_id: user.id } },
            { idempotencyKey: `dll-customer-${user.id}` },
          )
        ).id;
        await client.query(
          "UPDATE dll.households SET customer_id=$2 WHERE id=$1",
          [user.id, customer],
        );
      }
      const subscriptions = await api.subscriptions.list({
        customer,
        status: "all",
        limit: 100,
      });
      if (
        subscriptions.data.some(
          (s) => !["canceled", "incomplete_expired"].includes(s.status),
        )
      )
        throw new AccessError(
          "You already have a subscription. Manage it from the billing portal.",
          409,
        );
      const sessions = await api.checkout.sessions.list({
        customer,
        status: "open",
        limit: 100,
      });
      const open = sessions.data.find(
        (s) =>
          s.mode === "subscription" &&
          s.metadata?.application === "dll-studios",
      );
      if (open) {
        if (open.metadata?.plan !== body.plan)
          throw new AccessError(
            "Finish or cancel your existing checkout before choosing another plan.",
            409,
          );
        return open;
      }
      return api.checkout.sessions.create(
        {
          mode: "subscription",
          customer,
          line_items: [{ price, quantity: 1 }],
          metadata: { application: "dll-studios", plan: body.plan },
          subscription_data: { metadata: { application: "dll-studios" } },
          success_url: `${base}/parent?checkout=success`,
          cancel_url: `${base}/membership?checkout=cancelled`,
        },
        {
          idempotencyKey: `dll-checkout-${user.id}-${body.plan}-${Math.floor(Date.now() / 1800000)}`,
        },
      );
    });
    return Response.json({ url: result.url });
  } catch (error) {
    return failure(error);
  }
}
