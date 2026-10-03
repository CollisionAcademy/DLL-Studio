"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Character } from "@/lib/characters";
import { shuffle } from "@/lib/activity-games";
import { gameTips } from "@/lib/game-tips";
import { MemoryPairs, TicTacToe } from "./activity-games";
import "./activity-room.css";
import "./crew-arcade.css";

const games = [
  {
    id: "sequence",
    icon: "🚀",
    name: "Rocket code",
    detail: "Remember it. Build it.",
  },
  {
    id: "memory",
    icon: "🔎",
    name: "Picture detectives",
    detail: "Find every hidden pair.",
  },
  {
    id: "tic",
    icon: "⭐",
    name: "Three in a row",
    detail: "Outthink your play pal.",
  },
] as const;
type Game = (typeof games)[number]["id"];
const symbols = ["⭐", "🌙", "🚀", "🪐"];
const symbolNames = ["Star", "Moon", "Rocket", "Planet"];

export function CrewArcade({ character }: { character: Character }) {
  const [game, setGame] = useState<Game>("sequence");
  return (
    <section
      className="crew-arcade member-panel"
      style={
        {
          "--character-color": character.color,
          "--character-pale": character.pale,
        } as CSSProperties
      }
      aria-label="Crew games"
    >
      <div className="crew-arcade-heading">
        <Image
          src={`/characters/${character.id}.png`}
          width={80}
          height={80}
          alt={character.name}
        />
        <div>
          <span className="eyebrow">PICK A MISSION. MAKE YOUR MOVE.</span>
          <h2>Ready to play?</h2>
          <p>Short challenges, big discoveries. Take your time!</p>
        </div>
      </div>
      <div className="crew-game-menu" aria-label="Choose a game">
        {games.map((g) => (
          <button
            key={g.id}
            aria-pressed={game === g.id}
            onClick={() => setGame(g.id)}
          >
            <span aria-hidden="true">{g.icon}</span>
            <strong>{g.name}</strong>
            <small>{g.detail}</small>
          </button>
        ))}
      </div>
      <p className="crew-reset-note">
        Choosing another game starts a fresh mission.
      </p>
      <div className="crew-game-layout">
        <div className="activity-game" key={`${game}:${character.id}`}>
          {game === "sequence" && <RocketCode character={character} />}
          {game === "memory" && <MemoryPairs character={character} />}
          {game === "tic" && <TicTacToe character={character} />}
        </div>
        <GameCoach
          key={`coach:${game}:${character.id}`}
          game={game}
          character={character}
        />
      </div>
    </section>
  );
}

export function RocketCode({ character }: { character: Character }) {
  const [code, setCode] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<"ready" | "look" | "play" | "won">(
    "ready",
  );
  const [answer, setAnswer] = useState<number[]>([]);
  const [message, setMessage] = useState(
    "Help your pal send a rocket to the stars. Crack five growing codes!",
  );
  const [gentle, setGentle] = useState(true);
  function launch(nextRound: number) {
    setRound(nextRound);
    // Draw from multiple shuffled sets so repeats remain possible in longer codes.
    setCode(
      shuffle([...Array.from({ length: 3 }, () => [0, 1, 2, 3]).flat()]).slice(
        0,
        nextRound + 1,
      ),
    );
    setAnswer([]);
    setPhase("look");
    setMessage(
      "Look at the code from left to right. Hide it when you’re ready.",
    );
  }
  function choose(value: number) {
    if (phase !== "play") return;
    if (value !== code[answer.length]) {
      setAnswer([]);
      setMessage(
        "Nearly! Your code is still safe. Try from the start, or peek again.",
      );
      return;
    }
    const next = [...answer, value];
    setAnswer(next);
    if (next.length === code.length) {
      setPhase("won");
      setMessage(
        round === 5
          ? `Lift-off! You cracked all five codes with ${character.name}!`
          : "Code cracked! Your rocket is one step closer to lift-off.",
      );
    } else
      setMessage(
        `Good match! ${next.length} of ${code.length} symbols entered.`,
      );
  }
  return (
    <section aria-label="Rocket code game">
      <h3>Rocket code</h3>
      <p>Remember the symbols, then tap them in the same order.</p>
      <div className="drawing-choices">
        <button aria-pressed={gentle} onClick={() => setGentle(true)}>
          Practice · code stays visible
        </button>
        <button aria-pressed={!gentle} onClick={() => setGentle(false)}>
          Challenge · remember the code
        </button>
      </div>
      <div
        className="crew-mission-progress"
        aria-label={`${phase === "won" ? round : round - 1} of 5 codes cracked`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            data-done={n < round || (n === round && phase === "won")}
          >
            {n < round || (n === round && phase === "won") ? "★" : n}
          </span>
        ))}
      </div>
      <p role="status" className="activity-status">
        {message}
      </p>
      {code.length > 0 && (
        <ol className="rocket-code" aria-label="Rocket code">
          {code.map((v, i) => (
            <li
              key={i}
              aria-label={`Position ${i + 1}: ${phase === "look" || gentle || phase === "won" ? symbolNames[v] : answer[i] !== undefined ? symbolNames[answer[i]] : "hidden"}`}
            >
              {phase === "look" || gentle || phase === "won"
                ? symbols[v]
                : answer[i] !== undefined
                  ? symbols[answer[i]]
                  : "?"}
            </li>
          ))}
        </ol>
      )}
      {phase === "play" && (
        <p>
          {answer.length} / {code.length} symbols entered
        </p>
      )}
      <div className="rocket-controls">
        {symbols.map((symbol, i) => (
          <button
            key={symbol}
            disabled={phase !== "play"}
            aria-label={symbolNames[i]}
            onClick={() => choose(i)}
          >
            <span aria-hidden="true">{symbol}</span>
            <small>{symbolNames[i]}</small>
          </button>
        ))}
      </div>
      <div className="drawing-choices">
        {phase === "ready" && (
          <button onClick={() => launch(1)}>Start rocket mission</button>
        )}
        {phase === "look" && (
          <button
            onClick={() => {
              setPhase("play");
              setMessage("Your turn! Tap the symbols in order.");
            }}
          >
            {gentle ? "Enter the code" : "Hide code — my turn!"}
          </button>
        )}
        {phase === "play" && (
          <button
            onClick={() => {
              setPhase("look");
              setAnswer([]);
              setMessage("Take another look. Then try from the start.");
            }}
          >
            Peek at the code
          </button>
        )}
        {phase === "won" && (
          <button onClick={() => launch(round === 5 ? 1 : round + 1)}>
            {round === 5
              ? "Start a new mission"
              : `Next code · ${round + 2} symbols →`}
          </button>
        )}
      </div>
      {phase === "won" && (
        <p className="crew-celebration">
          {round === 5
            ? "🚀 Mission complete! Great place for a break, or choose another game."
            : `★ Code ${round} of 5 complete!`}
        </p>
      )}
    </section>
  );
}

function GameCoach({ game, character }: { game: Game; character: Character }) {
  const promptId = `game-${game}` as keyof typeof gameTips;
  const [reply, setReply] = useState(gameTips[promptId].fallback);
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState("Game tip");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function ask() {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    const timeout = setTimeout(() => abort.abort(), 22000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: character.id, promptId }),
        signal: abort.signal,
      });
      if (!response.ok) throw Error("tip unavailable");
      const data = await response.json();
      if (typeof data.reply !== "string") throw Error("invalid tip");
      if (!abort.signal.aborted) {
        setReply(data.reply);
        setSource(data.source === "ai" ? "AI character tip" : "Storybook tip");
      }
    } catch {
      if (!abort.signal.aborted) {
        setReply(gameTips[promptId].fallback);
        setSource("Storybook tip");
      }
    } finally {
      clearTimeout(timeout);
      controller.current = null;
      setBusy(false);
    }
  }
  return (
    <aside className="crew-coach">
      <span className="eyebrow">YOUR PLAY PAL</span>
      <h3>{character.name}’s corner</h3>
      <p aria-live="polite">{reply}</p>
      <small>{source}</small>
      <button className="button button-blue" disabled={busy} onClick={ask}>
        {busy ? "Thinking… keep playing!" : "Give me a game tip"}
      </button>
      <p className="crew-reset-note">
        Optional AI tips from a pretend character can make mistakes. No typing
        needed. Games work while your pal thinks.
      </p>
    </aside>
  );
}
