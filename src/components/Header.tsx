import type { CaseSummary, Lang } from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";
import { InfoIcon } from "./Icons";

function fmtDate(iso: string, lang: Lang) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function Header({
  caseInfo,
  lang,
  onLangChange,
  onAboutClick,
  acceptedCount,
  totalCount,
}: {
  caseInfo: CaseSummary;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onAboutClick: () => void;
  acceptedCount: number;
  totalCount: number;
}) {
  const pct = Math.round((acceptedCount / totalCount) * 100);
  return (
    <header className="border-b border-glade-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-glade-ink text-white">
              <span className="text-sm font-semibold">IQ</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-glade-ink leading-tight">
                {STRINGS.appName.en}
              </p>
              <p className="text-xs text-glade-muted leading-tight">
                {caseInfo.attorney.firm}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAboutClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-glade-sand px-3 py-1 text-xs font-medium text-glade-muted ring-1 ring-glade-line transition-colors hover:bg-glade-accent-soft hover:text-glade-accent"
              aria-label={t(STRINGS.about.button, lang)}
            >
              <InfoIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {t(STRINGS.about.button, lang)}
              </span>
            </button>
            <LangToggle lang={lang} onChange={onLangChange} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-glade-muted">
              {t(STRINGS.caseLabel, lang)} {caseInfo.id}
            </p>
            <h1 className="mt-1 text-xl font-semibold text-glade-ink sm:text-2xl">
              {lang === "es" ? "Hola" : "Hi"}, {caseInfo.client.firstName}.
            </h1>
            <p className="mt-1 text-sm text-glade-muted">
              {caseInfo.type} · {fmtDate(caseInfo.incident.dateIso, lang)} ·{" "}
              {caseInfo.incident.state}
            </p>
            <p className="mt-0.5 text-xs text-glade-muted">
              {t(STRINGS.attorneyLabel, lang)}: {caseInfo.attorney.name}
            </p>
          </div>

          <div className="w-full sm:w-72">
            <div className="flex items-center justify-between text-xs text-glade-muted">
              <span>{t(STRINGS.progress, lang)(acceptedCount, totalCount)}</span>
              <span className="tabular-nums">{pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-glade-sand">
              <div
                className="h-full rounded-full bg-glade-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full bg-glade-sand p-0.5 text-xs font-medium ring-1 ring-glade-line">
      {(["en", "es"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`rounded-full px-3 py-1 transition-colors ${
            lang === code
              ? "bg-white text-glade-ink shadow-sm ring-1 ring-glade-line"
              : "text-glade-muted hover:text-glade-ink"
          }`}
          aria-pressed={lang === code}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
