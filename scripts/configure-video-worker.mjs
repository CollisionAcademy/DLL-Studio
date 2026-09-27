import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
const path = ".env.video-worker";
const secret = fs.existsSync(path)
  ? fs.readFileSync(path, "utf8").trim().split("=")[1]
  : randomBytes(32).toString("hex");
fs.writeFileSync(path, "CRON_SECRET=" + secret + "\n");
for (const [name, value] of Object.entries({
  CRON_SECRET: secret,
  DLL_VIDEO_DAILY_LIMIT: "10",
})) {
  const result = spawnSync(
    "cmd.exe",
    [
      "/d",
      "/s",
      "/c",
      `npx vercel env add ${name} production --scope collision-academy-82dbb1d7 --yes --force ${name === "CRON_SECRET" ? "--sensitive" : "--no-sensitive"}`,
    ],
    { input: value, encoding: "utf8" },
  );
  if (result.status !== 0) throw Error("Could not configure " + name);
  console.log("Configured " + name);
}
