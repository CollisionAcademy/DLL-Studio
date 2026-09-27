import { z } from "zod";
import {
  account,
  entitled,
  originCheck,
  bodyJson,
  failure,
  AccessError,
} from "@/lib/membership/access";
import { transaction } from "@/lib/membership/db";
import {
  readRewards,
  startChallenge,
  completeChallenge,
} from "@/lib/membership/badge-store";
export async function GET() {
  try {
    const user = await account();
    const rewards = await transaction(async (client) => {
      await client.query(
        "SELECT id FROM dll.households WHERE id=$1 FOR UPDATE",
        [user.id],
      );
      return readRewards(client, user.id);
    });
    return Response.json(rewards, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}
const inputSchema = z.discriminatedUnion("action", [
  z
    .object({ action: z.literal("start"), badgeId: z.string().max(50) })
    .strict(),
  z
    .object({
      action: z.literal("complete"),
      id: z.uuid(),
      answer: z.number().int().min(0).max(20),
    })
    .strict(),
]);
export async function POST(request: Request) {
  try {
    originCheck(request);
    const user = await entitled("badges");
    const input = inputSchema.safeParse(await bodyJson(request));
    if (!input.success)
      throw new AccessError("Choose one of the challenge buttons.", 400);
    const result = await transaction<unknown>((client) =>
      input.data.action === "start"
        ? startChallenge(client, user.id, input.data.badgeId)
        : completeChallenge(client, user.id, input.data.id, input.data.answer),
    );
    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}
