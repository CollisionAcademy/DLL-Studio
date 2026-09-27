"use client";
import Link from "next/link";
import { useAccount } from "@/components/membership/use-account";
import {
  plans,
  hasEntitlement,
  type Entitlement,
} from "@/lib/membership/plans";
const destinations: {
  href: string;
  title: string;
  description: string;
  icon: string;
  feature: Entitlement;
}[] = [
  {
    href: "badges",
    title: "Badges & rewards",
    description:
      "Collect 25 character badges, earn $10 in store credit, and start a new collection.",
    icon: "🏆",
    feature: "badges",
  },
  {
    href: "play",
    title: "Play With the Crew",
    description:
      "Little choices. Big laughs. Games, jokes, riddles, and gentle stories.",
    icon: "✳",
    feature: "character_play",
  },
  {
    href: "episodes",
    title: "The watch nook",
    description: "Settle in for members-only episodes and early adventures.",
    icon: "▶",
    feature: "member_content",
  },
  {
    href: "stories",
    title: "The story vault",
    description: "Open a little world of funny tales and everyday heroes.",
    icon: "▤",
    feature: "story_vault",
  },
  {
    href: "activities",
    title: "Make time for play",
    description: "Download an activity and take the adventure off screen.",
    icon: "✎",
    feature: "activities",
  },
  {
    href: "vote",
    title: "Pick the next adventure",
    description: "Help the crew choose a new story. Every idea counts.",
    icon: "★",
    feature: "voting",
  },
];
export default function MemberHome() {
  const { data, error, busy, load } = useAccount();
  return (
    <main id="main" className="page-wrap member-page">
      <span className="eyebrow">YOUR LITTLE CORNER OF DLL</span>
      <h1>Welcome to the clubhouse.</h1>
      <p>A story to discover. A game to share. A whole crew to cheer you on.</p>
      <nav className="member-nav">
        <Link href="/parent">Grown-up controls</Link>
        <Link href="/">The free DLL world</Link>
      </nav>
      {error && (
        <div role="alert" className="member-notice">
          {error} <Link href="/login">Sign in →</Link>{" "}
          <button onClick={() => void load()} className="text-button">
            Try again
          </button>
        </div>
      )}
      {busy && !data && <p role="status">Opening the clubhouse…</p>}
      {data && (
        <>
          <div className="member-banner">
            <strong>
              {data.isAdmin ? "DLL Administrator" : plans[data.plan].name}
            </strong>
            <span>
              {data.badges.reduce((sum, b) => sum + b.points, 0) +
                (data.characterPoints || 0)}{" "}
              adventure points ·{" "}
              {data.badges.length + (data.characterBadgeCount || 0)} badges
              earned
            </span>
          </div>
          <div className="member-destinations">
            {destinations.map((d) => (
              <Link
                href={
                  hasEntitlement(data.plan, d.feature)
                    ? `/member/${d.href}`
                    : "/membership"
                }
                className="member-destination"
                key={d.href}
              >
                <span>{d.icon}</span>
                <h2>{d.title}</h2>
                <p>{d.description}</p>
                <b>
                  {hasEntitlement(data.plan, d.feature)
                    ? "Let’s explore →"
                    : "Grown-ups: explore memberships →"}
                </b>
              </Link>
            ))}
          </div>
          <section className="member-panel">
            <h2>A birthday hello.</h2>
            {data.videos
              .filter((v) => v.kind === "birthday" && v.state === "ready")
              .map((v) => (
                <video
                  key={v.id}
                  controls
                  preload="none"
                  src={`/api/member/media/${v.id}`}
                  aria-label="Your birthday greeting"
                />
              ))}
            {!data.videos.some(
              (v) => v.kind === "birthday" && v.state === "ready",
            ) && (
              <p>
                A grown-up can set up your birthday surprise. When it’s ready,
                it will be waiting here.
              </p>
            )}
          </section>
          <section className="member-panel">
            <h2>Your little celebrations.</h2>
            <Link href="/member/badges" className="text-button">
              Open your badge collection & Trophy Book →
            </Link>
            {data.badges.length ? (
              data.badges.map((b) => (
                <p key={b.badge_id}>
                  ★ {b.badge_id.replaceAll("-", " ")} · {b.points} points
                </p>
              ))
            ) : (
              <p>
                No badges yet. Share a choice in the member poll to earn the
                Idea Helper badge. No streaks, timers, or hurry.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
