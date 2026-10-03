"use client";
import Image from "next/image";
import { CrewArcade } from "./crew-arcade";
import { useState } from "react";
import { characters } from "@/lib/characters";
import { storybookReply } from "@/lib/storybook";
const choiceNodes = {
  start: {
    text: "The picnic sign points two ways! What could the crew try?",
    choices: [
      { label: "Look for a clue", next: "clue" },
      { label: "Ask a friend", next: "friend" },
    ],
  },
  clue: {
    text: "Doo Wop Dog spots a tiny leaf stuck over the arrow. Underneath is the path to the picnic!",
    choices: [
      { label: "Cheer for the crew", next: "finish" },
      { label: "Try another idea", next: "start" },
    ],
  },
  friend: {
    text: "Vienna checks her map. Luca notices the picnic blanket nearby. Two good ideas make one great discovery!",
    choices: [
      { label: "Celebrate together", next: "finish" },
      { label: "Look for a clue too", next: "clue" },
    ],
  },
  finish: {
    text: "Bianna sits down and her hat squeaks. The whole crew giggles. The best part of the picnic? Being together.",
    choices: [{ label: "Tell it again", next: "start" }],
  },
} as const;
export function ClubPlay() {
  const [character, setCharacter] = useState(characters[0]);
  const [reply, setReply] = useState("");
  const [node, setNode] = useState<keyof typeof choiceNodes>("start");
  return (
    <>
      <details className="member-panel crew-pal-picker">
        <summary>Playing with {character.name} · Choose a pal</summary>
        <div className="crew-choice">
          {characters.map((c) => (
            <button
              aria-pressed={character.id === c.id}
              key={c.id}
              onClick={() => {
                setCharacter(c);
                setReply("");
              }}
            >
              <Image
                src={`/characters/${c.id}.png`}
                alt=""
                width={80}
                height={80}
              />
              {c.name}
            </button>
          ))}
        </div>
        <p className="crew-reset-note">
          Choose a pal for your games. Switching pals starts a fresh mission.
        </p>
      </details>
      <CrewArcade character={character} />
      <section className="member-panel">
        <h3>{character.name} has a little something to share.</h3>
        <div className="chat-choices">
          {[
            { id: "joke", label: "A funny joke" },
            { id: "story", label: "A little story" },
            { id: "challenge", label: "An imagination game" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setReply(storybookReply(character, p.id))}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() =>
              setReply(
                "What has hands but can’t clap? A clock! Tick, tock, that’s a funny thought.",
              )
            }
          >
            A riddle
          </button>
          <button
            onClick={() =>
              setReply(
                `${character.name} noticed a friend’s tower had tumbled. “Shall we try together?” One block at a time, they built something new. Helping was the superpower all along.`,
              )
            }
          >
            A hero story
          </button>
        </div>
        <p className="storybook-bubble" aria-live="polite">
          {reply || character.greeting}
        </p>
        <p>
          These are pretend characters sharing ready-made storybook replies.
        </p>
      </section>
      <section className="member-panel">
        <span className="eyebrow">CHOOSE WHAT HAPPENS NEXT</span>
        <h2>The picnic mix-up.</h2>
        <p className="storybook-bubble" aria-live="polite">
          {choiceNodes[node].text}
        </p>
        <div className="chat-choices">
          {choiceNodes[node].choices.map((c) => (
            <button key={c.label} onClick={() => setNode(c.next)}>
              {c.label}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
