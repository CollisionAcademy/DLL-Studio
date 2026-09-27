import { stripe, syncSubscription } from "@/lib/membership/billing";
import type Stripe from "stripe";
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") || "",
      secret,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    let id: string | undefined;
    if (event.type.startsWith("customer.subscription."))
      id = (event.data.object as Stripe.Subscription).id;
    if (event.type.startsWith("invoice.")) {
      const subscription = (event.data.object as Stripe.Invoice).parent
        ?.subscription_details?.subscription;
      id = typeof subscription === "string" ? subscription : subscription?.id;
    }
    if (id) await syncSubscription(event.id, id);
    return Response.json({ received: true });
  } catch {
    return new Response("Retry delivery", { status: 500 });
  }
}
