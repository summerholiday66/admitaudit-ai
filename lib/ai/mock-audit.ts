import type {
  EssayAuditReport,
  EssayType,
  ParagraphFeedback,
  RewriteSuggestion
} from "@/lib/ai/prompt-contract";

const dimensionOrder = ["logic", "narrative", "specificity", "prompt_fit"] as const;

const splitIntoParagraphs = (draft: string) =>
  draft
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const clampScore = (value: number) => Math.max(42, Math.min(94, Math.round(value)));

const countMatches = (text: string, pattern: RegExp) => text.match(pattern)?.length ?? 0;

const scoreParagraph = (paragraph: string) => {
  const words = paragraph.split(/\s+/).filter(Boolean);
  const length = words.length;
  const details = countMatches(paragraph, /\b(because|when|after|before|during|through|led|built|researched|designed)\b/gi);
  const firstPerson = countMatches(paragraph, /\b(i|my|me)\b/gi);
  const vagueTerms = countMatches(paragraph, /\b(very|really|things|stuff|good|bad|nice|important)\b/gi);

  return {
    length,
    details,
    firstPerson,
    vagueTerms,
    score:
      58 +
      Math.min(length, 140) * 0.12 +
      details * 2.4 +
      firstPerson * 0.8 -
      vagueTerms * 1.8
  };
};

const issueForParagraph = (paragraph: string, prompt: string): ParagraphFeedback["issueType"] => {
  const lower = paragraph.toLowerCase();
  const promptWords = prompt.toLowerCase().split(/\W+/).filter((word) => word.length > 4);
  const promptHits = promptWords.filter((word) => lower.includes(word)).length;

  if (paragraph.split(/\s+/).length < 45) {
    return "weak_evidence";
  }

  if (countMatches(paragraph, /\b(very|really|things|stuff)\b/gi) > 1) {
    return "vague";
  }

  if (promptWords.length > 0 && promptHits === 0) {
    return "off_prompt";
  }

  if (countMatches(paragraph, /\bhowever|but|although|yet\b/gi) > 1) {
    return "logic_gap";
  }

  return "overwritten";
};

const buildRecommendation = (
  issueType: ParagraphFeedback["issueType"],
  paragraph: string
) => {
  const opening = paragraph.split(/[.?!]/)[0]?.trim() ?? "This paragraph";

  switch (issueType) {
    case "weak_evidence":
      return `Keep "${opening}" but add one concrete scene, action, or measurable result so the claim feels earned.`;
    case "vague":
      return "Replace abstract praise and generic adjectives with one precise example, one decision, and one outcome.";
    case "off_prompt":
      return "Tie this paragraph back to the essay question more directly by naming the goal, program, or theme it supports.";
    case "logic_gap":
      return "Clarify the cause-and-effect chain so each shift in the story leads naturally to the next decision.";
    case "overwritten":
      return "Shorten the sentence rhythm and remove repeated framing so the core point lands faster.";
  }
};

const buildRewrite = (paragraph: string, issueType: ParagraphFeedback["issueType"]) => {
  const sentences = paragraph
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const first = sentences[0] ?? paragraph;
  const second = sentences[1] ?? "";

  const versionA = [first, second].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const versionB = (() => {
    switch (issueType) {
      case "weak_evidence":
        return `${first} I can strengthen this point by naming the action I took, the obstacle I faced, and the result that followed.`;
      case "vague":
        return `${first} Instead of broad claims, I should anchor this moment in one specific example that shows how I changed.`;
      case "off_prompt":
        return `${first} I should connect this experience more clearly to the program and to the reason it matters for this application.`;
      case "logic_gap":
        return `${first} The next sentence should explain why this moment changed my direction and what decision came from it.`;
      case "overwritten":
        return `${first} The revision should keep the same meaning but use fewer qualifiers and a more direct sentence structure.`;
    }
  })();

  return { versionA, versionB };
};

export interface GenerateAuditInput {
  essayType: EssayType;
  prompt: string;
  draft: string;
}

export const generateMockAudit = ({
  essayType,
  prompt,
  draft
}: GenerateAuditInput): EssayAuditReport => {
  const paragraphs = splitIntoParagraphs(draft);
  const fallbackParagraphs = paragraphs.length > 0 ? paragraphs : [draft.trim()];
  const stats = fallbackParagraphs.map((paragraph) => scoreParagraph(paragraph));
  const averageParagraphScore =
    stats.reduce((sum, item) => sum + item.score, 0) / stats.length;

  const logicScore = clampScore(averageParagraphScore + countMatches(draft, /\b(because|therefore|so|which led to)\b/gi) * 1.5);
  const narrativeScore = clampScore(averageParagraphScore + countMatches(draft, /\b(first|then|later|eventually|after)\b/gi) * 1.2);
  const specificityScore = clampScore(averageParagraphScore + countMatches(draft, /\b\d+\b/g) * 2 + countMatches(draft, /\b(lab|project|research|team|clinic|school|internship)\b/gi));
  const promptFitScore = clampScore(
    averageParagraphScore +
      Math.min(
        8,
        prompt
          .toLowerCase()
          .split(/\W+/)
          .filter((word) => word.length > 4 && draft.toLowerCase().includes(word)).length * 2
      ) +
      (essayType === "uc_piq" ? -2 : 0)
  );

  const paragraphFeedback: ParagraphFeedback[] = fallbackParagraphs.map((paragraph, index) => {
    const issueType = issueForParagraph(paragraph, prompt);

    return {
      paragraphIndex: index,
      summary: paragraph.slice(0, 140).trim(),
      issueType,
      recommendation: buildRecommendation(issueType, paragraph)
    };
  });

  const rewriteSuggestions: RewriteSuggestion[] = fallbackParagraphs.map((paragraph, index) => {
    const issueType = paragraphFeedback[index]?.issueType ?? "overwritten";
    const rewrite = buildRewrite(paragraph, issueType);

    return {
      paragraphIndex: index,
      versionA: rewrite.versionA,
      versionB: rewrite.versionB,
      voicePreservationNote:
        "Keep the original anecdote and point of view, but make the evidence chain more explicit and less generic."
    };
  });

  const overallScore = clampScore(
    (logicScore + narrativeScore + specificityScore + promptFitScore) / 4
  );
  const aiLikenessRisk = clampScore(
    38 +
      countMatches(draft, /\bmoreover|furthermore|delve|showcase|underscore|testament\b/gi) * 6 +
      Math.max(0, fallbackParagraphs.length - 4) * 3
  );

  return {
    overallScore,
    dimensionScores: {
      [dimensionOrder[0]]: logicScore,
      [dimensionOrder[1]]: narrativeScore,
      [dimensionOrder[2]]: specificityScore,
      [dimensionOrder[3]]: promptFitScore
    },
    aiLikenessRisk,
    summary:
      overallScore >= 78
        ? "The draft has a credible personal core and can become competitive with tighter evidence and cleaner transitions."
        : "The draft has useful raw material, but it still needs clearer evidence, sharper structure, and stronger alignment with the prompt.",
    paragraphFeedback,
    rewriteSuggestions
  };
};
