"use client";

import { useEffect } from "react";
import { CloseIcon, InfoIcon } from "./Icons";
import type { Lang } from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";

const SAMPLE_FILES: Array<{
  key: "payStub" | "insuranceDec" | "accidentDamage" | "decoyCat";
  href: string;
}> = [
  { key: "payStub", href: "/samples/sample-pay-stub.png" },
  { key: "insuranceDec", href: "/samples/sample-insurance-dec.png" },
  { key: "accidentDamage", href: "/samples/sample-accident-damage.png" },
  { key: "decoyCat", href: "/samples/sample-decoy-cat.png" },
];

export function AboutDialog({
  open,
  lang,
  onClose,
}: {
  open: boolean;
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

  const sections = [
    STRINGS.about.fictional,
    STRINGS.about.seeded,
    STRINGS.about.live,
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-glade-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-glade-line px-5 py-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-glade-accent">
              <InfoIcon className="h-3.5 w-3.5" />
              {t(STRINGS.about.title, lang)}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-glade-ink/85">
              {t(STRINGS.about.intro, lang)}
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

        <div className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-5">
          {sections.map((s, i) => (
            <div key={i}>
              <p className="text-xs font-semibold uppercase tracking-wide text-glade-accent">
                {t(s.title, lang)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-glade-ink/85">
                {t(s.body, lang)}
              </p>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-glade-accent">
              {t(STRINGS.about.samples.title, lang)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-glade-ink/85">
              {t(STRINGS.about.samples.body, lang)}
            </p>
            <ul className="mt-2 space-y-1">
              {SAMPLE_FILES.map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-glade-accent hover:underline"
                  >
                    {t(STRINGS.about.samples.items[key], lang)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
