import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Gamepad2,
  Sparkles,
  Play,
  MessageCircle,
} from "lucide-react";
import { characters } from "@/lib/characters";
import { CharacterGallery } from "@/components/character-gallery";
export default function Home() {
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="little-spark">✳</span> WELCOME TO OUR LITTLE WORLD
          </span>
          <h1>
            Big imaginations.
            <br />
            <span>Little legends.</span>
          </h1>
          <p>
            Six one-of-a-kind characters.
            <br />A whole lot of adventure. And you!
          </p>
          <Link className="button button-blue" href="#characters">
            Find your new favorite <ArrowRight size={20} />
          </Link>
          <div className="hero-note">
            <span>✦</span> Come curious. Leave smiling.
          </div>
        </div>
        <div className="hero-cast" aria-label="Meet the DLL Studio characters">
          <div className="hero-orbit" />
          <span className="hero-star star-one" aria-hidden="true">
            ✦
          </span>
          <span className="hero-star star-two" aria-hidden="true">
            ✳
          </span>
          {["luca", "vienna", "leo"].map((id, i) => {
            const c = characters.find((c) => c.id === id)!;
            return (
              <Link
                key={id}
                href={`/characters/${id}`}
                className={`hero-person hero-person-${i}`}
                style={{ "--character-pale": c.pale } as React.CSSProperties}
              >
                <Image
                  src={`/characters/${id}.png`}
                  alt={c.name}
                  fill
                  sizes="(max-width: 700px) 40vw, 300px"
                  priority
                />
                <span>
                  {c.name}
                  <span>{c.emoji}</span>
                </span>
              </Link>
            );
          })}
          <span className="hero-bubble">
            Your next adventure
            <br />
            starts with a hello! <span>↗</span>
          </span>
        </div>
      </section>
      <div className="ticker" aria-hidden="true">
        <span>PLAY A LITTLE</span>
        <span>✳</span>
        <span>DREAM A LOT</span>
        <span>✳</span>
        <span>BE YOURSELF</span>
        <span>✳</span>
        <span>TRY SOMETHING NEW</span>
        <span>✳</span>
        <span>PLAY A LITTLE</span>
      </div>
      <CharacterGallery />
      <section className="play-banner">
        <div className="play-banner-icon">
          <Gamepad2 size={58} />
          <span>✦</span>
        </div>
        <div>
          <span className="eyebrow">SMALL GAMES. BIG GRINS.</span>
          <h2>Ready, set… let’s play!</h2>
          <p>Score a goal, crack a case, or build something super.</p>
        </div>
        <Link className="button button-yellow" href="/play">
          Enter the playroom <ArrowRight size={20} />
        </Link>
      </section>
      <section className="ways-to-play">
        <div>
          <Play />
          <h3>A little hello</h3>
          <p>Meet each character in a five-second mini intro.</p>
        </div>
        <div>
          <Gamepad2 />
          <h3>A little adventure</h3>
          <p>Six playful games. No downloads. Just jump in.</p>
        </div>
        <div>
          <MessageCircle />
          <h3>A little conversation</h3>
          <p>Choose a question and see what your character says.</p>
        </div>
        <div>
          <Sparkles />
          <h3>A lot of imagination</h3>
          <p>Different worlds. Room for every kind of kid.</p>
        </div>
      </section>
    </main>
  );
}
