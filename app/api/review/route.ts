import { NextResponse } from "next/server";
import { generateMockAudit } from "@/lib/ai/mock-audit";
import {
  generateProviderAudit,
  hasAiProviderConfig
} from "@/lib/ai/openai-compatible";
import type { EssayType } from "@/lib/ai/prompt-contract";

export const runtime = "edge";

interface ReviewRequestBody {
  essayType?: EssayType;
  prompt?: string;
  draft?: string;
}

const allowedEssayTypes: EssayType[] = [
  "personal_statement",
  "statement_of_purpose",
  "uc_piq"
];

export async function POST(request: Request) {
  let body: ReviewRequestBody;

  try {
    body = (await request.json()) as ReviewRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const essayType = body.essayType;
  const prompt = body.prompt?.trim() ?? "";
  const draft = body.draft?.trim() ?? "";

  if (!essayType || !allowedEssayTypes.includes(essayType)) {
    return NextResponse.json(
      { error: "A valid essay type is required." },
      { status: 400 }
    );
  }

  if (prompt.length < 12) {
    return NextResponse.json(
      { error: "Prompt must be at least 12 characters." },
      { status: 400 }
    );
  }

  if (draft.length < 200) {
    return NextResponse.json(
      { error: "Draft must be at least 200 characters." },
      { status: 400 }
    );
  }

  let report;

  try {
    report = hasAiProviderConfig()
      ? await generateProviderAudit({ essayType, prompt, draft })
      : generateMockAudit({ essayType, prompt, draft });
  } catch {
    report = generateMockAudit({ essayType, prompt, draft });
  }

  return NextResponse.json({
    report,
    unlocked: false,
    generatedAt: new Date().toISOString(),
    provider: hasAiProviderConfig() ? "ai" : "mock"
  });
}
