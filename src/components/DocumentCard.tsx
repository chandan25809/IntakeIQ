"use client";

import type {
  Lang,
  RequiredDoc,
  AiReview,
  DocStatus,
  UploadedFile,
} from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";
import { ICON_MAP } from "./Icons";
import { StatusPill } from "./StatusPill";
import { AiReviewPanel } from "./AiReviewPanel";
import { UploadZone } from "./UploadZone";

export type DocCardState = {
  status: DocStatus;
  files: UploadedFile[];
  review?: AiReview;
  reviewByLang?: { en?: AiReview; es?: AiReview };
  uploading?: boolean;
  translating?: boolean;
};

export function DocumentCard({
  doc,
  state,
  lang,
  onExplain,
  onUpload,
  onReplace,
  onRemoveFile,
}: {
  doc: RequiredDoc;
  state: DocCardState;
  lang: Lang;
  onExplain: () => void;
  onUpload: (files: File[]) => void;
  onReplace: () => void;
  onRemoveFile: (index: number) => void;
}) {
  const Icon = ICON_MAP[doc.icon] ?? ICON_MAP.shield;
  const isMulti = Boolean(doc.multi);
  const totalSizeMb =
    state.files.reduce((acc, f) => acc + f.sizeKb, 0) / 1024;

  return (
    <div className="flex flex-col rounded-xl bg-white p-5 shadow-card ring-1 ring-glade-line">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-glade-accent-soft text-glade-accent">
            <Icon />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-glade-ink leading-tight">
              {t(doc.title, lang)}
            </h3>
            <p className="mt-0.5 text-xs text-glade-muted leading-snug">
              {t(doc.oneLiner, lang)}
            </p>
          </div>
        </div>
        <StatusPill status={state.status} lang={lang} />
      </div>

      <div className="mt-4 grow">
        {isMulti ? (
          <UploadZone
            multi
            lang={lang}
            files={state.files}
            loading={Boolean(state.uploading)}
            onFiles={onUpload}
            onRemove={onRemoveFile}
          />
        ) : (
          <UploadZone
            lang={lang}
            files={state.files}
            loading={Boolean(state.uploading)}
            onFile={(f) => onUpload([f])}
            onReplace={onReplace}
          />
        )}

        {state.review ? (
          <AiReviewPanel
            review={state.review}
            lang={lang}
            translating={Boolean(state.translating)}
          />
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-glade-line pt-3">
        <button
          type="button"
          onClick={onExplain}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-glade-accent hover:bg-glade-accent-soft"
        >
          {t(STRINGS.buttons.explain, lang)}
        </button>
        <div className="text-xs text-glade-muted">
          {state.files.length > 0 ? (
            <>
              {isMulti
                ? t(STRINGS.upload.fileCount, lang)(state.files.length)
                : null}
              {isMulti ? " · " : null}
              {totalSizeMb.toFixed(2)} MB
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
