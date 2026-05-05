export type EssayType = "personal_statement" | "statement_of_purpose" | "uc_piq";

export type ReviewDimension =
  | "logic"
  | "narrative"
  | "specificity"
  | "prompt_fit";

export interface ParagraphFeedback {
  paragraphIndex: number;
  summary: string;
  issueType: "vague" | "logic_gap" | "overwritten" | "weak_evidence" | "off_prompt";
  recommendation: string;
}

export interface RewriteSuggestion {
  paragraphIndex: number;
  versionA: string;
  versionB: string;
  voicePreservationNote: string;
}

export interface EssayAuditReport {
  overallScore: number;
  dimensionScores: Record<ReviewDimension, number>;
  aiLikenessRisk: number;
  summary: string;
  paragraphFeedback: ParagraphFeedback[];
  rewriteSuggestions: RewriteSuggestion[];
}
