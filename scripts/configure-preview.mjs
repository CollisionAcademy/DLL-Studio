import fs from "node:fs";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";

// Deliberately limited to preview; secrets travel through stdin, never arguments.
const local = parseEnv(fs.readFileSync(".env.local", "utf8"));
const values = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: local.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: local.CLERK_SECRET_KEY,
  DATABASE_URL: local.DATABASE_URL,
  DLL_CHECKOUT_ENABLED: "false",
  DLL_VIDEO_DAILY_LIMIT: "0",
};
for (const [name, value] of Object.entries(values)) {
  if (!value) throw new Error(`Missing ${name}`);
  const result = spawnSync(
    process.platform === "win32" ? "cmd.exe" : "npx",
    process.platform === "win32"
      ? [
          "/d",
          "/s",
          "/c",
          `npx vercel env add ${name} preview --scope collision-academy-82dbb1d7 --yes --force ${name.startsWith("NEXT_PUBLIC_") || name.startsWith("DLL_") ? "--no-sensitive" : "--sensitive"}`,
        ]
      : [
          "vercel",
          "env",
          "add",
          name,
          "preview",
          "--scope",
          "collision-academy-82dbb1d7",
          "--yes",
          "--force",
        ],
    { input: value, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  );
  if (result.status !== 0)
    throw new Error(
      `Could not configure ${name}; Vercel exit ${result.status}`,
    );
  console.log(`Configured preview ${name}`);
}
