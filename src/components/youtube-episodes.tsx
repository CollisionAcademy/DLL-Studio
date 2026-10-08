"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, Youtube } from "lucide-react";
import type { YouTubeVideo } from "@/lib/youtube-videos";

const uploadsPlaylist = "UUzpsv9_xB1Ke28QIsFSDYKA";
const supportedLanguages = new Set(["en", "es", "fr", "pt", "de", "hi", "zh-CN", "ja", "ar", "ru", "uk"]);

export function YouTubeEpisodes({ videos }: { videos: YouTubeVideo[] }) {
  const [language, setLanguage] = useState("en");
  const [selected, setSelected] = useState(videos[0].id);
  const [autoplay, setAutoplay] = useState(false);
  const [ready, setReady] = useState(false);
  const player = useRef<HTMLIFrameElement>(null);
  const current = videos.find((video) => video.id === selected) || videos[0];
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("_x_tr_tl");
    if (selected && supportedLanguages.has(selected)) setLanguage(selected);
    setReady(true);
  }, []);
  const params = new URLSearchParams({
    list: uploadsPlaylist,
    playsinline: "1",
    hl: language,
    cc_lang_pref: language,
    ...(autoplay ? { autoplay: "1" } : {}),
    ...(language !== "en" ? { cc_load_policy: "1" } : {}),
  });
  return (
    <section className="youtube-episodes" aria-label="DLL Studio episodes on YouTube">
      <iframe
        ref={player}
        key={selected}
        className="youtube-player"
        src={`https://www.youtube-nocookie.com/embed/${selected}?${params}`}
        title={current.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a className="text-button" href={`https://www.youtube.com/playlist?list=${uploadsPlaylist}`} target="_blank" rel="noopener noreferrer">
        <Youtube size={20} aria-hidden="true" /> Watch on YouTube
      </a>
      <h2 className="youtube-gallery-heading">Choose an episode</h2>
      <div className="youtube-gallery">
        {videos.map((video) => (
          <button
            key={video.id}
            className="youtube-episode"
            disabled={!ready}
            aria-label={`Watch ${video.title}`}
            aria-pressed={selected === video.id}
            onClick={() => {
              setSelected(video.id);
              setAutoplay(true);
              player.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
            }}
          >
            <span className="youtube-thumbnail">
              <Image src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" fill unoptimized sizes="(max-width: 540px) 100vw, (max-width: 800px) 50vw, 33vw" />
              <Play size={26} aria-hidden="true" />
            </span>
            <span className="youtube-episode-title">{video.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
