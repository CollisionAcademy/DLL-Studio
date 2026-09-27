import fs from "node:fs";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";

const local = parseEnv(fs.readFileSync(".env.local", "utf8"));
const production = parseEnv(fs.readFileSync(".env.clerk-production", "utf8"));
if (!production.CLERK_SECRET_KEY?.startsWith("sk_live_"))
  throw new Error("Production Clerk keys required");
const values = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    production.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: production.CLERK_SECRET_KEY,
  DATABASE_URL: local.DATABASE_URL,
  STRIPE_SECRET_KEY: local.STRIPE_SECRET_KEY,
  APP_BASE_URL: "https://dll-studio.com",
  DLL_CHECKOUT_ENABLED: "false",
  DLL_VIDEO_DAILY_LIMIT: "0",
};
for (const [name, value] of Object.entries(values)) {
  if (!value) throw new Error(`Missing ${name}`);
  const args = [
    "vercel",
    "env",
    "add",
    name,
    "production",
    "--scope",
    "collision-academy-82dbb1d7",
    "--yes",
    "--force",
    name.startsWith("NEXT_PUBLIC_") ||
    name.startsWith("DLL_") ||
    name === "APP_BASE_URL"
      ? "--no-sensitive"
      : "--sensitive",
  ];
  const result =
    process.platform === "win32"
      ? spawnSync("cmd.exe", ["/d", "/s", "/c", `npx ${args.join(" ")}`], {
          input: value,
          encoding: "utf8",
        })
      : spawnSync("npx", args, { input: value, encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(`Could not configure ${name}; exit ${result.status}`);
  console.log(`Configured production ${name}`);
}
