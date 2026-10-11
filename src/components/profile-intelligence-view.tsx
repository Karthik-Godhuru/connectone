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
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Talent & Skill Modeling
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Profile Intelligence
            </h1>
            <p className="max-w-2xl text-xs text-slate-400">
              Synthesizes your skills, projects, and goals into a structured intelligence model powering teammate matching and career milestone progression.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Analyzing Profile...</span>
              </>
            ) : analysis ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Re-Analyze Profile</span>
              </>
            ) : (
              <span>Analyze My Profile</span>
            )}
          </button>
        </div>

        {/* Specifications row */}
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
          <span>Gemini 3.8 Flash</span>
          <span className="text-slate-600">·</span>
          <span>8-Point Structured Model</span>
          <span className="text-slate-600">·</span>
          <span>Powers Teammate Compatibility</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-rose-300">Profile Analysis Failed</h3>
              <p className="text-xs text-rose-200/90 leading-relaxed">{error}</p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
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
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-white">
            Processing Profile Intelligence
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
            Synthesizing career direction, verified skills, and growth milestones...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !isLoading && !error && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <Layers className="mx-auto h-8 w-8 text-slate-500" />
          <h3 className="mt-3 text-sm font-bold text-white">
            Ready to Generate Profile Intelligence
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
            Click &ldquo;Analyze My Profile&rdquo; to evaluate your competencies, identify critical skill gaps, and generate strategic recommendations.
          </p>
          <button
            onClick={handleAnalyze}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
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
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AI Profile Summary
              </span>
              <p className="mt-2 text-xs leading-relaxed text-slate-200">
                {analysis.profile_summary}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Career Direction & Focus
              </span>
              <p className="mt-2 text-xs leading-relaxed text-slate-200">
                {analysis.career_direction}
              </p>
            </div>
          </div>

          {/* Strengths & Current Skills */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Key Strengths ({analysis.strengths.length})
              </span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysis.strengths.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Verified Skills ({analysis.current_skills.length})
              </span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysis.current_skills.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Gaps & Recommended Skills */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Identified Skill Gaps ({analysis.skill_gaps.length})
              </span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysis.skill_gaps.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recommended Skills to Master ({analysis.recommended_skills.length})
              </span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysis.recommended_skills.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200"
                  >
                    + {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Collaboration Preferences */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Collaboration & Teammate Preferences
            </span>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.collaboration_preferences.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300"
                >
                  <span className="font-semibold text-slate-400 mr-1.5">#{idx + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Actions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recommended Next Actions
            </span>
            <div className="mt-3 space-y-2">
              {analysis.recommended_next_actions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 mt-0.5">
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
