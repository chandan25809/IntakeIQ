import type { AiReview, Lang } from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";
import { ConfidencePill } from "./ConfidencePill";
import { SparkleIcon } from "./Icons";

export function AiReviewPanel({
  review,
  lang,
  translating = false,
}: {
  review: AiReview;
  lang: Lang;
  translating?: boolean;
}) {
  const allGood =
    review.matches && review.issues.length === 0 && review.confidence === "high";

  return (
    <div className="relative mt-3 overflow-hidden rounded-lg bg-glade-sand/60 p-3 ring-1 ring-glade-line">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-glade-ink">
          <SparkleIcon className="h-3.5 w-3.5 text-glade-accent" />
          {t(STRINGS.panels.aiReview, lang)}
        </div>
        {translating ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-glade-accent-soft px-2 py-0.5 text-[11px] font-medium text-glade-accent">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-glade-accent" />
            {t(STRINGS.panels.translating, lang)}
          </span>
        ) : (
          <ConfidencePill confidence={review.confidence} lang={lang} />
        )}
      </div>

      <div
        className={`transition-opacity duration-300 ${
          translating ? "opacity-40" : "opacity-100"
        }`}
        aria-busy={translating}
      >
        {review.summary ? (
          <p className="mt-2 text-sm text-glade-ink/80 leading-snug">
            {review.summary}
          </p>
        ) : null}

        {review.issues.length > 0 ? (
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-glade-rose">
              {t(STRINGS.panels.issuesFound, lang)}
            </p>
            <ul className="mt-1 space-y-1 text-sm text-glade-ink/80">
              {review.issues.map((it, i) => (
                <li key={i} className="flex gap-2 leading-snug">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-glade-rose" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {review.suggestions.length > 0 ? (
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-glade-accent">
              {t(STRINGS.panels.suggestions, lang)}
            </p>
            <ul className="mt-1 space-y-1 text-sm text-glade-ink/80">
              {review.suggestions.map((it, i) => (
                <li key={i} className="flex gap-2 leading-snug">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-glade-accent" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {allGood ? (
          <p className="mt-2 text-sm text-emerald-700">
            {lang === "es"
              ? "Todo se ve bien. Gracias."
              : "Everything looks good. Thank you."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
