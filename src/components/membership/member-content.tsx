"use client";
import { useEffect, useState } from "react";
import { useAccount } from "./use-account";
export function MemberContent({ kind }: { kind: "episode" | "story" }) {
  const [items, setItems] = useState<
    { id: string; title: string; kind: string; body: string | null }[] | null
  >(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/member/content", { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        setItems(data.items.filter((i: { kind: string }) => i.kind === kind));
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [kind]);
  if (error) return <p role="alert">{error}</p>;
  if (!items) return <p role="status">Opening the story shelf…</p>;
  return (
    <>
      {items.length === 0 ? (
        <div className="member-panel">
          <h2>New adventures are on their way.</h2>
          <p>
            Approved {kind === "episode" ? "episodes" : "stories"} will appear
            here. In the meantime, explore the crew’s story games.
          </p>
        </div>
      ) : (
        items.map((i) => (
          <article className="member-panel" key={i.id}>
            <h2>{i.title}</h2>
            {i.body && <p>{i.body}</p>}
            {kind === "episode" && (
              <video
                controls
                preload="none"
                src={`/api/member/media/${i.id}`}
                aria-label={i.title}
              />
            )}
          </article>
        ))
      )}
    </>
  );
}
export function MemberPoll() {
  const { act, busy, error } = useAccount();
  const [message, setMessage] = useState("");
  return (
    <section className="member-panel">
      <h2>Where should the crew go next?</h2>
      <p>
        Pick a story idea. You can change your mind. One household, one vote.
      </p>
      <div className="chat-choices">
        {[
          ["picnic", "A picnic mix-up"],
          ["workshop", "A wobbly invention"],
          ["mystery", "A tiny clue mystery"],
        ].map(([id, label]) => (
          <button
            disabled={busy}
            key={id}
            onClick={async () => {
              const data = await act("vote", { option: id });
              if (data) setMessage(data.message);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p role="status">{message}</p>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
