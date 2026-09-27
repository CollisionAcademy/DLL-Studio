import nextEnv from "@next/env";
import pg from "pg";
import { readFile } from "node:fs/promises";
nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL)
  throw new Error(
    "Set DATABASE_URL to the intended DLL database before running migrations.",
  );
const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
await client.connect();
try {
  await client.query("BEGIN");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('dll-membership-migrations'))",
  );
  await client.query(
    await readFile(
      new URL("../migrations/001_membership.sql", import.meta.url),
      "utf8",
    ),
  );
  await client.query("COMMIT");
  console.log(
    "DLL membership migration applied. Existing schemas were not modified.",
  );
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
