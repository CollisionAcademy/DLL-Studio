"use client";
import { Play, X, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/characters";
export function IntroButton({
  character: c,
  compact = false,
}: {
  character: Character;
  compact?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  function close() {
    video.current?.pause();
    dialog.current?.close();
    setOpen(false);
  }
  return (
    <>
      <button
        className={compact ? "intro-chip" : "button button-white"}
        onClick={() => {
          setFailed(false);
          setOpen(true);
        }}
        aria-label={`Watch ${c.name}'s five-second intro`}
      >
        <Play size={compact ? 14 : 18} fill="currentColor" />
        {compact ? "5s hello" : "Watch my intro"}
      </button>
      {open ? (
        <dialog
          ref={dialog}
          className="intro-dialog"
          onCancel={close}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          aria-label={`${c.name}'s introduction`}
        >
          <button
            className="icon-button modal-close"
            onClick={close}
            aria-label="Close intro"
          >
            <X />
          </button>
          <div className="intro-screen">
            <video
              ref={video}
              src={`/intros/${c.id}.mp4`}
              poster={`/characters/${c.id}.png`}
              autoPlay
              playsInline
              controls
              preload="auto"
              onError={() => setFailed(true)}
            >
              <track
                kind="captions"
                src={`/intros/${c.id}.vtt`}
                srcLang="en"
                label="English"
                default
              />
            </video>
          </div>
          <div className="intro-caption">
            <h2>Hi, I’m {c.name}!</h2>
            <p>
              {failed
                ? "My video is taking a little break. You can still meet me and play my game!"
                : c.intro}
            </p>
            <button
              className="text-button"
              onClick={() => {
                if (video.current) {
                  video.current.currentTime = 0;
                  void video.current.play().catch(() => setFailed(true));
                }
              }}
            >
              <RotateCcw size={16} /> Play again
            </button>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
