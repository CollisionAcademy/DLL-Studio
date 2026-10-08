"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, type MouseEvent } from "react";

const languages = [
  ["es", "Español", "Spanish"],
  ["fr", "Français", "French"],
  ["pt", "Português", "Portuguese"],
  ["de", "Deutsch", "German"],
  ["hi", "हिन्दी", "Hindi"],
  ["zh-CN", "中文", "Chinese"],
  ["ja", "日本語", "Japanese"],
  ["ar", "العربية", "Arabic"],
  ["ru", "Русский", "Russian"],
  ["uk", "Українська", "Ukrainian"],
] as const;

export function LanguageSelector() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  // Account and payment URLs must never be sent to the translation service.
  const publicPath = /^\/(?:characters\/[^/]+|watch\/[^/]+|stories|play|story-lab|grown-ups|privacy|parents\/safety)\/?$/.test(pathname)
    ? pathname
    : "/";
  const originalUrl = `https://dll-studio.com${publicPath}`;
  function switchLanguage(event: MouseEvent<HTMLAnchorElement>, url: string) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    // Google rewrites anchor destinations on its proxy. Use the original URL
    // directly so returning to English leaves the translated copy.
    event.preventDefault();
    window.location.assign(url);
  }
  return (
    <details
      ref={menu}
      className="language-selector"
      translate="no"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menu.current) {
          menu.current.open = false;
          menu.current.querySelector("summary")?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget) && menu.current) {
          menu.current.open = false;
        }
      }}
    >
      <summary aria-label="Choose language" title="Choose language">
        <Languages size={21} aria-hidden="true" />
        <span>Language</span>
      </summary>
      <nav className="language-menu" aria-label="Languages" translate="no">
        <a href={originalUrl} lang="en" onClick={(event) => switchLanguage(event, originalUrl)}>English</a>
        {languages.map(([code, label, name]) => {
          const params = new URLSearchParams({
            sl: "en",
            tl: code,
            u: originalUrl,
          });
          const translationUrl = `https://translate.google.com/translate?${params}`;
          return (
            <a
              key={code}
              href={translationUrl}
              onClick={(event) => switchLanguage(event, translationUrl)}
              lang={code}
              hrefLang={code}
              aria-label={`${name} via Google Translate`}
              rel="noopener noreferrer"
            >
              <span dir="auto">{label}</span>
              <span className="language-name">{name}</span>
            </a>
          );
        })}
        <span className="translation-provider">Google Translate</span>
      </nav>
    </details>
  );
}
