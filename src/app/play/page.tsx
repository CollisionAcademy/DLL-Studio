import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { characters } from "@/lib/characters";
export const metadata = { title: "The playroom" };
export default function Playroom() {
  return (
    <main id="main" className="play-page page-wrap">
      <div className="page-heading">
        <span className="eyebrow">A LITTLE PLAY GOES A LONG WAY</span>
        <h1>
          The playroom<span className="pink-star">✳</span>
        </h1>
        <p>Pick a pal. Try a game. Find your kind of fun.</p>
      </div>
      <div className="game-grid">
        {characters.map((c) => (
          <Link
            className="game-card"
            key={c.id}
            href={`/characters/${c.id}#game`}
            style={
              {
                "--character-color": c.color,
                "--character-pale": c.pale,
              } as React.CSSProperties
            }
          >
            <div className="game-card-art">
              <Image
                src={`/characters/${c.id}.png`}
                alt={c.name}
                fill
                sizes="(max-width: 600px) 90vw, 30vw"
              />
              <span>{c.emoji}</span>
            </div>
            <div className="game-card-copy">
              <span className="eyebrow">PLAY WITH {c.name.toUpperCase()}</span>
              <h2>{c.game}</h2>
              <p>{c.gameDescription}</p>
              <span className="button button-character">
                Let’s play <ArrowRight size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
