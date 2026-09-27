"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  characterBadges,
  type BadgeRewards,
} from "@/lib/membership/badge-catalog";
import { requestJson } from "@/lib/membership/request";
type Challenge = {
  id: string;
  prompt: string;
  choices: number[];
  round: number;
  badgeId: string;
};
export function BadgeCollection() {
  const [rewards, setRewards] = useState<BadgeRewards | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (challenge) document.getElementById("badge-challenge-heading")?.focus();
  }, [challenge]);
  useEffect(() => {
    const controller = new AbortController();
    requestJson<BadgeRewards>("/api/member/rewards", {
      signal: controller.signal,
    })
      .then(setRewards)
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Please try again.");
      });
    return () => controller.abort();
  }, []);
  async function submit(body: object) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestJson<
        Challenge & { message?: string; correct?: boolean }
      >("/api/member/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.id) setChallenge(result);
      if (result.message) setMessage(result.message);
      if (result.correct) setChallenge(null);
      setRewards(await requestJson<BadgeRewards>("/api/member/rewards"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="member-panel">
        <span className="eyebrow">25 BADGES · ONE $10 STORE REWARD</span>
        <h2>Little challenges. A gift for your family.</h2>
        <p>
          Complete a counting challenge for each of the 25 character-themed
          badges. Each badge earns 10 adventure points. Collect the whole set to
          earn $10 in merchandise credit, then start a fresh collection with new
          challenges.
        </p>
        <p>
          Character challenges are included with Adventure Club, Super Crew, and
          Family Pass.
        </p>
        <p>
          Your completed sets and lifetime points stay with you. The Idea Helper
          voting badge is a separate achievement and does not count toward this
          collection.
        </p>
        {rewards && (
          <>
            <p>
              <strong>
                Collection {rewards.round}: {rewards.earned.length} / 25 badges
              </strong>
            </p>
            <progress
              aria-label="Character badge collection"
              value={rewards.earned.length}
              max={25}
            />
            <p>
              {rewards.lifetimePoints} lifetime character challenge points ·{" "}
              <strong>
                ${(rewards.balanceCents / 100).toFixed(2)} store credit saved
              </strong>
            </p>
          </>
        )}
        <p>
          Merchandise checkout is coming soon. Your earned credit will be saved
          for then. A grown-up manages purchases. Credit applies to merchandise
          only, excluding membership fees, video credits, shipping, and taxes;
          unused credit stays on your account.
        </p>
        <Link href="/shop#merchandise" className="text-button">
          Explore the shop →
        </Link>
      </section>
      {error && (
        <p role="alert" className="member-notice">
          {error} <Link href="/login">Member login</Link> ·{" "}
          <Link href="/shop#plans">Compare plans</Link>
        </p>
      )}
      <p role="status" className={message ? "member-notice" : ""}>
        {message}
      </p>
      {!rewards && !error && (
        <p role="status">Opening your badge collection…</p>
      )}
      {challenge && (
        <section
          className="member-panel"
          aria-labelledby="badge-challenge-heading"
        >
          <h2 id="badge-challenge-heading" tabIndex={-1}>
            {characterBadges.find((b) => b.id === challenge.badgeId)?.title}
          </h2>
          <p>{challenge.prompt}</p>
          <div className="badge-answers">
            {challenge.choices.map((choice) => (
              <button
                className="button button-blue"
                key={choice}
                disabled={busy}
                onClick={() =>
                  void submit({
                    action: "complete",
                    id: challenge.id,
                    answer: choice,
                  })
                }
              >
                {choice}
              </button>
            ))}
          </div>
          <button
            className="text-button"
            disabled={busy}
            onClick={() => setChallenge(null)}
          >
            Choose another badge
          </button>
        </section>
      )}
      {rewards && (
        <>
          <div className="badge-grid">
            {characterBadges.map((badge) => {
              const earned = rewards.earned.includes(badge.id);
              return (
                <article
                  className={`member-panel badge-card${earned ? " badge-earned" : ""}`}
                  key={badge.id}
                >
                  <Image
                    src={`/characters/${badge.character}.png`}
                    width={88}
                    height={88}
                    alt={badge.name}
                  />
                  <h3>{badge.title}</h3>
                  <p>{badge.name}</p>
                  <button
                    className="button button-blue"
                    disabled={busy || earned}
                    onClick={() => {
                      setChallenge(null);
                      void submit({ action: "start", badgeId: badge.id });
                    }}
                  >
                    {earned ? "✓ Collected" : "Try the challenge"}
                  </button>
                </article>
              );
            })}
          </div>
          <section className="member-panel">
            <h2>Your Trophy Book</h2>
            <p>
              Every completed collection stays here—even when you start again.
            </p>
            {rewards.trophies.length ? (
              rewards.trophies.map((t) => (
                <details key={t.round}>
                  <summary>
                    🏆 Collection {t.round} · 25 badges · $10 reward earned
                  </summary>
                  <ul>
                    {characterBadges.map((b) => (
                      <li key={b.id}>
                        {b.name}: {b.title}
                      </li>
                    ))}
                  </ul>
                </details>
              ))
            ) : (
              <p>
                Your first trophy is waiting. Collect all 25 badges to earn it.
              </p>
            )}
          </section>
        </>
      )}
    </>
  );
}
