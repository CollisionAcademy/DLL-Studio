import "server-only";
import { Pool, type PoolClient } from "pg";
import { databaseUrl } from "./database-url";
let pool: Pool | undefined;
export function db() {
  if (!process.env.DATABASE_URL)
    throw new Error("Membership database is not configured.");
  return (pool ??= new Pool({
    connectionString: databaseUrl(process.env.DATABASE_URL),
    max: 5,
    connectionTimeoutMillis: 8000,
    statement_timeout: 15000,
  }));
}
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
