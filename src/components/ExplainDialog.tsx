"use client";

import { useEffect } from "react";
import { CloseIcon, SparkleIcon } from "./Icons";
import type { Lang } from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";

function renderExplanation(text: string) {
  if (!text) return null;
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((p, i) => {
    const headingMatch = p.match(/^\*\*(.+?)\*\*\s*(.*)$/s);
    if (headingMatch) {
      const [, heading, rest] = headingMatch;
      return (
        <div key={i}>
          <p className="text-xs font-semibold uppercase tracking-wide text-glade-accent">
            {heading.trim()}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-glade-ink/85 whitespace-pre-wrap">
            {rest.trim()}
          </p>
        </div>
      );
    }
    return (
      <p
        key={i}
        className="text-sm leading-relaxed text-glade-ink/85 whitespace-pre-wrap"
      >
        {p}
      </p>
    );
  });
}

export function ExplainDialog({
  open,
  docTitle,
  text,
  loading,
  lang,
  onClose,
}: {
  open: boolean;
  docTitle: string;
  text: string;
  loading: boolean;
  lang: Lang;
  onClose: () => void;
}) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-glade-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-glade-line px-5 py-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-glade-accent">
              <SparkleIcon className="h-3.5 w-3.5" />
              {t(STRINGS.modal.explainTitle, lang)}
            </div>
            <p className="mt-1 text-base font-medium text-glade-ink">
              {docTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-glade-muted hover:bg-glade-sand hover:text-glade-ink"
            aria-label={t(STRINGS.buttons.close, lang)}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-glade-muted">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-glade-accent" />
              {t(STRINGS.modal.loading, lang)}
            </div>
          ) : (
            renderExplanation(text)
          )}
        </div>
      </div>
    </div>
  );
}
