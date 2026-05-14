# IntakeIQ

> A client-side intake companion that helps law-firm clients upload the right documents without the back-and-forth.

**Live demo:** [_Live Demo_](https://intake-iq-three.vercel.app/)

## The problem

When a law firm onboards a new client, the firm sends a list of required documents (ID, insurance declarations page, medical records, pay stubs, photos of the scene, and so on). The client then has to figure out, on their own:

- What each requested document actually is
- Where to find it
- How to photograph it so it is readable
- Whether the one they just uploaded is the right one

The result is the most common time-sink in a paralegal's day: chasing the client to re-upload an expired ID, a blurry pay stub, a single-sided license, or the entire 40-page policy instead of just the declarations page. Each round trip costs a day or two of calendar time.

## The product

IntakeIQ is a single-screen client portal that turns the client into a self-sufficient uploader. For every required document, the client sees:

1. A plain-language, one-line description of what is being asked for.
2. An **Explain this** button that opens an LLM-generated 3-section explanation written at a 6th-grade reading level: what it is, why we need it, how to find or photograph it. Translated on demand into Spanish.
3. A drag-and-drop **upload zone**. The moment a file lands, GPT-4o-mini Vision reviews it and returns a structured review: whether it matches the requested type, a confidence rating, a list of specific issues, a list of practical suggestions, and a one-sentence factual summary.
4. A live status pill that flips between *Pending → Reviewing → Accepted / Action needed* based on the AI's review.

A floating chat bubble at the bottom-right gives the client a place to ask follow-up questions ("Is my passport okay instead of my license?", "Where do I get the declarations page?"). The system prompt is anchored to the case context and is explicit about not giving legal advice; refusals are warm and redirect to the attorney.

The demo is seeded with a fictional personal-injury case (Maria Hernandez, rear-ended in California). Three of the six required documents are pre-populated with mock states (one accepted, one rejected with detailed issues, one mid-review) so the UI has visual depth on first load. The remaining three docs trigger live LLM calls when the user uploads to them.

A language toggle in the header switches every label, every AI explanation, and every chat reply between English and Spanish.

## How the AI is used

Three OpenAI endpoints power the experience, each a distinct use of an LLM:

1. **`POST /api/explain`**: natural-language generation in the target language, with a structured 3-section format. Used by the "Explain this" button.
2. **`POST /api/verify`**: multimodal vision + JSON-mode structured extraction. Given the uploaded image, the model checks whether it matches the expected document type and returns a typed object with `matches`, `confidence`, `issues`, `suggestions`, and `summary`.
3. **`POST /api/chat`**: guarded conversational assistant. The system prompt is anchored to the case context and explicitly forbids legal advice.

All three routes live under `src/app/api/*/route.ts` and share a single OpenAI client in `src/lib/openai.ts`. The default model is `gpt-4o-mini` and can be overridden via the `OPENAI_MODEL` environment variable.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** (CSS-first config in `globals.css`)
- **OpenAI Node SDK** (`openai`) with `gpt-4o-mini` for both text and vision
- Deployed on **Vercel**

No database. No auth. No persistence. One screen, three endpoints, four distinct AI interactions.

## Run locally

```bash
cp .env.example .env.local
# add your OPENAI_API_KEY to .env.local
npm install
npm run dev
# open http://localhost:3000
```

Build:

```bash
npm run build && npm start
```

## What is intentionally not in here

- Real PDF parsing. PDFs are reviewed by filename only; vision works on image uploads.
- Persistence. The demo is stateful only within the browser session.
- Auth, multi-case, attorney views, billing, e-sign. The demo is scoped to a single client experience.
- Streaming chat responses. Kept simple to fit the timebox; obvious next step.

## Repo layout

```
src/
├── app/
│   ├── page.tsx              # single-screen client portal
│   ├── layout.tsx
│   ├── globals.css           # Tailwind v4 theme tokens
│   └── api/
│       ├── explain/route.ts  # plain-language explainer
│       ├── verify/route.ts   # vision + JSON review
│       └── chat/route.ts     # guarded chat assistant
├── components/
│   ├── Header.tsx
│   ├── DocumentCard.tsx
│   ├── ExplainDialog.tsx
│   ├── UploadZone.tsx
│   ├── AiReviewPanel.tsx
│   ├── ChatPanel.tsx
│   ├── StatusPill.tsx
│   ├── ConfidencePill.tsx
│   └── Icons.tsx
├── data/
│   └── sampleCase.ts         # the fictional PI case + 6 required docs
└── lib/
    ├── openai.ts             # singleton client + MODEL constant
    ├── i18n.ts               # all UI strings, EN + ES
    └── types.ts
```
