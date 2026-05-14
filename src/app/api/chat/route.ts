import { NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import { REQUIRED_DOCS, SAMPLE_CASE } from "@/data/sampleCase";
import type { ChatMessage, Lang } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  messages: ChatMessage[];
  lang: Lang;
};

const LANG_NAME: Record<Lang, string> = {
  en: "English",
  es: "Spanish (es-MX, warm and respectful)",
};

function buildSystemPrompt(lang: Lang) {
  const docsList = REQUIRED_DOCS.map(
    (d, i) => `${i + 1}. ${d.title.en}: ${d.prompt.expectedContent}`,
  ).join("\n");

  return `You are a warm, plain-language intake assistant for the law firm ${SAMPLE_CASE.attorney.firm}.
You are speaking with ${SAMPLE_CASE.client.firstName} ${SAMPLE_CASE.client.lastName}, a client in a personal injury case (auto accident, ${SAMPLE_CASE.incident.state}, ${SAMPLE_CASE.incident.dateIso}).
Their attorney is ${SAMPLE_CASE.attorney.name}.

Your job is ONLY to help them upload the right documents in the client portal. You can:
- Explain what each requested document is and how to find it
- Tell them how to take a clear photo or scan
- Reassure them about timelines and what happens next
- Clarify what is NOT needed yet

You MUST NOT:
- Give legal advice or predict case outcomes
- Estimate settlement amounts or odds
- Comment on fault, liability, or insurance disputes

If asked anything legal, say warmly that the attorney (${SAMPLE_CASE.attorney.name}) is the right person to answer that, and offer to help with documents instead.

Required documents for this case:
${docsList}

Style: Reply in ${LANG_NAME[lang]}. Keep replies under 4 short sentences unless the user explicitly asks for detail. No emojis. No headings unless needed.`;
}

export async function POST(req: Request) {
  try {
    const { messages, lang } = (await req.json()) as Body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages must be a non-empty array" },
        { status: 400 },
      );
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 250,
      messages: [
        { role: "system", content: buildSystemPrompt(lang) },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("/api/chat error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
