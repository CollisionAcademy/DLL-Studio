"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Gamepad2, Heart, Instagram, Menu, Music2, X, Youtube } from "lucide-react";
import { useState } from "react";
import { AccountNav } from "./membership/account-nav";
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-blocks">
        <b>D</b>
        <b>L</b>
        <b>L</b>
      </span>
      <span className="brand-studio">
        STUDIO<span className="brand-spark">✳</span>
      </span>
    </span>
  );
}
export function Header({
  authenticationEnabled = false,
}: {
  authenticationEnabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-account">
          {authenticationEnabled ? (
            <AccountNav onNavigate={() => setOpen(false)} />
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}>
              Member login
            </Link>
          )}
        </div>
        <Link
          href="/"
          aria-label="DLL Studio home"
          onClick={() => setOpen(false)}
        >
          <Brand />
        </Link>
        <button
          className="menu-toggle icon-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
          <Link href="/stories" onClick={() => setOpen(false)} className={path === "/stories" || path.startsWith("/watch/") ? "active" : ""}>
            Watch episodes
          </Link>
          <Link href="/member" onClick={() => setOpen(false)} className={path.startsWith("/member") && !path.startsWith("/membership") ? "active" : ""}>
            Member clubhouse
          </Link>
          <Link
            href="/#characters"
            onClick={() => setOpen(false)}
            className={path.startsWith("/characters") ? "active" : ""}
          >
            Meet the crew
          </Link>
          <Link
            href="/play"
            onClick={() => setOpen(false)}
            className={path === "/play" ? "active" : ""}
          >
            The playroom
          </Link>
          <Link
            href="/story-lab"
            onClick={() => setOpen(false)}
            className={path === "/story-lab" ? "active" : ""}
          >
            Story Lab
          </Link>
          <Link
            href="/grown-ups"
            onClick={() => setOpen(false)}
            className="parents-link"
          >
            For grown-ups <ArrowUpRight size={15} />
          </Link>
          <Link href="/shop" onClick={() => setOpen(false)} className={path === "/shop" ? "active" : ""}>
            Shop
          </Link>
        </nav>
        <Link href="/play" className="button button-yellow header-play">
          <Gamepad2 size={19} /> Let’s play
        </Link>
      </div>
    </header>
  );
}
export function Footer({ socialLinks = [] }: {
  socialLinks?: { platform: "YouTube" | "Instagram" | "TikTok"; url: string }[];
}) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <Link href="/" aria-label="DLL Studio home">
          <Brand />
        </Link>
        <p>Little characters. Big possibilities.</p>
        <div>
          <Link href="/member">Member clubhouse</Link>
          <Link href="/stories">Watch episodes</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/parent">Parent account</Link>
          <Link href="/grown-ups">For grown-ups</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
      {socialLinks.length > 0 && (
        <nav className="footer-social" aria-label="DLL Studio social media">
          {socialLinks.map(({ platform, url }) => {
            const Icon = platform === "YouTube" ? Youtube : platform === "Instagram" ? Instagram : Music2;
            return (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${platform} (opens in a new tab)`}>
                <Icon size={20} aria-hidden="true" /> {platform}
              </a>
            );
          })}
        </nav>
      )}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} DLL Studio</span>
        <span>
          Made with imagination <Heart size={13} aria-hidden="true" />
        </span>
      </div>
    </footer>
  );
}
