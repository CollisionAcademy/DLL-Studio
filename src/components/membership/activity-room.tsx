"use client";
import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { characters } from "@/lib/characters";
import { CharacterChat } from "@/components/character-chat";
import { ColorTogether, TicTacToe, MemoryPairs } from "./activity-games";
import "./activity-room.css";
const activities = [
  { id: "color", icon: "🎨", label: "Color with me" },
  { id: "tic", icon: "⭕", label: "Tic-tac-toe" },
  { id: "memory", icon: "🔎", label: "Matching friends" },
] as const;
export function ActivityRoom() {
  const [characterId, setCharacterId] = useState("leo");
  const [activity, setActivity] =
    useState<(typeof activities)[number]["id"]>("color");
  const character = characters.find((c) => c.id === characterId)!;
  return (
    <div
      className="activity-room"
      style={
        {
          "--character-color": character.color,
          "--character-pale": character.pale,
        } as CSSProperties
      }
    >
      <section className="activity-welcome">
        <div>
          <span className="eyebrow">A LITTLE CHAT. A LOT OF IMAGINATION.</span>
          <h2>
            Your favorite pal.
            <br />A new way to play.
          </h2>
          <p>
            Choose a character, pick something to say, and make a little magic
            together.
          </p>
          <span className="activity-safety-pill">
            ✦ Button-only play · No typing or uploads
          </span>
        </div>
        <Image
          src="/activities/crew-art-room.webp"
          alt="Leo, Bianna, and Vienna coloring together at a cozy art table"
          width={1376}
          height={768}
          priority
          sizes="(max-width: 800px) 100vw, 540px"
        />
      </section>
      <section className="activity-cast" aria-labelledby="choose-play-pal">
        <div className="activity-section-label">
          <h2 id="choose-play-pal">Who shall we play with?</h2>
          <span>Six personalities. One friendly crew.</span>
        </div>
        <div className="activity-cast-buttons">
          {characters.map((c) => (
            <button
              key={c.id}
              aria-pressed={characterId === c.id}
              onClick={() => setCharacterId(c.id)}
            >
              <Image
                src={`/characters/${c.id}.png`}
                width={72}
                height={72}
                alt=""
              />
              <strong>{c.name}</strong>
              <span>{c.role}</span>
            </button>
          ))}
        </div>
        <p className="activity-switch-note">
          Switching characters starts a fresh chat and game. Nothing you say or
          draw here is posted for other users.
        </p>
      </section>
      <div className="activity-room-columns">
        <section
          className="activity-chat-card"
          aria-label={`Conversation with ${character.name}`}
        >
          <CharacterChat character={character} key={characterId} />
        </section>
        <div className="activity-play-card">
          <span className="eyebrow">LET’S MAKE SOMETHING OF TODAY</span>
          <h2>Play alongside {character.name}</h2>
          <p className="activity-motto">“{character.motto}”</p>
          <div className="activity-tabs" aria-label="Choose an activity">
            {activities.map((a) => (
              <button
                key={a.id}
                aria-pressed={activity === a.id}
                onClick={() => setActivity(a.id)}
              >
                <span aria-hidden="true">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
          <div className="activity-game" key={`${characterId}:${activity}`}>
            {activity === "color" && <ColorTogether character={character} />}
            {activity === "tic" && <TicTacToe character={character} />}
            {activity === "memory" && <MemoryPairs character={character} />}
          </div>
        </div>
      </div>
      <section className="activity-grownup-note">
        <h2>Small choices. Thoughtful boundaries.</h2>
        <p>
          These are pretend DLL characters, not people. Conversations use preset
          buttons; there is no free-text chat, photo sharing, microphone, or
          contact with other users. AI replies are checked before display, but
          AI can still make mistakes. Games and drawings stay in this page and
          reset when you leave.
        </p>
        <Link className="text-button" href="/parents/safety">
          Grown-ups: how we keep play thoughtful →
        </Link>
        <a
          className="text-button"
          href="/api/member/media/activity-sheet"
          download
        >
          Take a printable activity off screen →
        </a>
      </section>
    </div>
  );
}
