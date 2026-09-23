import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Gamepad2, MessageCircle } from "lucide-react";
import { characters, getCharacter } from "@/lib/characters";
import { IntroButton } from "@/components/intro";
import { CharacterChat } from "@/components/character-chat";
import { MiniGame } from "@/components/mini-game";
export function generateStaticParams() {
  return characters.map((c) => ({ id: c.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const c = getCharacter((await params).id);
  return {
    title: c ? `Meet ${c.name}` : "Character not found",
    description: c?.short,
  };
}
export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const c = getCharacter((await params).id);
  if (!c) notFound();
  return (
    <main
      id="main"
      className="character-page"
      style={
        {
          "--character-color": c.color,
          "--character-pale": c.pale,
        } as React.CSSProperties
      }
    >
      <div className="page-wrap">
        <Link className="back-link" href="/#characters">
          <ArrowLeft size={16} /> Back to the crew
        </Link>
        <section className="character-hero">
          <div className="character-portrait">
            <Image
              src={`/characters/${c.id}.png`}
              alt={`${c.name} the ${c.animal.toLowerCase()}`}
              fill
              sizes="(max-width: 700px) 90vw, 500px"
              priority
            />
            <span className="portrait-sticker">{c.emoji}</span>
          </div>
          <div className="character-introduction">
            <span className="eyebrow">
              {c.animal.toUpperCase()} · {c.theme.toUpperCase()}
            </span>
            <h1>
              Hey, I’m <span>{c.name}!</span>
            </h1>
            <h2>{c.motto}</h2>
            <p>{c.bio}</p>
            <div className="button-row">
              <IntroButton character={c} />
              <a className="button button-character" href="#game">
                <Gamepad2 size={19} /> Play with me
              </a>
            </div>
            <a className="chat-jump" href="#chat">
              <MessageCircle size={18} /> Or stop by for a little chat{" "}
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
        <section
          className="fun-facts"
          aria-label={`Three things about ${c.name}`}
        >
          <span>THAT’S SO {c.name.toUpperCase()}!</span>
          {c.facts.map((f, i) => (
            <p key={f}>
              <b>{["✦", "♡", "✳"][i]}</b>
              {f}
            </p>
          ))}
        </section>
        <div className="character-activities">
          <section className="activity-panel" id="game">
            <span className="eyebrow">LET’S PLAY TOGETHER</span>
            <h2>{c.game}</h2>
            <p>{c.gameDescription}</p>
            <MiniGame character={c} />
          </section>
          <section className="activity-panel chat-panel" id="chat">
            <CharacterChat character={c} />
          </section>
        </div>
        <section className="more-friends">
          <h2>More friends to meet</h2>
          <div>
            {characters
              .filter((x) => x.id !== c.id)
              .map((x) => (
                <Link href={`/characters/${x.id}`} key={x.id}>
                  <div style={{ background: x.pale }}>
                    <Image
                      src={`/characters/${x.id}.png`}
                      alt=""
                      width={130}
                      height={130}
                    />
                  </div>
                  <span>{x.name}</span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
