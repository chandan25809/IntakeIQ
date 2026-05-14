import type { Lang } from "./types";

export const STRINGS = {
  appName: { en: "IntakeIQ", es: "IntakeIQ" },
  tagline: {
    en: "Your case at a glance, and what we still need from you.",
    es: "Su caso de un vistazo, y lo que aún necesitamos de usted.",
  },
  caseLabel: { en: "Case", es: "Caso" },
  attorneyLabel: { en: "Your attorney", es: "Su abogado" },
  progress: {
    en: (a: number, b: number) => `${a} of ${b} documents accepted`,
    es: (a: number, b: number) => `${a} de ${b} documentos aceptados`,
  },
  status: {
    pending: { en: "Not started", es: "Pendiente" },
    uploaded: { en: "Reviewing", es: "En revisión" },
    accepted: { en: "Accepted", es: "Aceptado" },
    needs_action: { en: "Action needed", es: "Requiere atención" },
  },
  buttons: {
    explain: { en: "Explain this", es: "Explicar" },
    upload: { en: "Upload", es: "Subir" },
    replace: { en: "Replace file", es: "Reemplazar archivo" },
    askAnything: { en: "Ask anything", es: "Pregúntenos" },
    send: { en: "Send", es: "Enviar" },
    close: { en: "Close", es: "Cerrar" },
  },
  panels: {
    issuesFound: { en: "Issues to fix", es: "Asuntos a corregir" },
    suggestions: { en: "Suggested next steps", es: "Sugerencias" },
    confidence: { en: "AI confidence", es: "Confianza de la IA" },
    why: { en: "Why we need this", es: "Por qué lo necesitamos" },
    translating: { en: "Translating…", es: "Traduciendo…" },
    aiReview: { en: "AI review", es: "Revisión de la IA" },
  },
  confidence: {
    high: { en: "High", es: "Alta" },
    medium: { en: "Medium", es: "Media" },
    low: { en: "Low", es: "Baja" },
  },
  chat: {
    title: { en: "Ask anything about your case", es: "Pregunte sobre su caso" },
    placeholder: {
      en: "e.g. Where do I find the dec page?",
      es: "ej. ¿Dónde encuentro la página de declaraciones?",
    },
    welcome: {
      en: "Hi Maria, I'm here to help you upload the right documents. Ask me anything.",
      es: "Hola Maria, estoy aquí para ayudarle a subir los documentos correctos. Pregúnteme lo que sea.",
    },
    thinking: { en: "Thinking…", es: "Pensando…" },
    errorGeneric: {
      en: "Something went wrong. Please try again.",
      es: "Algo salió mal. Por favor intente de nuevo.",
    },
  },
  upload: {
    dragHere: {
      en: "Drop a file or click to choose",
      es: "Arrastre un archivo o haga clic para elegir",
    },
    dragHereMulti: {
      en: "Drop files or click to choose. You can add more later.",
      es: "Arrastre archivos o haga clic para elegir. Puede agregar más después.",
    },
    analyzing: {
      en: "AI is reviewing your upload…",
      es: "La IA está revisando su archivo…",
    },
    analyzingMulti: {
      en: "AI is reviewing all your files together…",
      es: "La IA está revisando todos sus archivos en conjunto…",
    },
    analyzingSteps: {
      en: [
        "Reading your files…",
        "Comparing against what's required…",
        "Looking for issues to fix…",
        "Drafting your review…",
      ],
      es: [
        "Leyendo sus archivos…",
        "Comparando con lo requerido…",
        "Buscando problemas a corregir…",
        "Redactando su revisión…",
      ],
    },
    tryAnother: { en: "Try another file", es: "Probar otro archivo" },
    addAnother: { en: "Add another file", es: "Agregar otro archivo" },
    remove: { en: "Remove", es: "Quitar" },
    fileCount: {
      en: (n: number) =>
        n === 1 ? "1 file uploaded" : `${n} files uploaded`,
      es: (n: number) =>
        n === 1 ? "1 archivo subido" : `${n} archivos subidos`,
    },
  },
  modal: {
    explainTitle: {
      en: "What is this document, and why do we need it?",
      es: "¿Qué es este documento y por qué lo necesitamos?",
    },
    loading: {
      en: "Generating a plain-language explanation…",
      es: "Generando una explicación en lenguaje sencillo…",
    },
  },
  about: {
    button: { en: "About this demo", es: "Acerca de la demo" },
    title: { en: "About this demo", es: "Acerca de esta demostración" },
    intro: {
      en: "IntakeIQ is a client-side intake companion that helps law-firm clients upload the right documents without the back-and-forth. This page is a live, single-screen prototype.",
      es: "IntakeIQ es un asistente de admisión para clientes de bufetes legales que les ayuda a subir los documentos correctos sin idas y venidas. Esta página es un prototipo funcional de una sola pantalla.",
    },
    fictional: {
      title: { en: "Fictional case", es: "Caso ficticio" },
      body: {
        en: "Maria Hernandez and her personal-injury case are made up. No real client data is stored or transmitted.",
        es: "Maria Hernandez y su caso de lesiones personales son ficticios. No se almacena ni se transmite ningún dato real de clientes.",
      },
    },
    seeded: {
      title: { en: "What is pre-filled", es: "Qué está pre-llenado" },
      body: {
        en: "Three of the six document cards are seeded with mock states (one accepted, one needs attention, one mid-review) to show different UI states on first load.",
        es: "Tres de las seis tarjetas de documentos están pre-llenadas con estados simulados (uno aceptado, uno requiere atención, uno en revisión) para mostrar diferentes estados de la interfaz al cargar.",
      },
    },
    live: {
      title: { en: "What is live AI", es: "Qué usa IA en vivo" },
      body: {
        en: "The remaining three cards (insurance dec page, accident photos, lost wages) trigger real OpenAI calls when you upload to them. The Explain button, the chat assistant, and the EN/ES translation also run live.",
        es: "Las tres tarjetas restantes (declaración del seguro, fotos del accidente, ingresos perdidos) activan llamadas reales a OpenAI cuando sube archivos. El botón Explicar, el chat y la traducción EN/ES también son en vivo.",
      },
    },
    samples: {
      title: { en: "Sample files to try", es: "Archivos de muestra" },
      body: {
        en: "Drag any of these into the matching upload card to see the AI review run:",
        es: "Arrastre cualquiera de estos a la tarjeta correspondiente para ver la revisión de la IA:",
      },
      items: {
        payStub: { en: "Pay stub", es: "Recibo de pago" },
        insuranceDec: { en: "Insurance declarations page", es: "Página de declaraciones del seguro" },
        accidentDamage: { en: "Accident damage photo", es: "Foto del daño del accidente" },
        decoyCat: { en: "Decoy: a cat photo (should be flagged)", es: "Señuelo: foto de un gato (debe ser marcada)" },
      },
    },
  },
  footer: {
    legalDisclaimer: {
      en: "This is a demo. AI explanations do not constitute legal advice. Talk to your attorney for legal questions.",
      es: "Esto es una demostración. Las explicaciones de la IA no constituyen consejo legal. Hable con su abogado para preguntas legales.",
    },
  },
} as const;

export function t<T>(entry: Record<Lang, T>, lang: Lang): T {
  return entry[lang];
}
