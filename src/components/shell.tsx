"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AccountNav } from "./membership/account-nav";

export function Brand({
  tagline = "A little world of big adventures",
}: {
  tagline?: string;
}) {
  return (
    <span className="brand" translate="no">
      <span className="brand-mark" aria-hidden="true">
        D
      </span>
      <span className="brand-name">
        DLL Studio
        <small>{tagline}</small>
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
  const close = () => setOpen(false);
  const onHome = path === "/";
  const links = [
    { href: onHome ? "#shorts" : "/#shorts", label: "Shorts", active: false },
    {
      href: onHome ? "#crew" : "/#crew",
      label: "The crew",
      active: path.startsWith("/characters"),
    },
    {
      href: onHome ? "#vault" : "/stories",
      label: "Story Vault",
      active: path === "/stories" || path.startsWith("/watch/"),
    },
    {
      href: onHome ? "#play" : "/play",
      label: "Play",
      active: path === "/play",
    },
  ];

  return (
    <header className="site-header">
      <div className="header-inner site-wrap">
        <Link href="/" aria-label="DLL Studio home" onClick={close}>
          <Brand />
        </Link>
        <nav className={open ? "nav open" : "nav"} aria-label="Kids pages">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={close}
              className={link.active ? "active" : undefined}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {authenticationEnabled ? <AccountNav onNavigate={close} /> : null}
          <Link href="/#grown-ups" className="btn-grown" onClick={close}>
            Grown-ups
            <span> · shop & accounts</span>
          </Link>
          <button
            type="button"
            className="menu-toggle icon-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-wrap">
        <div className="footer-row">
          <Link href="/" aria-label="DLL Studio home">
            <Brand tagline="Little characters. Big possibilities." />
          </Link>
          <nav className="footer-links" aria-label="Grown-up pages">
            <Link href="/grown-ups">For grown-ups</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/parents/safety">Family safety</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/login">Parent account</Link>
          </nav>
        </div>
        <p className="footer-fine">
          © {new Date().getFullYear()} DLL Studio. Made for kids. Public play is
          always free. Purchases and accounts stay with a grown-up.
        </p>
      </div>
    </footer>
  );
}
