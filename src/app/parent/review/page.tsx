"use client";
import Link from "next/link";
import { useState } from "react";
import { useReverification } from "@clerk/nextjs";
type ReviewVideo = {
  id: string;
  kind: string;
  script: string;
  character_id: string;
  state: string;
  asset_url: string | null;
  duration_seconds: number;
  provider_request_id: string | null;
};
export default function ReviewPage() {
  const [videos, setVideos] = useState<ReviewVideo[]>([]);
  const [status, setStatus] = useState(
    "Staff sign-in is required to open this queue.",
  );
  const [busy, setBusy] = useState(false);
  const verifiedFetch = useReverification((init?: RequestInit) =>
    fetch("/api/admin/videos", init),
  );
  async function load() {
    setBusy(true);
    try {
      const response = await verifiedFetch();
      if (!response) return;
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Please sign in again.");
      setVideos(data.videos);
      setStatus(
        data.videos.length
          ? "Watch each full video before approving."
          : "The review queue is empty.",
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function review(id: string, approve: boolean, form: FormData) {
    setBusy(true);
    try {
      const response = await verifiedFetch({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          approve,
          verifiedDuration: Number(form.get("duration")),
          reviewed: form.get("reviewed") === "on",
        }),
      });
      if (!response) return;
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Review could not be saved.");
      await load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="page-wrap member-page">
      <span className="eyebrow">DLL STAFF · PRIVATE REVIEW</span>
      <h1>A thoughtful final look.</h1>
      <Link href="/parent" className="text-button">
        ← Parent dashboard
      </Link>
      <p role="status">{status}</p>
      <button
        disabled={busy}
        onClick={() => void load()}
        className="button button-blue"
      >
        {busy ? "Opening…" : "Open review queue"}
      </button>
      {videos.map((v) => (
        <section key={v.id} className="member-panel">
          <h2>
            {v.kind} · {v.character_id}
          </h2>
          <p>{v.script}</p>
          <p>
            {v.state} · target {v.duration_seconds} seconds
          </p>
          {v.asset_url && (
            <video
              src={v.asset_url}
              controls
              preload="none"
              aria-label="Staff-only unreviewed video"
            />
          )}
          {v.state === "uncertain" ? (
            <p>
              Reconcile this request with FAL before releasing its credit. Do
              not resubmit an ambiguous job. Provider request:{" "}
              {v.provider_request_id || "not recorded"}. See the membership
              operations guide.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void review(v.id, true, form);
              }}
            >
              <label>
                Actual reviewed duration (seconds)
                <input
                  name="duration"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  required
                />
              </label>
              <label className="checkbox-label">
                <input name="reviewed" type="checkbox" required />I watched the
                entire video and verified character consistency, gentle content,
                visual quality, no personal information, and appropriate
                duration.
              </label>
              <div className="membership-actions">
                <button className="button button-blue" disabled={busy}>
                  Approve for private delivery
                </button>
                <button
                  type="button"
                  className="text-button"
                  disabled={busy}
                  onClick={() => {
                    const form = new FormData();
                    form.set("duration", "0");
                    form.set("reviewed", "on");
                    void review(v.id, false, form);
                  }}
                >
                  Reject & return credit
                </button>
              </div>
            </form>
          )}
        </section>
      ))}
    </main>
  );
}
