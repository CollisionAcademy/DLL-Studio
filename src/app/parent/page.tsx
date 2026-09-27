"use client";
import { useState } from "react";
import Link from "next/link";
import { useAccount } from "@/components/membership/use-account";
import { videoStateLabel } from "@/lib/membership/video-status";
import { characters } from "@/lib/characters";
import { hasEntitlement, plans, planKeys } from "@/lib/membership/plans";
export default function ParentPage() {
  const { data, error, needsSignIn, busy, load, act } = useAccount(true);
  const limitReached = Boolean(
    data && !data.isAdmin && data.credits.remaining <= 0,
  );
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [message, setMessage] = useState("");
  const [script, setScript] = useState("");
  const [requestKey, setRequestKey] = useState<string | null>(null);
  async function submit(action: string, body: unknown) {
    const result = await act(action, body);
    if (result && action !== "video") setMessage(result.message);
    return result;
  }
  return (
    <main id="main" className="page-wrap member-page">
      <div className="member-top">
        <span className="eyebrow">THE GROWN-UP SEAT</span>
      </div>
      <h1>Your family’s adventures.</h1>
      <p>
        Manage membership, birthday surprises, and stories you create together.
        Your member login also opens these settings. For protected changes, we
        may ask you to confirm it’s you.
      </p>
      <nav className="member-nav">
        <Link href="/member">Member clubhouse</Link>
        <Link href="/membership">Compare plans</Link>
        <Link href="/parents/safety">Safety & privacy</Link>
      </nav>
      {error && (
        <div role="alert" className="member-notice">
          {error} {needsSignIn && <Link href="/login">Sign in →</Link>}
        </div>
      )}
      {message && (
        <p role="status" className="member-notice">
          {message}
        </p>
      )}
      {!data ? (
        needsSignIn ? null : (
          <button
            disabled={busy}
            onClick={() => void load()}
            className="button button-blue"
          >
            {busy ? "Opening…" : "Try again"}
          </button>
        )
      ) : (
        <>
          {!data.parent?.parent_confirmed_at && (
            <section className="member-panel">
              <h2>First, a grown-up hello.</h2>
              <p>
                This account is for a parent or legal guardian. You manage
                purchases, profile information, and story submissions. Children
                should use the clubhouse with your supervision.
              </p>
              <button
                className="button button-blue"
                disabled={busy}
                onClick={() =>
                  void submit("confirm-parent", { confirmed: true })
                }
              >
                I am the parent or legal guardian
              </button>
            </section>
          )}
          <section className="member-panel">
            <span className="eyebrow">YOUR MEMBERSHIP</span>
            <h2>
              {data.isAdmin ? "DLL Administrator" : plans[data.plan].name}
            </h2>
            <p>
              {data.isAdmin
                ? "Full membership access. No subscription or monthly video credits required."
                : data.cancelAtPeriodEnd
                  ? "Your membership will end after the current paid period."
                  : plans[data.plan].tagline}
            </p>
            {data.isAdmin && (
              <Link className="button button-blue" href="/parent/review">
                Open administrator review
              </Link>
            )}
            {!data.isAdmin && (
              <>
                <div className="membership-actions">
                  <button
                    className="button button-blue"
                    disabled={busy}
                    onClick={() => void act("portal", {}, true)}
                  >
                    Manage billing
                  </button>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => void load()}
                  >
                    Refresh membership
                  </button>
                </div>
                <p>
                  Just checked out? Your access appears after payment
                  confirmation. Refresh in a moment.
                </p>
                <div className="parent-plan-options">
                  {planKeys
                    .filter((k) => k !== "crew")
                    .map((key) => (
                      <button
                        disabled={busy || !data.parent?.parent_confirmed_at}
                        key={key}
                        onClick={() =>
                          void act("checkout", { plan: key }, true)
                        }
                      >
                        {plans[key].name}
                        <strong>
                          ${(plans[key].cents / 100).toFixed(2)}/month
                        </strong>
                      </button>
                    ))}
                </div>
              </>
            )}
          </section>
          <div className="member-columns">
            <section className="member-panel">
              <span className="eyebrow">A LITTLE BIRTHDAY MAGIC</span>
              <h2>A surprise from the crew.</h2>
              {hasEntitlement(data.plan, "birthday_video") ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    await submit("profile", {
                      character: f.get("character"),
                      month: Number(f.get("month")),
                      day: Number(f.get("day")),
                      timezone: f.get("timezone"),
                      consent: f.get("consent") === "on",
                    });
                  }}
                >
                  <label>
                    Favorite character
                    <select
                      name="character"
                      defaultValue={data.parent?.character_id || "luca"}
                    >
                      {characters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="member-columns">
                    <label>
                      Birthday month
                      <input
                        name="month"
                        type="number"
                        min="1"
                        max="12"
                        required
                        defaultValue={data.parent?.birthday_month || undefined}
                      />
                    </label>
                    <label>
                      Birthday day
                      <input
                        name="day"
                        type="number"
                        min="1"
                        max="31"
                        required
                        defaultValue={data.parent?.birthday_day || undefined}
                      />
                    </label>
                  </div>
                  <label>
                    Household timezone
                    <input
                      name="timezone"
                      required
                      defaultValue={data.parent?.timezone || "America/New_York"}
                    />
                  </label>
                  <label className="checkbox-label">
                    <input name="consent" type="checkbox" required />I permit
                    DLL to store this birthday month/day for a private greeting.
                    I can remove it below.
                  </label>
                  <p>
                    No name or birth year needed. One 10-second greeting per
                    year, queued on or after the birthday at your next visit.
                    February 29 is observed on February 28 in other years.
                  </p>
                  <button className="button button-blue" disabled={busy}>
                    Save birthday
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    disabled={busy}
                    onClick={() => void submit("delete-profile", {})}
                  >
                    Remove birthday & withdraw permission
                  </button>
                </form>
              ) : (
                <Locked text="Adventure Club includes birthday greetings." />
              )}
            </section>
            <section className="member-panel">
              <span className="eyebrow">CREATE THE ADVENTURE</span>
              <h2>Your idea. Their story.</h2>
              {hasEntitlement(data.plan, "custom_video") ? (
                <>
                  <p>
                    <strong>
                      {data.isAdmin
                        ? "Administrator access — no monthly credit limit"
                        : `${data.credits.remaining} of ${data.credits.video_limit} video credits available`}
                    </strong>
                    {data.credits.ends_at
                      ? ` · current period ends ${new Date(data.credits.ends_at).toLocaleDateString()}`
                      : ""}
                  </p>
                  {submissionMessage && (
                    <p role="status" className="member-notice">
                      {submissionMessage}
                    </p>
                  )}
                  {limitReached && (
                    <p className="member-notice" role="status">
                      Your video allowance for this billing month is used. Sent
                      submissions are on your video shelf below.
                      {data.credits.ends_at
                        ? ` New credits arrive after your paid renewal on ${new Date(data.credits.ends_at).toLocaleDateString()}.`
                        : " New credits arrive after your next paid renewal."}
                    </p>
                  )}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (limitReached || busy) return;
                      const f = new FormData(e.currentTarget);
                      const key = requestKey || crypto.randomUUID();
                      setRequestKey(key);
                      const result = await submit("video", {
                        script,
                        character: f.get("character"),
                        requestKey: key,
                      });
                      if (result) {
                        setSubmissionMessage(result.message);
                        setScript("");
                        setRequestKey(null);
                      }
                    }}
                  >
                    <fieldset
                      disabled={busy || limitReached}
                      className={`story-submission${limitReached ? " is-exhausted" : ""}`}
                    >
                      <legend className="sr-only">
                        Submit a custom adventure
                      </legend>
                      <label>
                        Story’s star
                        <select name="character">
                          {characters.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        A gentle adventure idea
                        <textarea
                          required
                          maxLength={500}
                          value={script}
                          onChange={(e) => {
                            setScript(e.target.value);
                            setRequestKey(null);
                          }}
                          placeholder="Leo builds a wobbly tower, then discovers a wider base helps it stand."
                        />
                      </label>
                      <span className="character-count">
                        {script.length}/500 characters
                      </span>
                      <p>
                        Parent submissions only. Use fictional DLL characters;
                        leave out real names, addresses, schools, and personal
                        details. The finished adventure is approximately 15
                        seconds. Rejected or confirmed failed requests release
                        the reserved credit.
                      </p>
                      <button
                        disabled={
                          busy || (!data.isAdmin && data.credits.remaining < 1)
                        }
                        className="button button-yellow"
                      >
                        {busy
                          ? "Saving…"
                          : data.isAdmin
                            ? "Submit story · administrator"
                            : "Submit story · 1 credit"}
                      </button>
                    </fieldset>
                  </form>
                </>
              ) : (
                <Locked text="Super Crew includes one custom video each billing month; Family Pass includes two." />
              )}
            </section>
          </div>
          <section className="member-panel">
            <h2>Your video shelf.</h2>
            <p>
              Finished videos are added here automatically and stay private.
              Publishing permission is optional and still requires a separate
              staff publishing step.
            </p>
            {!data.videos.length && (
              <p>
                No videos yet. Your birthday and custom adventures will appear
                here.
              </p>
            )}
            <div className="member-columns">
              {data.videos.map((v) => (
                <article className="video-card" key={v.id}>
                  <h3>
                    {v.kind === "birthday"
                      ? "Birthday surprise"
                      : "Custom adventure"}
                  </h3>
                  <p>
                    {v.duration_seconds} seconds · {videoStateLabel(v.state)}
                  </p>
                  {v.state === "ready" && (
                    <>
                      <video
                        controls
                        preload="none"
                        src={`/api/member/media/${v.id}`}
                        aria-label="Your private DLL video"
                      />
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={v.parent_publish}
                          disabled={busy}
                          onChange={(e) =>
                            void submit("publish", {
                              id: v.id,
                              permission: e.target.checked,
                            })
                          }
                        />
                        I give permission for DLL to consider publishing this
                        video.
                      </label>
                    </>
                  )}
                  {v.state === "uncertain" && (
                    <p>
                      We’re checking this generation. It will not be submitted
                      twice.
                    </p>
                  )}
                  {["failed", "rejected"].includes(v.state) && (
                    <p>
                      This request could not be completed. Any custom-video
                      credit was returned to its original billing period.
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
          <section className="member-panel">
            <h2>A little adventure, delivered.</h2>
            <p>
              Your shop benefit:{" "}
              {plans[data.plan].entitlements.shop_discount_percent}% off
              eligible items when the shop opens.
            </p>
            {data.boxes.length ? (
              data.boxes.map((b) => (
                <p key={b.id}>
                  Five-item DLL gift box #{b.id} ·{" "}
                  {b.state.replaceAll("_", " ")}
                </p>
              ))
            ) : (
              <p>
                No gift box allocations yet. Family Pass receives a five-item
                box entitlement each paid billing month.
              </p>
            )}
            <p>
              Shipping collection and fulfillment will be connected here. No
              shipping details are collected until that service is ready.
            </p>
            <Link className="text-button" href="/shop">
              Explore the DLL Shop →
            </Link>
          </section>
        </>
      )}
    </main>
  );
}
function Locked({ text }: { text: string }) {
  return (
    <div className="locked-feature">
      <p>{text}</p>
      <Link href="/membership" className="button button-blue">
        Explore membership options
      </Link>
    </div>
  );
}
