"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { chatPrompts, type Character } from "@/lib/characters";
type Message = { role: "assistant" | "user"; text: string; source?: string };
export function CharacterChat({ character: c }: { character: Character }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: c.greeting, source: "storybook" },
  ]);
  const [busy, setBusy] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const panel = scroll.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [messages, busy]);
  useEffect(() => () => controller.current?.abort(), []);
  async function ask(prompt: (typeof chatPrompts)[number]) {
    if (busy) return;
    setMessages((m) => [...m.slice(-18), { role: "user", text: prompt.label }]);
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    const timer = setTimeout(() => abort.abort(), 26000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: c.id, promptId: prompt.id }),
        signal: abort.signal,
      });
      if (!response.ok) throw Error("chat");
      const data = await response.json();
      if (typeof data.reply !== "string") throw Error("reply");
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply, source: data.source },
      ]);
    } catch {
      if (!abort.signal.aborted || controller.current === abort)
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "My story radio is taking a little break. Try a question again in a moment, or play my game while you wait!",
            source: "storybook",
          },
        ]);
    } finally {
      clearTimeout(timer);
      if (controller.current === abort) setBusy(false);
    }
  }
  return (
    <>
      <div className="chat-heading">
        <div className="chat-avatar">
          <Image src={`/characters/${c.id}.png`} alt="" fill sizes="57px" />
        </div>
        <div>
          <span className="eyebrow">A LITTLE CONVERSATION</span>
          <h2>Chat with {c.name}</h2>
        </div>
        <button
          className="text-button chat-clear"
          disabled={busy}
          onClick={() =>
            setMessages([
              { role: "assistant", text: c.greeting, source: "storybook" },
            ])
          }
        >
          Start fresh
        </button>
      </div>
      <div
        ref={scroll}
        className="chat-messages"
        role="log"
        aria-label={`Chat with ${c.name}`}
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((m, i) => (
          <div className={`chat-message ${m.role}`} key={i}>
            {m.text}
            {m.role === "assistant" ? (
              <span className="message-source">
                {m.source === "ai" ? "AI character reply" : "Storybook reply"}
              </span>
            ) : null}
          </div>
        ))}
        {busy ? (
          <div className="chat-message assistant loading-dots" role="status">
            {c.name} is thinking…
          </div>
        ) : null}
      </div>
      <span className="chat-choice-label">Pick something to ask:</span>
      <div className="chat-choices">
        {chatPrompts.map((p) => (
          <button disabled={busy} onClick={() => ask(p)} key={p.id}>
            <span aria-hidden="true">{p.emoji}</span>
            {p.label}
          </button>
        ))}
      </div>
      <p className="chat-note">
        I’m a pretend character. My AI replies can make mistakes. No typing or
        personal details needed.{" "}
        <Link href="/grown-ups">Grown-ups, learn more.</Link>
      </p>
    </>
  );
}
