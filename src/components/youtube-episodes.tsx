"use client";

import { useEffect, useState } from "react";
import { Youtube } from "lucide-react";

const uploadsPlaylist = "UUzpsv9_xB1Ke28QIsFSDYKA";
const supportedLanguages = new Set(["en", "es", "fr", "pt", "de", "hi", "zh-CN", "ja", "ar", "ru", "uk"]);

export function YouTubeEpisodes() {
  const [language, setLanguage] = useState("en");
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("_x_tr_tl");
    if (selected && supportedLanguages.has(selected)) setLanguage(selected);
  }, []);
  const params = new URLSearchParams({
    list: uploadsPlaylist,
    playsinline: "1",
    hl: language,
    cc_lang_pref: language,
    ...(language !== "en" ? { cc_load_policy: "1" } : {}),
  });
  return (
    <section className="youtube-episodes" aria-label="DLL Studio episodes on YouTube">
      <iframe
        className="youtube-player"
        src={`https://www.youtube-nocookie.com/embed/videoseries?${params}`}
        title="Watch DLL Studio episodes"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a className="text-button" href={`https://www.youtube.com/playlist?list=${uploadsPlaylist}`} target="_blank" rel="noopener noreferrer">
        <Youtube size={20} aria-hidden="true" /> Watch on YouTube
      </a>
    </section>
  );
}
