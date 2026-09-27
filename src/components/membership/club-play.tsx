"use client";
import Image from "next/image";
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
      <section className="member-panel">
        <h2>Who’s in your crew today?</h2>
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
      <div className="member-columns">
        <TicTacToe />
        <RockPaperScissors />
      </div>
      <WordGame />
    </>
  );
}
export function winner(board: (string | null)[]) {
  for (const [a, b, c] of [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ])
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  return null;
}
function TicTacToe() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const won = winner(board);
  function move(index: number) {
    if (board[index] || won) return;
    const next = [...board];
    next[index] = "★";
    if (!winner(next)) {
      const empty = next
        .map((v, i) => (v === null ? i : -1))
        .filter((i) => i >= 0);
      if (empty.length) next[empty[0]] = "●";
    }
    setBoard(next);
  }
  return (
    <section className="member-panel">
      <h2>Tic-Tac-Toe</h2>
      <p>You’re ★. The crew is ●.</p>
      <div className="tic-board">
        {board.map((value, i) => (
          <button
            key={i}
            aria-label={`Square ${i + 1}: ${value || "empty"}`}
            disabled={Boolean(value || won)}
            onClick={() => move(i)}
          >
            {value || "·"}
          </button>
        ))}
      </div>
      <p role="status">
        {won
          ? `${won} made a line. Great game!`
          : board.every(Boolean)
            ? "A tie! Everyone played a part."
            : "Pick an empty square."}
      </p>
      <button
        className="text-button"
        onClick={() => setBoard(Array(9).fill(null))}
      >
        Play again
      </button>
    </section>
  );
}
function RockPaperScissors() {
  const [result, setResult] = useState("Pick one. The crew will pick too!");
  const choices = ["Rock", "Paper", "Scissors"];
  return (
    <section className="member-panel">
      <h2>Rock, Paper, Scissors</h2>
      <p>A little friendly surprise.</p>
      <div className="chat-choices">
        {choices.map((c, i) => (
          <button
            key={c}
            onClick={() => {
              const other = Math.floor(Math.random() * 3);
              setResult(
                `You picked ${c.toLowerCase()}. The crew picked ${choices[other].toLowerCase()}. ${i === other ? "It’s a tie!" : (i - other + 3) % 3 === 1 ? "You win this round!" : "The crew wins this round!"} Thanks for playing together.`,
              );
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="storybook-bubble" role="status">
        {result}
      </p>
    </section>
  );
}
function WordGame() {
  const [result, setResult] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const grid = "CREWAPLAYBKINDCDOGSD";
  return (
    <section className="member-panel">
      <h2>Words with friends.</h2>
      <p>Which word means helping and caring?</p>
      <div className="chat-choices">
        {["KIND", "WOBBLE", "HAT"].map((w) => (
          <button
            key={w}
            onClick={() =>
              setResult(
                w === "KIND"
                  ? "KIND! The crew loves a little kindness."
                  : "That’s a fun word too. Try KIND!",
              )
            }
          >
            {w}
          </button>
        ))}
      </div>
      <p role="status">{result}</p>
      <h3>Find CREW, PLAY, and KIND.</h3>
      <p>Tap letters across a row. Tap again to clear a letter.</p>
      <div className="word-grid">
        {[...grid].map((letter, i) => (
          <button
            key={i}
            aria-label={`Row ${Math.floor(i / 5) + 1}, column ${(i % 5) + 1}: ${letter}`}
            aria-pressed={selected.includes(i)}
            onClick={() =>
              setSelected((s) =>
                s.includes(i) ? s.filter((n) => n !== i) : [...s, i],
              )
            }
          >
            {letter}
          </button>
        ))}
      </div>
      <p aria-live="polite">
        {[
          [0, 1, 2, 3],
          [5, 6, 7, 8],
          [10, 11, 12, 13],
        ].every((row) => row.every((i) => selected.includes(i)))
          ? "You found the crew’s three words!"
          : "Take your time. Look one row at a time."}
      </p>
      <button className="text-button" onClick={() => setSelected([])}>
        Start again
      </button>
    </section>
  );
}
