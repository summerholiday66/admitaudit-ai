"use client";

import { useState, useTransition } from "react";
import type { EssayAuditReport, EssayType } from "@/lib/ai/prompt-contract";

const essayTypeOptions: Array<{ value: EssayType; label: string }> = [
  { value: "statement_of_purpose", label: "Statement of Purpose" },
  { value: "personal_statement", label: "Personal Statement" },
  { value: "uc_piq", label: "UC PIQ" }
];

const dimensionLabels: Record<keyof EssayAuditReport["dimensionScores"], string> = {
  logic: "Logic",
  narrative: "Narrative",
  specificity: "Specificity",
  prompt_fit: "Prompt Fit"
};

const demoPrompt =
  "Describe a meaningful academic or personal experience and explain how it shaped your goals for graduate study.";

const demoDraft = `During my third year of university, I joined a public health field project mostly because I wanted a line on my resume. I expected routine data entry, but within two weeks I was interviewing migrant workers who had postponed medical visits because they could not navigate the registration system. One woman unfolded a paper folder filled with forms she did not understand, and I realized that my interest in health policy had stayed too abstract.

After that visit, I redesigned our intake spreadsheet with a bilingual volunteer and built a shorter script for first-contact interviews. The change was small, but it reduced repeat visits and gave our supervisor cleaner records for follow-up. More importantly, it showed me that research and operations are not separate worlds. A good system can fail if the people using it are invisible in the design process.

That lesson changed how I approached my coursework. Instead of writing only about health inequity in broad terms, I started asking where administrative friction appears and who carries its cost. I pursued a capstone on clinic workflow, learned basic survey design, and became more careful about translating lived experience into evidence without flattening it. Graduate study now feels less like a credential goal and more like the training I need to design health systems that are both rigorous and usable.`;

interface ReviewResponse {
  report: EssayAuditReport;
  unlocked: boolean;
  generatedAt: string;
  provider?: "ai" | "mock";
  error?: string;
}

export function EssayAuditShell() {
  const [essayType, setEssayType] = useState<EssayType>("statement_of_purpose");
  const [prompt, setPrompt] = useState(demoPrompt);
  const [draft, setDraft] = useState(demoDraft);
  const [report, setReport] = useState<EssayAuditReport | null>(null);
  const [error, setError] = useState<string>("");
  const [unlocked, setUnlocked] = useState(false);
  const [provider, setProvider] = useState<"ai" | "mock" | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitReview = () => {
    startTransition(async () => {
      setError("");

      try {
        const response = await fetch("/api/review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ essayType, prompt, draft })
        });

        const payload = (await response.json()) as ReviewResponse;

        if (!response.ok) {
          setReport(null);
          setUnlocked(false);
          setError(payload.error ?? "Review request failed.");
          return;
        }

        setReport(payload.report);
        setUnlocked(payload.unlocked);
        setProvider(payload.provider ?? null);
      } catch {
        setError("Network error while generating the report.");
      }
    });
  };

  const visibleFeedback = unlocked
    ? report?.paragraphFeedback ?? []
    : (report?.paragraphFeedback ?? []).slice(0, 2);

  const visibleRewrites = unlocked
    ? report?.rewriteSuggestions ?? []
    : [];

  return (
    <main className="min-h-screen bg-mist text-ink">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-line bg-white p-7 shadow-paper sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              AdmitAudit.ai
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Run a structured admissions essay audit before wiring up auth and payments.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              This MVP already simulates the real product flow: submit a prompt and draft,
              get a structured score report, preview limited diagnostics, then unlock the
              full report locally.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Essay type</span>
                <select
                  value={essayType}
                  onChange={(event) => setEssayType(event.target.value as EssayType)}
                  className="mt-2 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent"
                >
                  {essayTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl border border-dashed border-line bg-slate-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-700">Review scope</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Scores logic, narrative, specificity, and prompt fit. Flags AI-like
                  phrasing and returns rewrite suggestions without ghostwriting the full essay.
                </p>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">Prompt</span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">Draft</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={16}
                className="mt-2 w-full rounded-[28px] border border-line bg-slate-50 px-4 py-4 text-sm leading-6 outline-none transition focus:border-accent"
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={submitReview}
                disabled={isPending}
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Generating report..." : "Review this draft"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrompt(demoPrompt);
                  setDraft(demoDraft);
                  setReport(null);
                  setUnlocked(false);
                  setError("");
                }}
                className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reset demo input
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-line bg-white p-7 shadow-paper sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Report status
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {report ? "Structured review ready" : "Waiting for your draft"}
                  </h2>
                  {report && provider ? (
                    <p className="mt-2 text-sm text-slate-500">
                      {provider === "ai"
                        ? "Generated from the connected AI provider."
                        : "Generated from the local fallback reviewer."}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                  {unlocked ? "Unlocked" : "Preview mode"}
                </span>
              </div>

              {report ? (
                <>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-ink px-5 py-5 text-white">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                        Overall score
                      </p>
                      <p className="mt-3 text-4xl font-semibold">{report.overallScore}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-slate-50 px-5 py-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        AI-likeness risk
                      </p>
                      <p className="mt-3 text-4xl font-semibold text-slate-900">
                        {report.aiLikenessRisk}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {Object.entries(report.dimensionScores).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-2xl border border-line bg-white px-4 py-4"
                      >
                        <p className="text-sm text-slate-500">
                          {dimensionLabels[key as keyof EssayAuditReport["dimensionScores"]]}
                        </p>
                        <p className="mt-1 text-2xl font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-line bg-slate-50 px-5 py-5">
                    <p className="text-sm font-medium text-slate-800">Summary</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{report.summary}</p>
                  </div>
                </>
              ) : (
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  Submit a draft on the left to generate a local report. This is the same
                  shape the real AI endpoint can return later.
                </p>
              )}
            </div>

            <div className="rounded-[32px] border border-line bg-white p-7 shadow-paper sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Paragraph diagnostics
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Actionable feedback</h2>
                </div>
                {report && !unlocked ? (
                  <button
                    type="button"
                    onClick={() => setUnlocked(true)}
                    className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Unlock full report
                  </button>
                ) : null}
              </div>

              {visibleFeedback.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {visibleFeedback.map((item) => (
                    <article
                      key={item.paragraphIndex}
                      className="rounded-2xl border border-line bg-slate-50 px-5 py-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-slate-800">
                          Paragraph {item.paragraphIndex + 1}
                        </p>
                        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-600">
                          {item.issueType.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-800">
                        {item.recommendation}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  Paragraph-level diagnostics will appear here after review.
                </p>
              )}

              {report && !unlocked ? (
                <div className="mt-5 rounded-2xl border border-dashed border-line bg-white px-5 py-4 text-sm leading-7 text-slate-600">
                  Preview mode shows only the first two paragraph diagnostics. Unlocking reveals
                  the remaining feedback and rewrite suggestions.
                </div>
              ) : null}
            </div>

            {unlocked && visibleRewrites.length > 0 ? (
              <div className="rounded-[32px] border border-line bg-white p-7 shadow-paper sm:p-8">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Rewrite suggestions
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Voice-preserving revisions</h2>

                <div className="mt-6 space-y-4">
                  {visibleRewrites.map((item) => (
                    <article
                      key={item.paragraphIndex}
                      className="rounded-2xl border border-line bg-slate-50 px-5 py-5"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        Paragraph {item.paragraphIndex + 1}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        <span className="font-medium text-slate-900">Version A:</span>{" "}
                        {item.versionA}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        <span className="font-medium text-slate-900">Version B:</span>{" "}
                        {item.versionB}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {item.voicePreservationNote}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
