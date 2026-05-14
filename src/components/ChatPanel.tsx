"use client";

import { useEffect, useRef, useState } from "react";
import { ChatIcon, CloseIcon, SendIcon, SparkleIcon } from "./Icons";
import type { ChatMessage, Lang } from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";

export function ChatPanel({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { text?: string; error?: string };
      if (json.error) throw new Error(json.error);
      setMessages([
        ...next,
        { role: "assistant", content: json.text ?? "" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...next,
        { role: "assistant", content: t(STRINGS.chat.errorGeneric, lang) },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-glade-ink px-4 py-3 text-sm font-medium text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          <ChatIcon className="h-4 w-4" />
          {t(STRINGS.buttons.askAnything, lang)}
        </button>
      ) : (
        <div className="fixed bottom-5 right-5 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-glade-line">
          <header className="flex items-center justify-between gap-2 border-b border-glade-line px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-glade-accent-soft text-glade-accent">
                <SparkleIcon className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-medium text-glade-ink">
                {t(STRINGS.chat.title, lang)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-glade-muted hover:bg-glade-sand hover:text-glade-ink"
              aria-label={t(STRINGS.buttons.close, lang)}
            >
              <CloseIcon />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="rounded-xl bg-glade-sand/70 px-3 py-2 text-sm text-glade-ink/80">
                {t(STRINGS.chat.welcome, lang)}
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-snug ${
                    m.role === "user"
                      ? "ml-auto bg-glade-accent text-white"
                      : "bg-glade-sand text-glade-ink"
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
            {thinking ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-glade-sand px-3 py-2 text-sm text-glade-muted">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-glade-accent" />
                {t(STRINGS.chat.thinking, lang)}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-glade-line px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t(STRINGS.chat.placeholder, lang)}
              className="flex-1 rounded-lg bg-glade-sand px-3 py-2 text-sm text-glade-ink placeholder:text-glade-muted focus:outline-hidden focus:ring-2 focus:ring-glade-accent"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-glade-ink text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t(STRINGS.buttons.send, lang)}
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
