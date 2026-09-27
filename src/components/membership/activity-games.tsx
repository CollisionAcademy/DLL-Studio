"use client";
import { useState } from "react";
import { boardResult, characterMove, type Square } from "@/lib/activity-games";
import type { Character } from "@/lib/characters";

export function TicTacToe({ character }: { character: Character }) {
  const [board, setBoard] = useState<Square[]>(Array(9).fill(null));
  const result = boardResult(board);
  function play(i: number) {
    if (board[i] || result) return;
    const next = [...board];
    next[i] = "X";
    const move = characterMove(next);
    if (move !== null) next[move] = "O";
    setBoard(next);
  }
  return (
    <section aria-label="Tic-tac-toe game">
      <h3>Your X. {character.name}’s O.</h3>
      <p>
        Pick a square. Get three in a row! Your pretend pal takes a turn after
        you.
      </p>
      <p role="status" className="activity-status">
        {result === "X"
          ? "You found three! Wonderful thinking."
          : result === "O"
            ? `${character.name} found three. Another friendly round?`
            : result === "draw"
              ? "A tie! Two clever players, one happy board."
              : "Your turn — choose an empty square."}
      </p>
      <div className="tic-board">
        {board.map((square, i) => (
          <button
            key={i}
            aria-label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}: ${square || "empty"}`}
            disabled={Boolean(square || result)}
            onClick={() => play(i)}
          >
            {square || "·"}
          </button>
        ))}
      </div>
      <button
        className="button button-blue"
        onClick={() => setBoard(Array(9).fill(null))}
      >
        New game
      </button>
    </section>
  );
}

const palettes = [
  { name: "Sunny yellow", color: "#ffda52" },
  { name: "Sky blue", color: "#68bbed" },
  { name: "Leaf green", color: "#85c78b" },
  { name: "Berry pink", color: "#f094b4" },
];
const drawings = [
  {
    title: "A cozy little house",
    pieces: [
      { d: "M70 160 L180 60 L290 160 Z", x: 180, y: 122, n: 4 },
      { d: "M90 160 H270 V290 H90 Z", x: 180, y: 185, n: 1 },
      { d: "M150 215 H205 V290 H150 Z", x: 177, y: 255, n: 2 },
      { d: "M108 182 H140 V217 H108 Z", x: 124, y: 201, n: 2 },
      { d: "M220 182 H253 V217 H220 Z", x: 236, y: 201, n: 2 },
      { d: "M25 290 Q180 265 335 290 V325 H25 Z", x: 65, y: 309, n: 3 },
      {
        d: "M270 45 A24 24 0 1 0 318 45 A24 24 0 1 0 270 45",
        x: 294,
        y: 46,
        n: 1,
      },
    ],
  },
  {
    title: "A sky full of balloons",
    pieces: [
      {
        d: "M45 100 C45 20 140 20 140 100 C140 145 93 177 93 177 C93 177 45 145 45 100Z",
        x: 92,
        y: 100,
        n: 4,
      },
      {
        d: "M135 80 C135 0 230 0 230 80 C230 125 183 157 183 157 C183 157 135 125 135 80Z",
        x: 182,
        y: 80,
        n: 1,
      },
      {
        d: "M225 110 C225 30 320 30 320 110 C320 155 273 187 273 187 C273 187 225 155 225 110Z",
        x: 272,
        y: 110,
        n: 2,
      },
      { d: "M145 235 H222 L210 300 H157Z", x: 183, y: 270, n: 3 },
      {
        d: "M28 300 Q90 260 140 300 Q210 280 332 305 V330 H28Z",
        x: 89,
        y: 314,
        n: 3,
      },
    ],
  },
  {
    title: "A flower for a friend",
    pieces: [
      { d: "M170 160 H190 V302 H170Z", x: 180, y: 263, n: 3 },
      { d: "M172 260 Q80 260 80 208 Q150 204 172 260Z", x: 126, y: 234, n: 3 },
      {
        d: "M190 233 Q277 234 278 183 Q215 180 190 233Z",
        x: 238,
        y: 208,
        n: 3,
      },
      { d: "M145 112 C100 18 225 18 215 112Z", x: 180, y: 70, n: 4 },
      { d: "M212 110 C310 44 324 185 216 182Z", x: 265, y: 143, n: 2 },
      { d: "M211 177 C236 277 113 268 144 177Z", x: 178, y: 219, n: 4 },
      { d: "M148 178 C47 207 36 59 148 110Z", x: 96, y: 142, n: 2 },
      {
        d: "M138 144 A42 42 0 1 0 222 144 A42 42 0 1 0 138 144",
        x: 180,
        y: 146,
        n: 1,
      },
    ],
  },
];
export function ColorTogether({ character }: { character: Character }) {
  const [drawing, setDrawing] = useState(0);
  const [color, setColor] = useState(1);
  const [painted, setPainted] = useState<number[]>([]);
  const [message, setMessage] = useState(
    "Choose a color, then tap a matching number in the drawing.",
  );
  const sheet = drawings[drawing];
  function paint(i: number) {
    if (sheet.pieces[i].n !== color) {
      setMessage(
        `That shape wants color ${sheet.pieces[i].n}. Match the numbers and try again!`,
      );
      return;
    }
    const next = Array.from(new Set([...painted, i]));
    setPainted(next);
    setMessage(
      next.length === sheet.pieces.length
        ? `${character.name} says: A wonderful splash of imagination! Your drawing is complete.`
        : "A lovely match! Keep coloring at your own pace.",
    );
  }
  return (
    <section aria-label="Color by numbers">
      <h3>Color with {character.name}</h3>
      <div className="drawing-choices">
        {drawings.map((d, i) => (
          <button
            key={d.title}
            aria-pressed={drawing === i}
            onClick={() => {
              setDrawing(i);
              setPainted([]);
              setMessage("Choose a color, then tap its number.");
            }}
          >
            {d.title}
          </button>
        ))}
      </div>
      <div className="color-palette" aria-label="Choose a color">
        {palettes.map((p, i) => (
          <button
            key={p.name}
            style={{ background: p.color }}
            aria-pressed={color === i + 1}
            aria-label={`Color ${i + 1}: ${p.name}`}
            onClick={() => setColor(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="activity-status" role="status">
        {message}
      </p>
      <svg
        className="color-drawing"
        viewBox="0 0 360 350"
        role="group"
        aria-label={sheet.title}
      >
        {drawing === 1 && (
          <path
            d="M93 177L165 235M183 157V235M273 187L205 235"
            fill="none"
            stroke="#203b49"
            strokeWidth="2"
          />
        )}
        {sheet.pieces.map((p, i) => (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Shape ${i + 1}, color ${p.n}${painted.includes(i) ? ", painted" : ""}`}
            onClick={() => paint(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                paint(i);
              }
            }}
          >
            <path
              d={p.d}
              fill={painted.includes(i) ? palettes[p.n - 1].color : "#fff"}
              stroke="#203b49"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="18"
              fontWeight="800"
              fill="#203b49"
              pointerEvents="none"
            >
              {p.n}
            </text>
          </g>
        ))}
      </svg>
      <p>
        {painted.length} / {sheet.pieces.length} shapes colored
      </p>
      <button
        className="text-button"
        onClick={() => {
          setPainted([]);
          setMessage("A fresh page. Pick your first color!");
        }}
      >
        Start this drawing again
      </button>
    </section>
  );
}

const memoryCards = ["🌈", "⭐", "🌻", "⭐", "🌈", "🌻"];
export function MemoryPairs({ character }: { character: Character }) {
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const cards = round % 2 ? [...memoryCards].reverse() : memoryCards;
  function flip(i: number) {
    if (open.includes(i) || matched.includes(i)) return;
    const next = open.length === 2 ? [i] : [...open, i];
    setOpen(next);
    if (next.length === 2 && cards[next[0]] === cards[next[1]]) {
      setMatched([...matched, ...next]);
      setOpen([]);
    }
  }
  return (
    <section aria-label="Memory pairs game">
      <h3>Little clues with {character.name}</h3>
      <p>
        Turn over two cards. Can you find their matching friends? No timer, no
        hurry.
      </p>
      <p role="status" className="activity-status">
        {matched.length === 6
          ? "All three pairs found! A wonderful bit of noticing."
          : open.length === 2
            ? "Two different pictures. Pick another card to try again."
            : `${matched.length / 2} of 3 pairs found. Pick a card.`}
      </p>
      <div className="memory-board">
        {cards.map((card, i) => (
          <button
            key={i}
            disabled={matched.includes(i)}
            aria-label={`Card ${i + 1}: ${matched.includes(i) ? "matched " + card : open.includes(i) ? card : "face down"}`}
            onClick={() => flip(i)}
          >
            {open.includes(i) || matched.includes(i) ? card : "?"}
          </button>
        ))}
      </div>
      <button
        className="button button-blue"
        onClick={() => {
          setOpen([]);
          setMatched([]);
          setRound(round + 1);
        }}
      >
        New matching game
      </button>
    </section>
  );
}
