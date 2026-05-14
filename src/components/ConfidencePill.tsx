import type { Confidence, Lang } from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";
import { SparkleIcon } from "./Icons";

const STYLES: Record<Confidence, { bg: string; fg: string; ring: string }> = {
  high: { bg: "bg-glade-mint-soft", fg: "text-emerald-700", ring: "ring-emerald-300/50" },
  medium: { bg: "bg-glade-amber-soft", fg: "text-glade-amber", ring: "ring-glade-amber/30" },
  low: { bg: "bg-glade-rose-soft", fg: "text-glade-rose", ring: "ring-glade-rose/30" },
};

export function ConfidencePill({
  confidence,
  lang,
}: {
  confidence: Confidence;
  lang: Lang;
}) {
  const s = STYLES[confidence];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset ${s.bg} ${s.fg} ${s.ring}`}
      title={t(STRINGS.panels.confidence, lang)}
    >
      <SparkleIcon className="h-3 w-3" />
      {t(STRINGS.confidence[confidence], lang)}
    </span>
  );
}
