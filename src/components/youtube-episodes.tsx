"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, X } from "lucide-react";
import {
  vaultCategories,
  vaultEmbedUrl,
  type VaultCategory,
  type YouTubeVideo,
} from "@/lib/youtube-videos";

export function YouTubeEpisodes({ videos }: { videos: YouTubeVideo[] }) {
  const [category, setCategory] = useState<VaultCategory>("All adventures");
  const [selected, setSelected] = useState<YouTubeVideo | null>(null);
  const [language, setLanguage] = useState("en");
  const [retry, setRetry] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const featured = videos[0];
  const visible = videos.filter(
    (video) => category === "All adventures" || video.category === category,
  );
  function openVideo(video: YouTubeVideo, button: HTMLButtonElement) {
    opener.current = button;
    setLanguage(
      new URLSearchParams(window.location.search).get("_x_tr_tl") || "en",
    );
    setSelected(video);
    setRetry(0);
    dialog.current?.showModal();
  }
  return (
    <section className="vault" aria-label="Story Vault videos">
      {featured ? (
        <div className="vault-feature">
          <button
            className="vault-feature-art"
            aria-label={`Open video: ${featured.title}`}
            onClick={(event) => openVideo(featured, event.currentTarget)}
          >
            <Image
              src={`/story-vault/${featured.id}.jpg`}
              alt=""
              fill
              sizes="(max-width: 800px) 100vw, 65vw"
              loading="eager"
            />
            <span className="vault-play">
              <Play aria-hidden="true" fill="currentColor" />
            </span>
          </button>
          <div className="vault-feature-copy">
            <span className="vault-feature-label">In the spotlight</span>
            <h2>{featured.title}</h2>
            <p>
              A little teamwork. A lot of heart. Join the crew for a football
              adventure.
            </p>
            <button
              className="button button-yellow"
              onClick={(event) => openVideo(featured, event.currentTarget)}
            >
              <Play size={18} aria-hidden="true" /> Open video
            </button>
            <span className="vault-player-hint">
              You choose when to press play.
            </span>
          </div>
        </div>
      ) : (
        <p className="vault-empty">
          New adventures are on their way. Come back soon!
        </p>
      )}
      {videos.length > 0 && (
        <>
          <div className="vault-library-heading">
            <h2>Find your next adventure</h2>
            <p role="status" aria-live="polite">
              {visible.length} {visible.length === 1 ? "video" : "videos"}
            </p>
          </div>
          <div
            className="vault-filters"
            role="group"
            aria-label="Choose a video category"
          >
            {vaultCategories.map((label) => (
              <button
                key={label}
                aria-pressed={category === label}
                onClick={() => setCategory(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <ul className="vault-grid">
            {visible.map((video) => (
              <li key={video.id}>
                <button
                  className="vault-card"
                  aria-label={`Open video: ${video.title}`}
                  onClick={(event) => openVideo(video, event.currentTarget)}
                >
                  <span className="vault-thumbnail">
                    <Image
                      src={`/story-vault/${video.id}.jpg`}
                      alt=""
                      fill
                      sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 33vw"
                    />
                    <span className="vault-card-play">
                      <Play size={19} aria-hidden="true" fill="currentColor" />
                    </span>
                  </span>
                  <span className="vault-card-copy">
                    <span className="vault-category">{video.category}</span>
                    <span className="vault-title">{video.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {visible.length === 0 && (
            <p className="vault-empty">
              No videos in this category yet. Choose another adventure above.
            </p>
          )}
        </>
      )}
      <aside className="vault-parent-note" aria-label="A note for grown-ups">
        <h2>A note for grown-ups</h2>
        <p>
          Browse here without connecting to YouTube. Opening a video loads
          YouTube’s privacy-enhanced player; press its play button to watch. We
          don’t add comments, chat, or automatic playlists. YouTube may show
          ads, links, and suggestions from DLL Studio.{" "}
          <Link href="/privacy">Read about video privacy</Link>.
        </p>
      </aside>
      <dialog
        ref={dialog}
        className="vault-dialog"
        aria-labelledby="vault-video-title"
        aria-describedby="vault-video-help"
        onClose={() => {
          setSelected(null);
          opener.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="vault-dialog-inner">
          <div className="vault-dialog-heading">
            <h2 id="vault-video-title">
              {selected?.title || "Story Vault video"}
            </h2>
            <button
              className="icon-button"
              aria-label="Close video"
              onClick={() => dialog.current?.close()}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          {selected && (
            <iframe
              key={`${selected.id}-${retry}`}
              className="vault-player"
              src={vaultEmbedUrl(selected.id, language)}
              title={selected.title}
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
          <p id="vault-video-help">
            Press play when you’re ready. Close this window to stop watching.
          </p>
          <details className="vault-help">
            <summary>Video not loading?</summary>
            <p>
              YouTube may be unavailable or blocked on this device. Try
              reloading the player, or close it and choose another adventure.
            </p>
            <button
              className="text-button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Reload player
            </button>
          </details>
        </div>
      </dialog>
    </section>
  );
}
