export const planKeys = ["crew", "adventure", "super", "family"] as const;
export type PlanKey = (typeof planKeys)[number];
const free = {
  member_content: false,
  character_play: false,
  birthday_video: false,
  custom_video: false,
  custom_video_monthly_limit: 0,
  shop_discount_percent: 0,
  gift_box: false,
  early_access: false,
  first_access: false,
  activities: false,
  voting: false,
  badges: false,
  story_vault: true,
};
const club = {
  ...free,
  member_content: true,
  character_play: true,
  birthday_video: true,
  activities: true,
  voting: true,
  badges: true,
  story_vault: true,
};
const creator = {
  ...club,
  custom_video: true,
  custom_video_monthly_limit: 1,
  shop_discount_percent: 10,
  early_access: true,
};
export const plans = {
  crew: {
    name: "DLL Crew",
    tagline: "Watch the Adventure",
    verb: "Watch",
    cents: 0,
    entitlements: free,
    benefits: [
      "Public episodes & Shorts",
      "Meet all six characters",
      "Adventures, comedy & our public playroom",
    ],
  },
  adventure: {
    name: "DLL Adventure Club",
    tagline: "Join the Adventure",
    verb: "Join",
    cents: 499,
    entitlements: club,
    benefits: [
      "Everything in DLL Crew",
      "Members-only stories & activities",
      "Play With the Crew: choice-only fun",
      "A 10-second birthday video",
      "Games, riddles, polls & badges",
    ],
  },
  super: {
    name: "DLL Super Crew",
    tagline: "Create the Adventure",
    verb: "Create",
    cents: 1299,
    entitlements: creator,
    benefits: [
      "Everything in Adventure Club",
      "1 custom adventure video each billing month",
      "Your idea, a roughly 15-second DLL story",
      "10% off eligible DLL Shop items",
      "Early access to new adventures",
    ],
  },
  family: {
    name: "DLL Family Pass",
    tagline: "Bring the Adventure Home",
    verb: "Bring it home",
    cents: 2999,
    entitlements: {
      ...creator,
      custom_video_monthly_limit: 2,
      shop_discount_percent: 15,
      gift_box: true,
      first_access: true,
    },
    benefits: [
      "Everything in Super Crew",
      "2 custom videos each billing month in total",
      "15% off eligible DLL Shop items",
      "First access to new adventures",
      "A recurring five-item DLL gift box",
    ],
  },
} as const;
export type Entitlement = keyof typeof free;
export function isPlan(value: unknown): value is PlanKey {
  return typeof value === "string" && planKeys.includes(value as PlanKey);
}
export function hasEntitlement(plan: PlanKey, feature: Entitlement) {
  return Boolean(plans[plan].entitlements[feature]);
}
export function effectivePlan(
  membership:
    { plan_key: string; status: string; period_end: string | Date } | undefined,
  now = new Date(),
): PlanKey {
  return membership &&
    isPlan(membership.plan_key) &&
    ["active", "past_due"].includes(membership.status) &&
    new Date(membership.period_end) > now
    ? membership.plan_key
    : "crew";
}
export function birthdayOccurrence(
  month: number,
  day: number,
  timezone: string,
  now = new Date(),
) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const year = part("year");
  const observedDay =
    month === 2 &&
    day === 29 &&
    new Date(Date.UTC(year, 2, 0)).getUTCDate() === 28
      ? 28
      : day;
  return part("month") * 100 + part("day") >= month * 100 + observedDay
    ? year
    : null;
}
