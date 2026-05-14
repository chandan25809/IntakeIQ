import type { CaseSummary, RequiredDoc } from "@/lib/types";

export const SAMPLE_CASE: CaseSummary = {
  id: "PI-2026-0421",
  type: "Personal Injury · Auto Accident",
  client: {
    firstName: "Maria",
    lastName: "Hernandez",
    pronoun: "she",
  },
  incident: {
    summary:
      "Rear-ended at a red light on El Camino Real by a driver who admitted fault at the scene. Soft-tissue neck injury, ER visit, three weeks of missed work.",
    dateIso: "2026-03-14",
    state: "California",
  },
  attorney: {
    name: "Priya Shah",
    firm: "Shah & Associates",
  },
};

export const REQUIRED_DOCS: RequiredDoc[] = [
  {
    id: "police_report",
    icon: "shield",
    title: {
      en: "Police accident report",
      es: "Reporte policial del accidente",
    },
    oneLiner: {
      en: "The official report from the responding officer.",
      es: "El reporte oficial del oficial que respondió al accidente.",
    },
    prompt: {
      plainName: "Police accident report",
      expectedContent:
        "An official traffic collision report from a local police department or CHP. Should include report number, date of incident, parties involved, and officer's narrative.",
      commonPitfalls: [
        "Uploading only the exchange-of-information card instead of the full report",
        "Missing the second page with the officer's narrative",
        "Photo too dark to read the report number",
      ],
    },
    initialState: {
      status: "accepted",
      files: [
        { name: "CHP_traffic_collision_03-14-2026.pdf", sizeKb: 412 },
      ],
      reviewByLang: {
        en: {
          matches: true,
          confidence: "high",
          issues: [],
          suggestions: [],
          summary:
            "Full CHP collision report. Report #2026-03-14-0917. Other driver cited for failure to stop.",
        },
        es: {
          matches: true,
          confidence: "high",
          issues: [],
          suggestions: [],
          summary:
            "Reporte completo de colisión de CHP. Reporte #2026-03-14-0917. Al otro conductor se le citó por no detenerse.",
        },
      },
    },
  },
  {
    id: "id_card",
    icon: "id",
    title: {
      en: "Government-issued photo ID",
      es: "Identificación oficial con foto",
    },
    oneLiner: {
      en: "Driver's license (front and back), state ID, or passport.",
      es: "Licencia de conducir (frente y reverso), identificación estatal o pasaporte.",
    },
    multi: true,
    prompt: {
      plainName: "Government-issued photo ID",
      expectedContent:
        "A clear photo of a current, non-expired ID. For a driver's license or state ID, BOTH the front AND the back are required. A single passport page is acceptable on its own. Judge the SET together.",
      commonPitfalls: [
        "ID is expired",
        "Photo is glare-covered or cropped",
        "Only one side of a two-sided ID uploaded",
      ],
    },
    initialState: {
      status: "needs_action",
      files: [{ name: "drivers_license_front.jpg", sizeKb: 318 }],
      reviewByLang: {
        en: {
          matches: true,
          confidence: "high",
          issues: [
            "ID expired on 02/12/2026; we need a current, valid ID",
            "Back of the license is missing",
          ],
          suggestions: [
            "Upload your renewed license, or a current passport if you have one",
            "Include both the front and back of the card",
          ],
        },
        es: {
          matches: true,
          confidence: "high",
          issues: [
            "La identificación venció el 12/02/2026; necesitamos una identificación vigente y válida",
            "Falta la parte de atrás de la licencia",
          ],
          suggestions: [
            "Suba su licencia renovada, o un pasaporte vigente si tiene uno",
            "Incluya tanto el frente como la parte de atrás de la tarjeta",
          ],
        },
      },
    },
  },
  {
    id: "medical_records",
    icon: "stethoscope",
    title: {
      en: "Medical records & bills",
      es: "Registros médicos y facturas",
    },
    oneLiner: {
      en: "ER visit notes, follow-up appointments, and bills. Add as many as you have.",
      es: "Notas de urgencias, citas de seguimiento y facturas. Agregue todo lo que tenga.",
    },
    multi: true,
    prompt: {
      plainName: "Medical records and bills",
      expectedContent:
        "Discharge papers from the ER, follow-up visit notes, imaging reports, and itemized bills from each provider. Multiple files welcome; they are usually evaluated together.",
      commonPitfalls: [
        "Only summary bill uploaded, not the itemized version",
        "Provider name or date cut off in the photo",
        "Imaging report missing while bills are present",
      ],
    },
    initialState: {
      status: "uploaded",
      files: [{ name: "ER_discharge_3-14.jpg", sizeKb: 1840 }],
      reviewByLang: {
        en: {
          matches: true,
          confidence: "medium",
          issues: [
            "Photo is slightly blurry around the diagnosis section",
            "Itemized bill not yet provided; only the summary balance",
          ],
          suggestions: [
            "Retake the photo with brighter lighting and steady hands",
            "Ask the billing department for the itemized statement (CPT codes)",
          ],
        },
        es: {
          matches: true,
          confidence: "medium",
          issues: [
            "La foto está un poco borrosa en la sección del diagnóstico",
            "Aún no se ha proporcionado la factura desglosada; solo el saldo total",
          ],
          suggestions: [
            "Tome la foto de nuevo con mejor iluminación y pulso firme",
            "Pida al departamento de facturación el estado de cuenta desglosado (códigos CPT)",
          ],
        },
      },
    },
  },
  {
    id: "insurance_declarations",
    icon: "umbrella",
    title: {
      en: "Auto insurance declarations page",
      es: "Página de declaraciones del seguro de auto",
    },
    oneLiner: {
      en: "Shows your policy limits and coverage details.",
      es: "Muestra los límites y detalles de su póliza.",
    },
    prompt: {
      plainName: "Auto insurance declarations page",
      expectedContent:
        "The 'declarations' or 'dec page' from the client's auto insurance policy showing coverage limits, deductibles, and named insureds. Usually the first 1-2 pages of a policy packet.",
      commonPitfalls: [
        "Uploading the entire 40-page policy instead of just the dec page",
        "Uploading an expired policy",
        "Dec page cut off mid-coverage-table",
      ],
    },
    initialState: { status: "pending", files: [] },
  },
  {
    id: "accident_photos",
    icon: "camera",
    title: {
      en: "Accident scene & vehicle damage photos",
      es: "Fotos del accidente y daños al vehículo",
    },
    oneLiner: {
      en: "Photos of both cars, the scene, and any visible injuries. Add as many angles as you have.",
      es: "Fotos de ambos autos, la escena y lesiones visibles. Agregue todos los ángulos que tenga.",
    },
    multi: true,
    prompt: {
      plainName: "Accident scene and vehicle damage photos",
      expectedContent:
        "A SET of photos taken together: damage to the client's vehicle (multiple angles), damage to the other vehicle, the scene from a few angles, road and traffic conditions, and any visible injuries. Judge the SET collectively; one photo of one angle is not enough on its own.",
      commonPitfalls: [
        "Only one angle of the damage",
        "Photos taken from too far away to see the damage",
        "No wide-angle scene photo for context",
        "No photos of the other vehicle",
      ],
    },
    initialState: { status: "pending", files: [] },
  },
  {
    id: "lost_wages",
    icon: "wallet",
    title: {
      en: "Proof of lost wages",
      es: "Comprobante de ingresos perdidos",
    },
    oneLiner: {
      en: "Recent pay stubs and/or a letter from your employer. Add as many as you have.",
      es: "Recibos de pago recientes y/o una carta de su empleador. Agregue todos los que tenga.",
    },
    multi: true,
    prompt: {
      plainName: "Proof of lost wages",
      expectedContent:
        "Recent pay stubs (ideally the last 3 months) showing typical earnings, plus a letter from the employer confirming missed days and lost pay due to the injury. Multiple files welcome; judge the set together. Even one recent pay stub is useful to start, but flag what's still needed.",
      commonPitfalls: [
        "Pay stub older than 3 months",
        "Employer letter on plain paper without letterhead or signature",
        "Hours and gross pay cut off the photo",
      ],
    },
    initialState: { status: "pending", files: [] },
  },
];
