"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { vaultEmbedUrl, type YouTubeVideo } from "@/lib/youtube-videos";

const PlayVideoContext = createContext<
  (video: YouTubeVideo, opener: HTMLElement) => void
>(() => {});

export function usePlayVideo() {
  return useContext(PlayVideoContext);
}

export function VaultPlayProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<YouTubeVideo | null>(null);
  const [retry, setRetry] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  function open(video: YouTubeVideo, button: HTMLElement) {
    opener.current = button;
    setSelected(video);
    setRetry(0);
    dialog.current?.showModal();
  }

  return (
    <PlayVideoContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        className="vault-dialog"
        aria-labelledby="home-video-title"
        aria-describedby="home-video-help"
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
            <h2 id="home-video-title">
              {selected?.title || "Story Vault video"}
            </h2>
            <button
              type="button"
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
              src={vaultEmbedUrl(selected.id)}
              title={selected.title}
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
          <p id="home-video-help">
            Press play when you’re ready. Close this window to stop watching.
            YouTube loads only after you open a video.
          </p>
          <details className="vault-help">
            <summary>Video not loading?</summary>
            <p>
              YouTube may be unavailable or blocked on this device. Try
              reloading the player, or close it and choose another adventure.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Reload player
            </button>
          </details>
        </div>
      </dialog>
    </PlayVideoContext.Provider>
  );
}

export function PlayableArt({
  video,
  label,
  className,
  children,
}: {
  video: YouTubeVideo;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const play = usePlayVideo();
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={(event) => play(video, event.currentTarget)}
    >
      {children}
    </button>
  );
}
