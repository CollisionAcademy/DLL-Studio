"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
} from "lucide-react";
import type { Character } from "@/lib/characters";
type GameProps = { character: Character };
export function MiniGame({ character }: GameProps) {
  const [started, setStarted] = useState(false);
  const [version, setVersion] = useState(0);
  function restart() {
    setVersion((v) => v + 1);
    setStarted(true);
  }
  return (
    <div className="game-shell">
      <div className="game-toolbar">
        <span>
          {character.emoji} {character.name}’s game
        </span>
        {started ? (
          <button className="text-button" onClick={restart}>
            <RotateCcw size={13} /> Start over
          </button>
        ) : null}
      </div>
      {!started ? (
        <div className="game-start">
          <span aria-hidden="true">{character.emoji}</span>
          <h3>Let’s try {character.game}!</h3>
          <p>
            {character.gameDescription}
            <br />
            Play at your own pace. You can always try again.
          </p>
          <button
            className="button button-character"
            onClick={() => setStarted(true)}
          >
            Start playing <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <GameRouter key={version} character={character} restart={restart} />
      )}
    </div>
  );
}
function GameRouter({
  character: c,
  restart,
}: GameProps & { restart: () => void }) {
  switch (c.id) {
    case "luca":
      return <GoalGame restart={restart} />;
    case "vienna":
      return <TrailGame restart={restart} />;
    case "doo-wop-dog":
      return <MemoryGame restart={restart} />;
    case "bianna":
      return <SillyGame />;
    case "leo":
      return <BuildGame restart={restart} />;
    case "gramps":
      return <KindnessGame restart={restart} />;
  }
}
function Win({
  title,
  description,
  restart,
}: {
  title: string;
  description: string;
  restart: () => void;
}) {
  return (
    <div className="game-win" role="status">
      <span aria-hidden="true">🌟</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="button button-character" onClick={restart}>
        <RotateCcw size={17} /> Play again
      </button>
    </div>
  );
}
function GoalGame({ restart }: { restart: () => void }) {
  const [keeper, setKeeper] = useState(1);
  const [results, setResults] = useState<boolean[]>([]);
  const [message, setMessage] = useState(
    "Watch the keeper. Tap an open part of the goal!",
  );
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (paused || results.length === 5) return;
    const interval = setInterval(() => setKeeper((p) => (p + 1) % 3), 1100);
    return () => clearInterval(interval);
  }, [paused, results.length]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function shoot(target: number) {
    if (paused || results.length === 5) return;
    const goal = target !== keeper;
    setPaused(true);
    setResults((r) => [...r, goal]);
    setMessage(
      goal
        ? "GOOOAL! Nice shot, teammate!"
        : "Great try! The keeper caught it. Try an open spot next time.",
    );
    timer.current = setTimeout(() => setPaused(false), 1000);
  }
  if (results.length === 5 && !paused)
    return (
      <Win
        title={`${results.filter(Boolean).length} goals! High five!`}
        description="You gave it a go and kept playing. That’s what makes a great teammate."
        restart={restart}
      />
    );
  return (
    <>
      <div className="game-toolbar">
        <span>Shot {Math.min(results.length + 1, 5)} of 5</span>
        <span>{results.filter(Boolean).length} goals</span>
      </div>
      <div className="goal-field">
        <div className="goal-net">
          <span
            className="keeper"
            style={{ left: `${keeper * 33.333}%` }}
            aria-hidden="true"
          >
            🧤
          </span>
          {["Left", "Middle", "Right"].map((label, i) => (
            <button
              key={label}
              disabled={paused}
              onClick={() => shoot(i)}
              aria-label={`Shoot ${label.toLowerCase()}${keeper === i ? ", keeper is here" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="field-ball" aria-hidden="true">
          ⚽
        </span>
      </div>
      <p className="game-status" role="status">
        {message}
      </p>
      <div className="round-dots" aria-label={`${results.length} shots taken`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={i < results.length ? (results[i] ? "goal" : "miss") : ""}
          />
        ))}
      </div>
    </>
  );
}
const rocks = [5, 6, 9];
const stars = [3, 8, 14];
function TrailGame({ restart }: { restart: () => void }) {
  const [position, setPosition] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [message, setMessage] = useState(
    "Use the arrows to reach camp. Collect stars along the way!",
  );
  function move(delta: number) {
    const next = position + delta;
    if (
      next < 0 ||
      next > 15 ||
      (delta === 1 && position % 4 === 3) ||
      (delta === -1 && position % 4 === 0)
    ) {
      setMessage("That’s the edge of the map. Let’s try another way.");
      return;
    }
    if (rocks.includes(next)) {
      setMessage("A rock blocks the trail. Can you find another route?");
      return;
    }
    setPosition(next);
    if (stars.includes(next) && !found.includes(next)) {
      setFound((f) => [...f, next]);
      setMessage("A discovery star! Great exploring.");
    } else setMessage("Keep going, explorer. Camp is at the bottom right!");
  }
  if (position === 15)
    return (
      <Win
        title="You found camp!"
        description={`You collected ${found.length} of 3 discovery stars. Every path teaches us something new.`}
        restart={restart}
      />
    );
  return (
    <div
      onKeyDown={(e) => {
        const delta: Record<string, number> = {
          ArrowUp: -4,
          ArrowDown: 4,
          ArrowLeft: -1,
          ArrowRight: 1,
        };
        if (e.key in delta) {
          e.preventDefault();
          move(delta[e.key]);
        }
      }}
    >
      <div className="game-toolbar">
        <span>Discovery stars</span>
        <span>{found.length} / 3 ⭐</span>
      </div>
      <div
        className="trail-grid"
        role="img"
        aria-label={`You are at row ${Math.floor(position / 4) + 1}, column ${(position % 4) + 1}. Camp is row 4, column 4.`}
      >
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={`trail-cell ${rocks.includes(i) ? "rock" : ""} ${position === i ? "player" : ""}`}
          >
            {position === i
              ? "🧭"
              : rocks.includes(i)
                ? "🪨"
                : i === 15
                  ? "⛺"
                  : stars.includes(i) && !found.includes(i)
                    ? "⭐"
                    : "·"}
          </span>
        ))}
      </div>
      <p className="game-status" role="status">
        {message}
      </p>
      <div className="trail-arrows">
        {[
          [-4, "Up", ArrowUp],
          [-1, "Left", ArrowLeft],
          [4, "Down", ArrowDown],
          [1, "Right", ArrowRight],
        ].map(([delta, label, Icon]) => {
          const I = Icon as typeof ArrowUp;
          return (
            <button
              key={String(label)}
              aria-label={`Move ${String(label).toLowerCase()}`}
              onClick={() => move(Number(delta))}
            >
              <I size={19} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
const clueNames: Record<string, string> = {
  "🔑": "key",
  "🐾": "paw print",
  "🎩": "hat",
  "🧩": "puzzle piece",
};
function MemoryGame({ restart }: { restart: () => void }) {
  const [deck] = useState(() => {
    const items = ["🔑", "🐾", "🎩", "🧩", "🔑", "🐾", "🎩", "🧩"];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  });
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function flip(i: number) {
    if (open.length === 2 || open.includes(i) || matched.includes(i)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setTurns((t) => t + 1);
      if (deck[next[0]] === deck[next[1]]) {
        setMatched((m) => [...m, ...next]);
        setOpen([]);
      } else timer.current = setTimeout(() => setOpen([]), 1100);
    }
  }
  if (matched.length === 8)
    return (
      <Win
        title="Case closed, detective!"
        description={`You found all four pairs in ${turns} turns. Excellent observation!`}
        restart={restart}
      />
    );
  return (
    <>
      <div className="game-toolbar">
        <span>{matched.length / 2} of 4 pairs</span>
        <span>{turns} turns</span>
      </div>
      <div className="memory-grid">
        {deck.map((item, i) => {
          const show = open.includes(i) || matched.includes(i);
          return (
            <button
              key={i}
              className={`memory-card ${show ? "revealed" : ""} ${matched.includes(i) ? "matched" : ""}`}
              onClick={() => flip(i)}
              disabled={matched.includes(i)}
              aria-label={
                show
                  ? `${clueNames[item]}${matched.includes(i) ? ", matched" : ""}`
                  : `Reveal clue ${i + 1}`
              }
            >
              {show ? item : "?"}
            </button>
          );
        })}
      </div>
      <p className="game-status" role="status">
        {open.length === 2
          ? "Different clues! Remember where they are."
          : "Turn over two cards to find matching clues."}
      </p>
    </>
  );
}
const storyWords = [
  [
    { icon: "🦆", text: "A wobbly duck" },
    { icon: "🐸", text: "A tap-dancing frog" },
    { icon: "🐧", text: "A very fancy penguin" },
    { icon: "🐘", text: "A tiny elephant" },
  ],
  [
    { icon: "🥞", text: "flipped a pancake" },
    { icon: "🫧", text: "juggled bubbles" },
    { icon: "🧦", text: "wore seven socks" },
    { icon: "🎺", text: "played a kazoo" },
  ],
  [
    { icon: "🌙", text: "on the moon" },
    { icon: "🛁", text: "in a bubble bath" },
    { icon: "🏰", text: "in a jelly castle" },
    { icon: "🧁", text: "on a giant cupcake" },
  ],
];
function SillyGame() {
  const [picks, setPicks] = useState([0, 0, 0]);
  const [count, setCount] = useState(0);
  function mix() {
    setPicks((p) =>
      p.map(
        (v, i) =>
          (v + 1 + Math.floor(Math.random() * (storyWords[i].length - 1))) %
          storyWords[i].length,
      ),
    );
    setCount((c) => c + 1);
  }
  return (
    <>
      <div className="game-toolbar">
        <span>Silly stories made</span>
        <span>{count}</span>
      </div>
      <div className="story-slots">
        {picks.map((n, i) => (
          <div className="story-slot" key={i}>
            <span aria-hidden="true">{storyWords[i][n].icon}</span>
            <b>{storyWords[i][n].text}</b>
          </div>
        ))}
      </div>
      <div className="story-result" role="status">
        {picks.map((n, i) => storyWords[i][n].text).join(" ")}!
      </div>
      <div className="game-controls">
        <button className="button button-character" onClick={mix}>
          🎲 Make it sillier!
        </button>
      </div>
      <p className="game-status">
        {count >= 3
          ? "You’re an official giggle maker! Keep mixing if you like."
          : "Tap the button to mix up a new silly story."}
      </p>
    </>
  );
}
const buildSteps = [
  {
    question: "First, our invention needs power. Pick the battery!",
    answer: "🔋",
    options: ["🧦", "🔋", "🍌"],
    names: ["sock", "battery", "banana"],
  },
  {
    question: "Now it needs to move. Pick the wheel!",
    answer: "🛞",
    options: ["🛞", "🧁", "🎩"],
    names: ["wheel", "cupcake", "hat"],
  },
  {
    question: "Finally, let’s add a light. Pick the bulb!",
    answer: "💡",
    options: ["🥕", "🎈", "💡"],
    names: ["carrot", "balloon", "light bulb"],
  },
];
function BuildGame({ restart }: { restart: () => void }) {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("Match each part to the blueprint.");
  function choose(option: string) {
    if (option === buildSteps[step].answer) {
      setStep((s) => s + 1);
      setMessage("Perfect fit! Let’s add the next part.");
    } else setMessage("An imaginative choice! Try the part that does the job.");
  }
  if (step === 3)
    return (
      <Win
        title="Invention powered up!"
        description="Power, movement, and light! You helped Leo build a pretend rescue rover. Super thinking!"
        restart={restart}
      />
    );
  return (
    <>
      <div className="game-toolbar">
        <span>Rescue rover blueprint</span>
        <span>{step} / 3 parts</span>
      </div>
      <div className="blueprint">
        {buildSteps.map((s, i) => (
          <div
            key={i}
            className={`blueprint-part ${i < step ? "done" : ""}`}
            aria-label={
              i < step ? `Part ${i + 1} installed` : `Part ${i + 1} needed`
            }
          >
            {i < step ? s.answer : "?"}
          </div>
        ))}
      </div>
      <h3 className="kindness-question">{buildSteps[step].question}</h3>
      <div className="part-options">
        {buildSteps[step].options.map((o, i) => (
          <button
            key={o}
            onClick={() => choose(o)}
            aria-label={`Choose ${buildSteps[step].names[i]}`}
          >
            {o}
          </button>
        ))}
      </div>
      <p className="game-status" role="status">
        {message}
      </p>
    </>
  );
}
const kindness = [
  {
    question: "Gramps can’t work out his new tablet. What could Vienna do?",
    options: [
      "Laugh and walk away",
      "Show him slowly, one step at a time",
      "Tell him he’s too old",
    ],
    correct: 1,
    lesson: "Patience makes a great teacher. Everyone can learn something new.",
  },
  {
    question:
      "Luca’s kite won’t fly. Gramps knows an old trick. What could Luca do?",
    options: [
      "Ask Gramps to show him",
      "Throw the kite away",
      "Decide old ideas never work",
    ],
    correct: 0,
    lesson: "A little experience can help a new idea take flight!",
  },
  {
    question:
      "Bianna suggests a new game. Gramps likes his old game. What could they do?",
    options: [
      "Argue about which is better",
      "Never play together",
      "Try each other’s games",
    ],
    correct: 2,
    lesson: "Young or old, we can all discover something wonderful together.",
  },
];
function KindnessGame({ restart }: { restart: () => void }) {
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState("");
  if (step === kindness.length)
    return (
      <Win
        title="Welcome to the Kindness Club!"
        description="Listening, sharing, and trying new things—Gramps says you’ve taught this old bird a thing or two."
        restart={restart}
      />
    );
  const q = kindness[step];
  function answer(i: number) {
    if (i === q.correct) {
      setSolved(true);
      setFeedback(q.lesson);
    } else
      setFeedback(
        "Let’s think about how everyone feels. Can you find a kinder choice?",
      );
  }
  return (
    <>
      <div className="game-toolbar">
        <span>Little lessons</span>
        <span>{step + 1} / 3</span>
      </div>
      <p className="kindness-question">{q.question}</p>
      <div className="kindness-options">
        {q.options.map((o, i) => (
          <button
            className="choice-button"
            key={o}
            disabled={solved}
            onClick={() => answer(i)}
          >
            {o}
          </button>
        ))}
      </div>
      <p className="game-status" role="status">
        {feedback || "Choose what you would do."}
      </p>
      {solved ? (
        <div className="game-controls">
          <button
            onClick={() => {
              setStep((s) => s + 1);
              setSolved(false);
              setFeedback("");
            }}
          >
            {step === 2 ? "Finish" : "Next little lesson"}{" "}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </>
  );
}
