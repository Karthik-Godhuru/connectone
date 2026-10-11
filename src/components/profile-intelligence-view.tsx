"use client";

import { useState } from "react";
import {
  Compass,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  ListChecks,
  Loader2,
  RefreshCw,
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { AiProfileAnalysis } from "@/types/intelligence";

interface ProfileIntelligenceViewProps {
  initialAnalysis?: AiProfileAnalysis | null;
  userName?: string;
}

export function ProfileIntelligenceView({
  initialAnalysis = null,
  userName = "Builder",
}: ProfileIntelligenceViewProps) {
  const [analysis, setAnalysis] = useState<AiProfileAnalysis | null>(initialAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/intelligence/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze profile with Gemini.");
      }

      setAnalysis(data.analysis);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during AI profile analysis."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel relative overflow-hidden rounded-3xl border border-[#DBD3C1]/10 bg-[#192024]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#4E1F1A]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#9E532D]/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <span className="editorial-kicker text-[#D5B38B]">
              Talent &amp; Skill Modeling
            </span>
            <h1 className="font-serif text-2xl font-medium tracking-tight text-[#DBD3C1] sm:text-3xl">
              Profile Intelligence
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-[#8FAAB5] leading-relaxed">
              Synthesizes your skills, projects, and goals into a structured intelligence model powering teammate matching and career milestone progression.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="glass-button-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#9E532D]/20 transition-all hover:shadow-[#9E532D]/30 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D5B38B]" />
                <span>Analyzing Profile...</span>
              </>
            ) : analysis ? (
              <>
                <RefreshCw className="h-4 w-4 text-[#D5B38B]" />
                <span>Re-Analyze Profile</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-[#D5B38B]" />
                <span>Analyze My Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Specifications row */}
        <div className="relative mt-6 flex flex-wrap items-center gap-2.5 border-t border-[#DBD3C1]/10 pt-4 text-xs">
          <span className="glass-pill px-3 py-1 text-[11px] font-medium text-[#DBD3C1]">Gemini 3.8 Flash</span>
          <span className="glass-pill px-3 py-1 text-[11px] font-medium text-[#DBD3C1]">8-Point Structured Model</span>
          <span className="glass-pill px-3 py-1 text-[11px] font-medium text-[#D5B38B]">Powers Compatibility Engine</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/25 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-rose-200">Profile Analysis Failed</h3>
              <p className="text-xs text-rose-200/90 leading-relaxed">{error}</p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/30"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-12 text-center backdrop-blur-xl">
          <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
            <span className="absolute h-10 w-10 animate-ping rounded-full bg-[#9E532D]/20" />
            <Loader2 className="h-6 w-6 animate-spin text-[#D5B38B]" />
          </div>
          <h3 className="mt-4 font-serif text-sm font-medium text-[#DBD3C1]">
            Processing Profile Intelligence
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#8FAAB5] leading-relaxed">
            Synthesizing career direction, verified skills, and growth milestones with Gemini...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !isLoading && !error && (
        <div className="glass-card rounded-2xl border border-dashed border-[#DBD3C1]/15 bg-[#192024]/40 p-12 text-center backdrop-blur-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#252E33]/60 border border-[#DBD3C1]/10 text-[#D5B38B]">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-sm font-medium text-[#DBD3C1]">
            Ready to Generate Profile Intelligence
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#8FAAB5] leading-relaxed">
            Click &ldquo;Analyze My Profile&rdquo; to evaluate your competencies, identify critical skill gaps, and generate strategic recommendations.
          </p>
          <button
            onClick={handleAnalyze}
            className="glass-button-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
          >
            <span>Analyze My Profile</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Structured Intelligence Cards */}
      {analysis && !isLoading && (
        <div className="space-y-6">
          {/* Profile Summary & Career Direction */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#252E33]/70 p-6 backdrop-blur-xl transition hover:border-[#D5B38B]/25">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#D5B38B]" />
                <span className="editorial-kicker text-[#D5B38B]">
                  AI Profile Summary
                </span>
              </div>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#DBD3C1]/90">
                {analysis.profile_summary}
              </p>
            </div>

            <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#252E33]/70 p-6 backdrop-blur-xl transition hover:border-[#D5B38B]/25">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#D5B38B]" />
                <span className="editorial-kicker text-[#D5B38B]">
                  Career Direction &amp; Focus
                </span>
              </div>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#DBD3C1]/90">
                {analysis.career_direction}
              </p>
            </div>
          </div>

          {/* Strengths & Current Skills */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#252E33]/70 p-6 backdrop-blur-xl transition hover:border-[#D5B38B]/25">
              <span className="editorial-kicker text-emerald-400">
                Key Strengths ({analysis.strengths.length})
              </span>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.strengths.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 shadow-sm backdrop-blur-md"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#252E33]/70 p-6 backdrop-blur-xl transition hover:border-[#D5B38B]/25">
              <span className="editorial-kicker text-[#8FAAB5]">
                Current Verified Skills ({analysis.current_skills.length})
              </span>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.current_skills.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-[#DBD3C1]/10 bg-[#192024]/50 px-3 py-1.5 text-xs font-medium text-[#DBD3C1] backdrop-blur-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Gaps & Recommended Skills */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#252E33]/70 p-6 backdrop-blur-xl transition hover:border-[#D5B38B]/25">
              <span className="editorial-kicker text-[#D5B38B]">
                Identified Skill Gaps ({analysis.skill_gaps.length})
              </span>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.skill_gaps.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-[#9E532D]/30 bg-[#9E532D]/15 px-3 py-1.5 text-xs font-medium text-[#E4C8A6] backdrop-blur-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#252E33]/70 p-6 backdrop-blur-xl transition hover:border-[#D5B38B]/25">
              <span className="editorial-kicker text-[#B86539]">
                Recommended Skills to Master ({analysis.recommended_skills.length})
              </span>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.recommended_skills.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-[#D5B38B]/30 bg-[#D5B38B]/15 px-3 py-1.5 text-xs font-medium text-[#DBD3C1] backdrop-blur-md"
                  >
                    + {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Collaboration Preferences */}
          <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#252E33]/70 p-6 backdrop-blur-xl transition hover:border-[#D5B38B]/25">
            <span className="editorial-kicker text-[#D5B38B]">
              Collaboration &amp; Teammate Preferences
            </span>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.collaboration_preferences.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-3.5 text-xs text-[#DBD3C1] backdrop-blur-md transition hover:border-[#D5B38B]/20"
                >
                  <span className="font-bold text-[#D5B38B] mr-1.5">#{idx + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Actions */}
          <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#252E33]/70 p-6 backdrop-blur-xl transition hover:border-[#D5B38B]/25">
            <span className="editorial-kicker text-[#D5B38B]">
              Recommended Next Actions
            </span>
            <div className="mt-4 space-y-2.5">
              {analysis.recommended_next_actions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-3.5 text-xs text-[#DBD3C1] backdrop-blur-md transition hover:border-[#D5B38B]/20"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#9E532D] to-[#D5B38B] text-[10px] font-bold text-white shadow-sm mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
