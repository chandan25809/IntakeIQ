import { NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { REQUIRED_DOCS, SAMPLE_CASE } from "@/data/sampleCase";
import type { Lang } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  docId: string;
  lang: Lang;
};

const LANG_NAME: Record<Lang, string> = {
  en: "English",
  es: "Spanish (es-MX, warm and respectful)",
};

export async function POST(req: Request) {
  try {
    const { docId, lang } = (await req.json()) as Body;
    const doc = REQUIRED_DOCS.find((d) => d.id === docId);
    if (!doc) {
      return NextResponse.json({ error: "Unknown docId" }, { status: 400 });
    }

    const system = `You are a warm, friendly intake assistant for a US law firm.
You speak to clients in plain language at a 6th-grade reading level.
You never give legal advice; defer to the attorney for legal questions.
You always reply in ${LANG_NAME[lang]}.
Format: 3 short sections separated by blank lines, each with a bold one-line heading using markdown (**Heading**).
Sections (use these exact headings, translated): "What is this?", "Why we need it", "How to find or take a good photo".
End with one practical tip prefixed with "Tip:" (translate "Tip" appropriately).
No legal disclaimers in the body. No sign-off. No emojis.`;

    const user = `Document we need: ${doc.prompt.plainName}.
Expected content: ${doc.prompt.expectedContent}
Common mistakes clients make: ${doc.prompt.commonPitfalls.join("; ")}

Case context (do not quote back, just use for tone): A personal injury client, ${SAMPLE_CASE.client.firstName} ${SAMPLE_CASE.client.lastName}, who was rear-ended in ${SAMPLE_CASE.incident.state} on ${SAMPLE_CASE.incident.dateIso}.`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 350,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("/api/explain error", err);
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
