import type { EssayAuditReport, EssayType } from "@/lib/ai/prompt-contract";

interface ReviewInput {
  essayType: EssayType;
  prompt: string;
  draft: string;
}

interface ProviderResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const reportSchemaNote = `
Return JSON only with this exact shape:
{
  "overallScore": number,
  "dimensionScores": {
    "logic": number,
    "narrative": number,
    "specificity": number,
    "prompt_fit": number
  },
  "aiLikenessRisk": number,
  "summary": string,
  "paragraphFeedback": [
    {
      "paragraphIndex": number,
      "summary": string,
      "issueType": "vague" | "logic_gap" | "overwritten" | "weak_evidence" | "off_prompt",
      "recommendation": string
    }
  ],
  "rewriteSuggestions": [
    {
      "paragraphIndex": number,
      "versionA": string,
      "versionB": string,
      "voicePreservationNote": string
    }
  ]
}
Scores must be integers from 0 to 100.
Do not write a full replacement essay.
Paragraph indexes must be zero-based.
`;

const buildSystemPrompt = () => `
You are an admissions essay auditor for international applicants.
You evaluate draft essays for admissions competitiveness without ghostwriting.
Prioritize logic, narrative clarity, specificity, and prompt fit.
Flag AI-like phrasing when language sounds generic, inflated, or over-smoothed.
Preserve the student's original voice and intent.
${reportSchemaNote}
`;

const buildUserPrompt = ({ essayType, prompt, draft }: ReviewInput) => `
Essay type: ${essayType}

Application prompt:
${prompt}

Student draft:
${draft}
`;

const readApiConfig = () => {
  const baseUrl =
    process.env.API_BASE_URL ?? process.env.OPENAI_COMPAT_BASE_URL ?? "";
  const apiKey = process.env.API_KEY ?? process.env.OPENAI_COMPAT_API_KEY ?? "";
  const model = process.env.API_MODEL ?? process.env.AI_MODEL_NAME ?? "";

  return { baseUrl, apiKey, model };
};

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

const parseJsonReport = (raw: string): EssayAuditReport => {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as EssayAuditReport;
};

export const hasAiProviderConfig = () => {
  const { baseUrl, apiKey, model } = readApiConfig();
  return Boolean(baseUrl && apiKey && model);
};

export async function generateProviderAudit(
  input: ReviewInput
): Promise<EssayAuditReport> {
  const { baseUrl, apiKey, model } = readApiConfig();

  if (!baseUrl || !apiKey || !model) {
    throw new Error("AI provider is not configured.");
  }

  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: buildSystemPrompt()
        },
        {
          role: "user",
          content: buildUserPrompt(input)
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`AI provider request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as ProviderResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI provider returned an empty response.");
  }

  return parseJsonReport(content);
}
