"use client";

import { useEffect, useRef, useState } from "react";
import { UploadIcon, FileIcon, CloseIcon } from "./Icons";
import type { Lang, UploadedFile } from "@/lib/types";
import { STRINGS, t } from "@/lib/i18n";

function AnalyzingBlock({ lang }: { lang: Lang }) {
  const [tick, setTick] = useState(0);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    setTick(0);
    const id = window.setInterval(() => setTick((t) => t + 1), 1500);
    return () => window.clearInterval(id);
  }, []);

  const steps = STRINGS.upload.analyzingSteps[lang];
  const stepIndex = Math.min(tick, steps.length - 1);
  const elapsedSec = Math.max(1, Math.floor((Date.now() - startRef.current) / 1000));

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-glade-line bg-glade-sand/60 px-4 py-2.5 text-sm text-glade-muted">
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-glade-accent" />
        <span className="truncate transition-opacity duration-300">
          {steps[stepIndex]}
        </span>
      </div>
      <span className="shrink-0 tabular-nums text-xs text-glade-muted/80">
        {elapsedSec}s
      </span>
    </div>
  );
}

const MAX_BYTES = 10 * 1024 * 1024;

type CommonProps = {
  lang: Lang;
  loading: boolean;
  files: UploadedFile[];
};

type SingleProps = CommonProps & {
  multi?: false;
  onFile: (file: File) => void;
  onReplace: () => void;
};

type MultiProps = CommonProps & {
  multi: true;
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
};

type Props = SingleProps | MultiProps;

function tooBig(file: File, lang: Lang) {
  if (file.size > MAX_BYTES) {
    alert(
      lang === "es"
        ? `El archivo "${file.name}" supera los 10 MB.`
        : `File "${file.name}" is larger than 10 MB.`,
    );
    return true;
  }
  return false;
}

export function UploadZone(props: Props) {
  const { lang, loading, files } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (props.multi) {
      const accepted: File[] = [];
      for (const f of Array.from(fileList)) {
        if (!tooBig(f, lang)) accepted.push(f);
      }
      if (accepted.length > 0) props.onFiles(accepted);
    } else {
      const f = fileList[0];
      if (!tooBig(f, lang)) props.onFile(f);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*,application/pdf"
      multiple={props.multi}
      className="hidden"
      onChange={(e) => handleFiles(e.target.files)}
    />
  );

  if (loading) {
    return (
      <div className="mt-3 space-y-2">
        {files.length > 0 ? (
          <ul className="space-y-1.5">
            {files.map((f, i) => (
              <FileRow key={`${f.name}-${i}`} file={f} lang={lang} muted />
            ))}
          </ul>
        ) : null}
        <AnalyzingBlock lang={lang} />
        {hiddenInput}
      </div>
    );
  }

  if (!props.multi) {
    if (files.length > 0) {
      const f = files[0];
      return (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-glade-line">
            <div className="flex min-w-0 items-center gap-2 text-sm text-glade-ink">
              <FileIcon className="h-4 w-4 text-glade-muted" />
              <span className="truncate">{f.name}</span>
            </div>
            <button
              type="button"
              onClick={props.onReplace}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-glade-accent hover:bg-glade-accent-soft"
            >
              {t(STRINGS.buttons.replace, lang)}
            </button>
          </div>
          {hiddenInput}
        </div>
      );
    }

    return (
      <div className="mt-3">
        <DropZone
          lang={lang}
          multi={false}
          dragOver={dragOver}
          setDragOver={setDragOver}
          onClickPick={openPicker}
          onFiles={handleFiles}
        />
        {hiddenInput}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {files.length > 0 ? (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <FileRow
              key={`${f.name}-${i}`}
              file={f}
              lang={lang}
              onRemove={() => props.onRemove(i)}
            />
          ))}
          <li>
            <button
              type="button"
              onClick={openPicker}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-glade-accent hover:bg-glade-accent-soft"
            >
              <UploadIcon className="h-3.5 w-3.5" />
              {t(STRINGS.upload.addAnother, lang)}
            </button>
          </li>
        </ul>
      ) : (
        <DropZone
          lang={lang}
          multi
          dragOver={dragOver}
          setDragOver={setDragOver}
          onClickPick={openPicker}
          onFiles={handleFiles}
        />
      )}
      {hiddenInput}
    </div>
  );
}

function DropZone({
  lang,
  multi,
  dragOver,
  setDragOver,
  onClickPick,
  onFiles,
}: {
  lang: Lang;
  multi: boolean;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onClickPick: () => void;
  onFiles: (files: FileList | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClickPick}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(e.dataTransfer.files);
      }}
      className={`flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-sm transition-colors ${
        dragOver
          ? "border-glade-accent bg-glade-accent-soft text-glade-accent"
          : "border-glade-line text-glade-muted hover:border-glade-accent/50 hover:bg-glade-accent-soft/40"
      }`}
    >
      <UploadIcon className="h-5 w-5" />
      <span className="text-center">
        {t(multi ? STRINGS.upload.dragHereMulti : STRINGS.upload.dragHere, lang)}
      </span>
    </button>
  );
}

function FileRow({
  file,
  lang,
  onRemove,
  muted,
}: {
  file: UploadedFile;
  lang: Lang;
  onRemove?: () => void;
  muted?: boolean;
}) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ring-1 ring-glade-line ${
        muted ? "bg-glade-sand/60" : "bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm text-glade-ink">
        <FileIcon className="h-4 w-4 text-glade-muted" />
        <span className="truncate">{file.name}</span>
        <span className="shrink-0 text-xs text-glade-muted">
          {(file.sizeKb / 1024).toFixed(2)} MB
        </span>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-md p-1 text-glade-muted hover:bg-glade-rose-soft hover:text-glade-rose"
          aria-label={t(STRINGS.upload.remove, lang)}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </li>
  );
}
