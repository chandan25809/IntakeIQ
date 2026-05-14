import { NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { REQUIRED_DOCS } from "@/data/sampleCase";
import type { AiReview, Lang } from "@/lib/types";

export const runtime = "nodejs";

type IncomingFile = {
  fileName: string;
  mimeType: string;
  dataUrl: string;
};

type Body = {
  docId: string;
  lang: Lang;
  files: IncomingFile[];
};

const LANG_NAME: Record<Lang, string> = {
  en: "English",
  es: "Spanish (es-MX, warm and respectful)",
};

function fallbackReview(reason: string): AiReview {
  return {
    matches: false,
    confidence: "low",
    issues: [reason],
    suggestions: [
      "Please try uploading a clearer image of the requested document.",
    ],
    summary: "",
  };
}

export async function POST(req: Request) {
  try {
    const { docId, lang, files } = (await req.json()) as Body;
    const doc = REQUIRED_DOCS.find((d) => d.id === docId);
    if (!doc) {
      return NextResponse.json({ error: "Unknown docId" }, { status: 400 });
    }
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "files must be a non-empty array" },
        { status: 400 },
      );
    }

    const openai = getOpenAI();
    const isMulti = Boolean(doc.multi);
    const imageFiles = files.filter((f) => f.mimeType.startsWith("image/"));
    const pdfFiles = files.filter((f) => f.mimeType === "application/pdf");
    const unsupported = files.filter(
      (f) =>
        !f.mimeType.startsWith("image/") && f.mimeType !== "application/pdf",
    );

    if (unsupported.length > 0 && imageFiles.length === 0 && pdfFiles.length === 0) {
      return NextResponse.json({
        review: fallbackReview(
          "Unsupported file type. Please upload images or PDFs.",
        ),
      });
    }

    const system = `You are an AI reviewer for a US law firm's client intake portal.
You are checking whether the client's uploaded ${isMulti ? "SET of files (judged together)" : "file"} matches what was requested.
Be strict but kind. Return JSON only. Reply in ${LANG_NAME[lang]} for the human-readable fields.

Rules:
- "matches" = true only if the ${isMulti ? "collection clearly represents the requested type" : "document clearly is the requested type"}.
- "confidence" reflects how sure you are.
- "issues" lists specific, fixable problems (max 3, each one short sentence). Empty array if none.
- "suggestions" lists practical next steps (max 3, each one short sentence). Empty array if none.
- "summary" is a 1-sentence factual description of what you actually see across all files, neutral tone.
${
  isMulti
    ? `- Judge the FULL set together. If a single file would be incomplete but the set is reasonably complete, accept it. If the set is missing common items the user would normally include, flag them as issues so they can ADD MORE files.
- Do not penalize for "only one angle" if the set already contains multiple angles.`
    : `- Judge only this single file.`
}
- PDFs cannot be viewed directly; if a PDF is present, judge it by filename only and lower confidence accordingly.
- Never include any text outside the JSON.`;

    const fileListText = files
      .map(
        (f, i) =>
          `  ${i + 1}. ${f.fileName} (${f.mimeType.startsWith("image/") ? "image" : "pdf"})`,
      )
      .join("\n");

    const requestText = `Expected document: ${doc.prompt.plainName}.
What it should contain: ${doc.prompt.expectedContent}
Common mistakes to watch for: ${doc.prompt.commonPitfalls.join("; ")}

Uploaded ${files.length} file${files.length === 1 ? "" : "s"}:
${fileListText}

Return ONLY this JSON shape:
{"matches": boolean, "confidence": "high"|"medium"|"low", "issues": string[], "suggestions": string[], "summary": string}`;

    const userContent: Array<
      | { type: "text"; text: string }
      | {
          type: "image_url";
          image_url: { url: string; detail?: "low" | "high" | "auto" };
        }
    > = [{ type: "text", text: requestText }];

    for (const img of imageFiles) {
      userContent.push({
        type: "image_url",
        image_url: { url: img.dataUrl, detail: "low" },
      });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    let parsed: AiReview;
    try {
      const obj = JSON.parse(raw) as Partial<AiReview>;
      parsed = {
        matches: Boolean(obj.matches),
        confidence:
          obj.confidence === "high" || obj.confidence === "medium" || obj.confidence === "low"
            ? obj.confidence
            : "low",
        issues: Array.isArray(obj.issues) ? obj.issues.slice(0, 3) : [],
        suggestions: Array.isArray(obj.suggestions)
          ? obj.suggestions.slice(0, 3)
          : [],
        summary: typeof obj.summary === "string" ? obj.summary : "",
      };
    } catch {
      parsed = fallbackReview(
        lang === "es"
          ? "No pudimos leer la respuesta de la IA."
          : "We could not parse the AI response.",
      );
    }

    return NextResponse.json({ review: parsed });
  } catch (err) {
    console.error("/api/verify error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
