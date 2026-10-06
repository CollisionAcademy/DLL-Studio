"use client";
import { useEffect, useRef, useState } from "react";
import type { ShelfItem } from "@/lib/membership/content-shelf";
import { nextPlaylistIndex } from "@/lib/membership/playlist";

export function StoryVault({ items }: { items: ShelfItem[] }) {
  const videos = items.filter((item) => item.kind === "episode");
  const stories = items.filter((item) => item.kind === "story");
  const [index, setIndex] = useState(0);
  const [playAll, setPlayAll] = useState(false);
  const [message, setMessage] = useState("");
  const player = useRef<HTMLVideoElement>(null);
  const current = videos[index];
  useEffect(() => {
    if (!playAll) return;
    let cancelled = false;
    void player.current?.play().catch(() => {
      if (!cancelled) {
        setMessage("Press play on the video to keep watching.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [index, playAll]);

  return (
    <>
      {current && (
        <section className="member-panel" aria-label="Story vault player">
          <h2>{current.title}</h2>
          <div className="membership-actions">
            <button
              className="button button-blue"
              onClick={() => {
                setMessage("");
                if (index === 0 && player.current) {
                  player.current.currentTime = 0;
                  void player.current
                    .play()
                    .catch(() =>
                      setMessage("Press play on the video to start watching."),
                    );
                }
                setIndex(0);
                setPlayAll(true);
              }}
            >
              ▶ Play all ({videos.length})
            </button>
            {playAll && (
              <button
                className="text-button"
                onClick={() => {
                  setPlayAll(false);
                  player.current?.pause();
                  setMessage("Play all stopped.");
                }}
              >
                Stop play all
              </button>
            )}
          </div>
          <p role="status" aria-live="polite">
            Video {index + 1} of {videos.length}
            {playAll ? " · Playing all" : ""}. {message}
          </p>
          <video
            key={current.id}
            ref={player}
            controls
            playsInline
            preload="metadata"
            src={`/api/watch/${encodeURIComponent(current.id)}`}
            aria-label={current.title}
            onEnded={() => {
              if (!playAll) return;
              const next = nextPlaylistIndex(index, videos.length);
              if (next !== null) setIndex(next);
              else {
                setPlayAll(false);
                setMessage("You watched every video!");
              }
            }}
            onError={() => {
              setPlayAll(false);
              setMessage(
                "This video is taking a little break. Choose another adventure below.",
              );
            }}
          />
          {current.body && <p>{current.body}</p>}
          <h3>Choose an adventure</h3>
          <ol className="vault-playlist">
            {videos.map((video, position) => (
              <li key={video.id}>
                <button
                  className="text-button"
                  aria-current={position === index ? "true" : undefined}
                  onClick={() => {
                    setPlayAll(false);
                    player.current?.pause();
                    setMessage("");
                    setIndex(position);
                  }}
                >
                  {video.title}
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
      {stories.map((story) => (
        <article key={story.id} className="member-panel">
          <h2>{story.title}</h2>
          {story.body && <p>{story.body}</p>}
        </article>
      ))}
      {!items.length && (
        <p>New adventures are on their way. Check back soon!</p>
      )}
    </>
  );
}
