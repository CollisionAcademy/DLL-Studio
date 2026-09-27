import fs from "node:fs";
import { parseEnv } from "node:util";
import Stripe from "stripe";
const root = process.argv.includes("--root-env");
const env = parseEnv(fs.readFileSync(root ? "../.env" : ".env.local", "utf8"));
if (!env.STRIPE_SECRET_KEY) throw Error("Stripe secret is not configured.");
const api = new Stripe(env.STRIPE_SECRET_KEY, {
  maxNetworkRetries: 0,
  timeout: 20000,
});
const mappings = [
  ["adventure", "STRIPE_DLL_ADVENTURE_CLUB_PRICE_ID", 499],
  ["super", "STRIPE_DLL_SUPER_CREW_PRICE_ID", 1299],
  ["family", "STRIPE_DLL_FAMILY_PRICE_ID", 2999],
];
let valid = true;
for (const [plan, name, cents] of mappings) {
  if (!env[name]) {
    console.log(JSON.stringify({ plan, configured: false }));
    valid = false;
    continue;
  }
  try {
    const price = await api.prices.retrieve(env[name]);
    const matches =
      price.active &&
      price.currency === "usd" &&
      price.unit_amount === cents &&
      price.recurring?.interval === "month" &&
      price.recurring?.interval_count === 1;
    valid &&= matches;
    console.log(
      JSON.stringify({
        plan,
        variable: name,
        active: price.active,
        livemode: price.livemode,
        currency: price.currency,
        amount: price.unit_amount,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count,
        matches,
      }),
    );
  } catch (error) {
    valid = false;
    console.log(
      JSON.stringify({
        plan,
        error: error.code || error.type || "verification_failed",
      }),
    );
  }
}
if (env.STRIPE_DLL_CREW_PRICE_ID)
  console.log(
    "Free DLL Crew remains public and does not require a Stripe subscription.",
  );
if (!valid) process.exitCode = 1;
