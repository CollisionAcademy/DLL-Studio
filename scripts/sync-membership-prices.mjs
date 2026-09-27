import fs from "node:fs";
import { parseEnv } from "node:util";
// Copy only DLL membership price mappings and their Stripe secret from the
// workspace root. Do not import other products, databases, or webhook secrets.
const root = parseEnv(fs.readFileSync("../.env", "utf8"));
const keys = [
  "STRIPE_DLL_ADVENTURE_CLUB_PRICE_ID",
  "STRIPE_DLL_SUPER_CREW_PRICE_ID",
  "STRIPE_DLL_FAMILY_PRICE_ID",
  "STRIPE_SECRET_KEY",
];
if (keys.some((key) => !root[key]))
  throw Error(
    "The root environment is missing a membership price or Stripe secret.",
  );
const path = ".env.local";
let content = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
content = content
  .split(/\r?\n/)
  .filter(
    (line) => !keys.some((key) => new RegExp(`^\\s*${key}\\s*=`).test(line)),
  )
  .join("\n")
  .trimEnd();
content +=
  "\n\n# DLL membership Stripe configuration, synced from the workspace root.\n";
for (const key of keys) content += `${key}=${JSON.stringify(root[key])}\n`;
fs.writeFileSync(path, content);
console.log(
  "Synced three DLL Price IDs and the Stripe secret into ignored website/.env.local. Other settings were preserved.",
);
