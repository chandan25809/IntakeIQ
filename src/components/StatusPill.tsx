import type { DocStatus, Lang } from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";
import { CheckIcon, AlertIcon, HourglassIcon, CircleIcon } from "./Icons";

const STYLES: Record<DocStatus, { bg: string; fg: string; ring: string }> = {
  pending: {
    bg: "bg-glade-sand",
    fg: "text-glade-muted",
    ring: "ring-glade-line",
  },
  uploaded: {
    bg: "bg-glade-amber-soft",
    fg: "text-glade-amber",
    ring: "ring-glade-amber/30",
  },
  accepted: {
    bg: "bg-glade-mint-soft",
    fg: "text-emerald-700",
    ring: "ring-emerald-300/50",
  },
  needs_action: {
    bg: "bg-glade-rose-soft",
    fg: "text-glade-rose",
    ring: "ring-glade-rose/30",
  },
};

const ICONS: Record<DocStatus, React.ComponentType<{ className?: string }>> = {
  pending: CircleIcon,
  uploaded: HourglassIcon,
  accepted: CheckIcon,
  needs_action: AlertIcon,
};

export function StatusPill({
  status,
  lang,
}: {
  status: DocStatus;
  lang: Lang;
}) {
  const s = STYLES[status];
  const Icon = ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${s.bg} ${s.fg} ${s.ring}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {t(STRINGS.status[status], lang)}
    </span>
  );
}
