export type Lang = "en" | "es";

export type DocStatus = "pending" | "uploaded" | "accepted" | "needs_action";

export type Confidence = "high" | "medium" | "low";

export type AiReview = {
  matches: boolean;
  confidence: Confidence;
  issues: string[];
  suggestions: string[];
  summary?: string;
};

export type UploadedFile = {
  name: string;
  sizeKb: number;
  mimeType?: string;
  dataUrl?: string;
};

export type RequiredDoc = {
  id: string;
  icon: string;
  title: { en: string; es: string };
  oneLiner: { en: string; es: string };
  multi?: boolean;
  prompt: {
    plainName: string;
    expectedContent: string;
    commonPitfalls: string[];
  };
  initialState: {
    status: DocStatus;
    files?: UploadedFile[];
    review?: AiReview;
    reviewByLang?: { en?: AiReview; es?: AiReview };
  };
};

export type CaseSummary = {
  id: string;
  type: string;
  client: {
    firstName: string;
    lastName: string;
    pronoun: string;
  };
  incident: {
    summary: string;
    dateIso: string;
    state: string;
  };
  attorney: {
    name: string;
    firm: string;
  };
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
