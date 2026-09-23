"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { useState } from "react";
import { characters } from "@/lib/characters";
import { IntroButton } from "./intro";
export function CharacterGallery() {
  const [filter, setFilter] = useState("Everyone");
  const options = [
    "Everyone",
    "Sports",
    "Superheroes",
    "Adventure",
    "Silliness",
    "Mysteries",
    "Life lessons",
  ];
  return (
    <section className="character-section" id="characters">
      <div className="section-heading">
        <div>
          <span className="eyebrow">SIX FRIENDS. ENDLESS POSSIBILITIES.</span>
          <h2>
            Meet your new crew<span className="pink-star">✳</span>
          </h2>
        </div>
        <p>
          A little brave. A little silly.
          <br />A whole lot of heart.
        </p>
      </div>
      <div
        className="filter-row"
        role="group"
        aria-label="Choose a character interest"
      >
        {options.map((o) => (
          <button
            key={o}
            className={o === filter ? "filter selected" : "filter"}
            aria-pressed={o === filter}
            onClick={() => setFilter(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="character-grid">
        {characters
          .filter((c) => filter === "Everyone" || c.theme === filter)
          .map((c) => (
            <article
              key={c.id}
              className="character-card"
              style={
                {
                  "--character-color": c.color,
                  "--character-pale": c.pale,
                } as React.CSSProperties
              }
            >
              <div className="card-image">
                <Link
                  href={`/characters/${c.id}`}
                  aria-label={`Meet ${c.name}`}
                >
                  <Image
                    src={`/characters/${c.id}.png`}
                    alt={`${c.name}, ${c.role.toLowerCase()} ${c.animal.toLowerCase()}`}
                    fill
                    sizes="(max-width: 600px) 92vw, (max-width: 900px) 45vw, 30vw"
                  />
                </Link>
                <span className="character-badge">
                  {c.emoji} {c.theme}
                </span>
                <IntroButton character={c} compact />
              </div>
              <div className="card-body">
                <Link href={`/characters/${c.id}`} className="card-title">
                  <h3>{c.name}</h3>
                  <span>
                    <ArrowUpRight size={22} />
                  </span>
                </Link>
                <span className="card-role">{c.role}</span>
                <p>{c.short}</p>
                <Link className="card-meet" href={`/characters/${c.id}`}>
                  Come say hello <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
