"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { DocumentCard, type DocCardState } from "@/components/DocumentCard";
import { ExplainDialog } from "@/components/ExplainDialog";
import { AboutDialog } from "@/components/AboutDialog";
import { ChatPanel } from "@/components/ChatPanel";
import { SAMPLE_CASE, REQUIRED_DOCS } from "@/data/sampleCase";
import { STRINGS, t } from "@/lib/i18n";
import type { AiReview, Lang, UploadedFile } from "@/lib/types";

const MAX_EDGE_PX = 1568;
const JPEG_QUALITY = 0.82;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = dataUrl;
  });
}

async function downsizeImage(file: File): Promise<{
  dataUrl: string;
  mimeType: string;
  sizeKb: number;
}> {
  const originalDataUrl = await fileToDataUrl(file);
  try {
    const img = await loadImage(originalDataUrl);
    const longestEdge = Math.max(img.width, img.height);
    const scale = longestEdge > MAX_EDGE_PX ? MAX_EDGE_PX / longestEdge : 1;
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");
    ctx.drawImage(img, 0, 0, width, height);
    const newDataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const newSizeKb = Math.round((newDataUrl.length * 0.75) / 1024);
    const originalSizeKb = Math.round(file.size / 1024);
    if (newSizeKb >= originalSizeKb && file.type === "image/jpeg") {
      return {
        dataUrl: originalDataUrl,
        mimeType: file.type,
        sizeKb: originalSizeKb,
      };
    }
    return { dataUrl: newDataUrl, mimeType: "image/jpeg", sizeKb: newSizeKb };
  } catch (err) {
    console.warn("downsizeImage failed, falling back to original", err);
    return {
      dataUrl: originalDataUrl,
      mimeType: file.type,
      sizeKb: Math.round(file.size / 1024),
    };
  }
}

async function asUploadedFile(file: File): Promise<UploadedFile> {
  if (file.type.startsWith("image/")) {
    const { dataUrl, mimeType, sizeKb } = await downsizeImage(file);
    return { name: file.name, sizeKb, mimeType, dataUrl };
  }
  const dataUrl = await fileToDataUrl(file);
  return {
    name: file.name,
    sizeKb: Math.round(file.size / 1024),
    mimeType: file.type,
    dataUrl,
  };
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");

  const [docStates, setDocStates] = useState<Record<string, DocCardState>>(
    () =>
      Object.fromEntries(
        REQUIRED_DOCS.map((d) => {
          const seededByLang = d.initialState.reviewByLang;
          const seededReview = d.initialState.review;
          const reviewByLang: { en?: AiReview; es?: AiReview } = seededByLang
            ? { ...seededByLang }
            : seededReview
              ? { en: seededReview }
              : {};
          return [
            d.id,
            {
              status: d.initialState.status,
              files: d.initialState.files ?? [],
              review: reviewByLang.en ?? reviewByLang.es ?? seededReview,
              reviewByLang,
              uploading: false,
            } satisfies DocCardState,
          ];
        }),
      ),
  );

  const [explain, setExplain] = useState<{
    open: boolean;
    docId: string | null;
    text: string;
    loading: boolean;
  }>({ open: false, docId: null, text: "", loading: false });

  const [aboutOpen, setAboutOpen] = useState(true);
  function closeAbout() {
    setAboutOpen(false);
  }

  const verifyGenRef = useRef<Map<string, number>>(new Map());
  const docStatesRef = useRef(docStates);
  useEffect(() => {
    docStatesRef.current = docStates;
  }, [docStates]);

  useEffect(() => {
    const current = docStatesRef.current;
    const swaps: Record<string, AiReview> = {};
    const needsFetch: { docId: string; source: AiReview }[] = [];
    for (const [docId, s] of Object.entries(current)) {
      if (!s.review) continue;
      const cached = s.reviewByLang?.[lang];
      if (cached) {
        if (cached !== s.review) swaps[docId] = cached;
      } else {
        needsFetch.push({ docId, source: s.review });
      }
    }
    if (Object.keys(swaps).length > 0 || needsFetch.length > 0) {
      setDocStates((prev) => {
        const next = { ...prev };
        for (const [docId, review] of Object.entries(swaps)) {
          next[docId] = { ...next[docId], review, translating: false };
        }
        for (const { docId } of needsFetch) {
          if (next[docId]) {
            next[docId] = { ...next[docId], translating: true };
          }
        }
        return next;
      });
    }
    let cancelled = false;
    (async () => {
      for (const { docId, source } of needsFetch) {
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ review: source, targetLang: lang }),
          });
          const json = (await res.json()) as
            | { review: AiReview }
            | { error: string };
          if ("error" in json) throw new Error(json.error);
          if (cancelled) return;
          setDocStates((prev) => {
            const cur = prev[docId];
            if (!cur) return prev;
            return {
              ...prev,
              [docId]: {
                ...cur,
                review: json.review,
                reviewByLang: {
                  ...(cur.reviewByLang ?? {}),
                  [lang]: json.review,
                },
                translating: false,
              },
            };
          });
        } catch (err) {
          console.error("[translate] error", err);
          if (cancelled) return;
          setDocStates((prev) => {
            const cur = prev[docId];
            if (!cur) return prev;
            return { ...prev, [docId]: { ...cur, translating: false } };
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const acceptedCount = useMemo(
    () =>
      Object.values(docStates).filter((s) => s.status === "accepted").length,
    [docStates],
  );

  async function handleExplain(docId: string) {
    setExplain({ open: true, docId, text: "", loading: true });
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, lang }),
      });
      const json = (await res.json()) as { text?: string; error?: string };
      if (json.error) throw new Error(json.error);
      setExplain({
        open: true,
        docId,
        text: json.text ?? "",
        loading: false,
      });
    } catch (err) {
      console.error(err);
      setExplain({
        open: true,
        docId,
        text:
          lang === "es"
            ? "No pudimos generar la explicación. Por favor intente de nuevo."
            : "We couldn't generate the explanation. Please try again.",
        loading: false,
      });
    }
  }

  async function runVerify(docId: string, files: UploadedFile[]) {
    const payload = files
      .filter((f) => f.dataUrl && f.mimeType)
      .map((f) => ({
        fileName: f.name,
        mimeType: f.mimeType as string,
        dataUrl: f.dataUrl as string,
      }));
    if (payload.length === 0) {
      setDocStates((prev) => ({
        ...prev,
        [docId]: { ...prev[docId], uploading: false },
      }));
      return;
    }

    const gens = verifyGenRef.current;
    const myGen = (gens.get(docId) ?? 0) + 1;
    gens.set(docId, myGen);

    const isLatest = () => gens.get(docId) === myGen;

    try {
      console.log("[verify] start", { docId, myGen, files: payload.length });
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, lang, files: payload }),
      });
      console.log("[verify] got response", { docId, myGen, status: res.status });
      const json = (await res.json()) as
        | { review: AiReview }
        | { error: string };
      console.log("[verify] parsed json", { docId, myGen, hasReview: "review" in json });
      if ("error" in json) throw new Error(json.error);
      const review = json.review;
      const nextStatus: DocCardState["status"] =
        review.matches &&
        review.issues.length === 0 &&
        review.confidence !== "low"
          ? "accepted"
          : "needs_action";
      if (!isLatest()) {
        console.log("[verify] stale, skipping state update", { docId, myGen });
        return;
      }
      setDocStates((prev) => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          status: nextStatus,
          review,
          reviewByLang: { ...(prev[docId].reviewByLang ?? {}), [lang]: review },
          uploading: false,
        },
      }));
    } catch (err) {
      console.error("[verify] error", err);
      if (!isLatest()) return;
      setDocStates((prev) => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          uploading: false,
          status: "needs_action",
          review: {
            matches: false,
            confidence: "low",
            issues: [
              lang === "es"
                ? "No pudimos analizar el archivo. Por favor intente de nuevo."
                : "We couldn't analyze the file. Please try again.",
            ],
            suggestions: [],
            summary: "",
          },
        },
      }));
    }
  }

  async function handleUpload(docId: string, incoming: File[]) {
    const doc = REQUIRED_DOCS.find((d) => d.id === docId);
    if (!doc || incoming.length === 0) return;
    const isMulti = Boolean(doc.multi);

    const newFiles = await Promise.all(incoming.map(asUploadedFile));

    const cur = docStatesRef.current[docId];
    const existingUserFiles = cur.files.filter((f) => f.dataUrl);
    const nextFiles: UploadedFile[] = isMulti
      ? [...existingUserFiles, ...newFiles]
      : [newFiles[0]];

    setDocStates((prev) => ({
      ...prev,
      [docId]: {
        status: "uploaded",
        files: nextFiles,
        review: undefined,
        uploading: true,
      },
    }));

    await runVerify(docId, nextFiles);
  }

  function handleReplace(docId: string) {
    setDocStates((prev) => ({
      ...prev,
      [docId]: {
        status: "pending",
        files: [],
        review: undefined,
        uploading: false,
      },
    }));
  }

  async function handleRemoveFile(docId: string, index: number) {
    const cur = docStatesRef.current[docId];
    const nextFiles: UploadedFile[] = cur.files.filter((_, i) => i !== index);
    setDocStates((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        files: nextFiles,
        status: nextFiles.length === 0 ? "pending" : "uploaded",
        review: nextFiles.length === 0 ? undefined : prev[docId].review,
        uploading: nextFiles.length > 0,
      },
    }));
    if (nextFiles.length > 0) {
      await runVerify(docId, nextFiles);
    }
  }

  const explainDoc = explain.docId
    ? REQUIRED_DOCS.find((d) => d.id === explain.docId)
    : null;

  return (
    <>
      <Header
        caseInfo={SAMPLE_CASE}
        lang={lang}
        onLangChange={setLang}
        onAboutClick={() => setAboutOpen(true)}
        acceptedCount={acceptedCount}
        totalCount={REQUIRED_DOCS.length}
      />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8 sm:px-8">
        <div className="mb-6">
          <p className="text-sm text-glade-ink/70 leading-relaxed">
            {t(STRINGS.tagline, lang)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {REQUIRED_DOCS.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              state={docStates[doc.id]}
              lang={lang}
              onExplain={() => handleExplain(doc.id)}
              onUpload={(files) => handleUpload(doc.id, files)}
              onReplace={() => handleReplace(doc.id)}
              onRemoveFile={(i) => handleRemoveFile(doc.id, i)}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-glade-muted">
          {t(STRINGS.footer.legalDisclaimer, lang)}
        </p>
      </main>

      <ExplainDialog
        open={explain.open}
        loading={explain.loading}
        text={explain.text}
        docTitle={explainDoc ? t(explainDoc.title, lang) : ""}
        lang={lang}
        onClose={() =>
          setExplain((s) => ({ ...s, open: false }))
        }
      />

      <AboutDialog open={aboutOpen} lang={lang} onClose={closeAbout} />

      <ChatPanel lang={lang} />
    </>
  );
}
