import "server-only";
import {
  auth,
  currentUser,
  reverificationErrorResponse,
} from "@clerk/nextjs/server";
import { isAdministratorIdentity } from "./admin-policy";
import { db } from "./db";
import { effectivePlan, hasEntitlement, type Entitlement } from "./plans";
import { AccessError } from "./errors";
export { AccessError } from "./errors";
export function authConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}
export async function account(parent = false) {
  if (!authConfigured() || !process.env.DATABASE_URL)
    throw new AccessError(
      "Parent accounts are being prepared. Please check back soon.",
      503,
    );
  const session = await auth();
  if (!session.userId)
    throw new AccessError("Please sign in to your parent account.", 401);
  if (parent && !session.has({ reverification: "strict" }))
    throw new AccessError(
      "Please verify your parent sign-in again to continue.",
      428,
    );
  await db().query(
    "INSERT INTO dll.households(id) VALUES($1) ON CONFLICT DO NOTHING",
    [session.userId],
  );
  const membership = (
    await db().query("SELECT * FROM dll.memberships WHERE household_id=$1", [
      session.userId,
    ])
  ).rows[0];
  const identity = await currentUser();
  const isAdmin =
    Boolean(identity && isAdministratorIdentity(identity)) ||
    (process.env.DLL_ADMIN_USER_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .includes(session.userId);
  return {
    id: session.userId,
    plan: isAdmin ? ("family" as const) : effectivePlan(membership),
    membership,
    isAdmin,
  };
}
export async function entitled(feature: Entitlement, parent = false) {
  const user = await account(parent);
  if (!hasEntitlement(user.plan, feature))
    throw new AccessError(
      "This adventure needs a membership upgrade. Grown-ups can compare plans.",
    );
  return user;
}
export function originCheck(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const hostOrigin = `${url.protocol}//${request.headers.get("host")}`;
  if (!origin || (origin !== url.origin && origin !== hostOrigin))
    throw new AccessError("Please use the DLL website to make this change.");
}
export async function bodyJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new AccessError("A request is required.", 400);
  let text = "";
  let size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) {
        await reader.cancel();
        throw new AccessError("This request is too large.", 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof AccessError) throw error;
    throw new AccessError("Please check your request.", 400);
  } finally {
    reader.releaseLock();
  }
}
export function failure(error: unknown) {
  if (error instanceof AccessError && error.status === 428)
    return reverificationErrorResponse("strict");
  if (error instanceof AccessError)
    return Response.json(
      {
        error: error.message,
        upgradeUrl: error.status === 403 ? "/membership" : undefined,
      },
      { status: error.status },
    );
  console.error(
    "Membership operation failed",
    error instanceof Error ? error.name : "unknown",
  );
  return Response.json(
    { error: "We couldn’t finish that request. Please try again shortly." },
    { status: 503 },
  );
}
