"use client";

import { useState, useEffect } from "react";
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { CareerRoadmap, RoadmapMilestone } from "@/types/roadmap";

export function CareerRoadmapView() {
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingIndex, setTogglingIndex] = useState<number | null>(null);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/roadmap");
      if (!res.ok) {
        throw new Error(`Failed to load roadmap (${res.status})`);
      }
      const data = await res.json();
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
      } else {
        setRoadmap(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching roadmap";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await fetch("/api/roadmap", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI roadmap");
      }

      setRoadmap(data.roadmap);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating roadmap";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const toggleMilestone = async (index: number, currentCompleted: boolean) => {
    if (!roadmap) return;
    try {
      setTogglingIndex(index);
      const res = await fetch("/api/roadmap/milestone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneIndex: index,
          completed: !currentCompleted,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update milestone");
      }

      // Update local state
      const updatedMilestones = [...roadmap.milestones];
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        completed: !currentCompleted,
      };

      setRoadmap({
        ...roadmap,
        milestones: updatedMilestones,
      });
    } catch (err: unknown) {
      console.error("Error toggling milestone:", err);
    } finally {
      setTogglingIndex(null);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const totalMilestones = roadmap?.milestones?.length || 0;
  const completedMilestones =
    roadmap?.milestones?.filter((m) => m.completed).length || 0;
  const progressPercent =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-[#4E1F1A]/22 via-[#9E532D]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <span className="editorial-kicker text-[10px] text-[#D5B38B]">
              Progression Architecture
            </span>
            <h1 className="font-serif mt-1 text-2xl font-medium tracking-tight text-[#DBD3C1] sm:text-3xl">
              Career Trajectory Roadmap
            </h1>
            <p className="mt-1 text-xs text-[#8FAAB5] max-w-xl leading-relaxed">
              Synthesizes your verified skills, projects, and career targets into actionable milestone stages.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-lg shadow-[#9E532D]/20 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : roadmap ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Regenerate Roadmap</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate AI Roadmap</span>
                </>
              )}
            </button>
            <Link
              href="/opportunities"
              className="glass-button-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold"
            >
              <span>Explore Grants & Hackathons</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#D5B38B]" />
            </Link>
          </div>
        </div>

        {/* Roadmap Trajectory & Progress Bar */}
        {roadmap && (
          <div className="mt-6 border-t border-[#DBD3C1]/10 pt-5 space-y-4 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="editorial-kicker text-[9px] text-[#8FAAB5]">Target Role</span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <h2 className="font-serif text-lg font-medium text-[#DBD3C1] tracking-tight">{roadmap.target_career}</h2>
                  <span className="glass-pill rounded-full px-2.5 py-0.5 text-xs font-medium text-[#D5B38B]">
                    {roadmap.current_stage}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#8FAAB5]">Progress</span>
                <p className="text-xs font-bold text-[#DBD3C1] tabular-nums">
                  {completedMilestones} of {totalMilestones} Completed ({progressPercent}%)
                </p>
              </div>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#192024] border border-[#DBD3C1]/10 p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-[#9E532D] to-[#D5B38B] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(213,179,139,0.3)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#D5B38B]" />
          <p className="mt-3 text-xs text-[#8FAAB5]">Loading your progression roadmap...</p>
        </div>
      ) : !roadmap ? (
        <div className="glass-panel rounded-2xl p-16 text-center border-dashed border-[#DBD3C1]/15">
          <Compass className="mx-auto h-8 w-8 text-[#8FAAB5]/60" />
          <h3 className="mt-3 font-serif text-sm font-medium text-[#DBD3C1]">No Roadmap Generated Yet</h3>
          <p className="mt-1 text-xs text-[#8FAAB5] max-w-sm mx-auto leading-relaxed">
            ConnectOne will generate an actionable trajectory with milestones customized to your domain and aspirations.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-5 glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-lg shadow-[#9E532D]/25 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Career Roadmap</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Next Action & Next Skills */}
          <div className="space-y-6 lg:col-span-1">
            {/* Immediate Next Action */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-[#252E33]/90 to-[#9E532D]/12 border border-[#DBD3C1]/12">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D5B38B]">
                <TrendingUp className="h-4 w-4 text-[#D5B38B]" />
                <span>Immediate Next Action</span>
              </div>
              <p className="font-serif mt-3 text-sm font-medium text-[#DBD3C1] leading-relaxed">
                {roadmap.next_action}
              </p>
              <div className="mt-4 pt-3.5 border-t border-[#DBD3C1]/08 text-[11px] text-[#8FAAB5] flex justify-between">
                <span>Priority: High</span>
                <span className="font-semibold text-[#D5B38B]">Action Item</span>
              </div>
            </div>

            {/* Next Skills to Acquire */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[#8FAAB5] text-xs font-bold uppercase tracking-wider">
                <Layers className="h-4 w-4 text-[#D5B38B]" />
                <span>Next Skills to Acquire</span>
              </div>
              <p className="mt-1 text-xs text-[#8FAAB5]/80">
                Recommended proficiencies to advance your target role.
              </p>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {roadmap.next_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="glass-pill rounded-lg px-2.5 py-1 text-xs text-[#DBD3C1] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Milestones Checklist */}
          <div className="space-y-4 lg:col-span-2">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-4">
                <h2 className="font-serif text-base font-medium text-[#DBD3C1] tracking-tight">Progression Milestones</h2>
                <span className="text-xs text-[#8FAAB5] tabular-nums">
                  {completedMilestones} of {totalMilestones} Completed
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {roadmap.milestones.map((milestone, idx) => {
                  const isCompleted = Boolean(milestone.completed);
                  const isToggling = togglingIndex === idx;

                  const priorityColors = {
                    high: "border-rose-500/30 text-rose-400 bg-rose-500/10",
                    medium: "border-[#D5B38B]/30 text-[#D5B38B] bg-[#D5B38B]/10",
                    low: "border-[#5A7E8B]/30 text-[#8FAAB5] bg-[#5A7E8B]/10",
                  };

                  return (
                    <div
                      key={milestone.id || idx}
                      className={`flex items-start gap-3.5 rounded-xl border p-4 transition ${
                        isCompleted
                          ? "border-[#DBD3C1]/06 bg-[#192024]/40 opacity-70"
                          : "glass-card border-[#DBD3C1]/10"
                      }`}
                    >
                      <button
                        onClick={() => toggleMilestone(idx, isCompleted)}
                        disabled={isToggling}
                        className="mt-0.5 shrink-0 transition hover:scale-110 disabled:opacity-50"
                        title={isCompleted ? "Mark as in-progress" : "Mark as completed"}
                      >
                        {isToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#D5B38B]" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-[#8FAAB5]/60 hover:text-[#D5B38B]" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3
                            className={`text-xs font-bold ${
                              isCompleted ? "line-through text-[#8FAAB5]/60" : "text-[#DBD3C1]"
                            }`}
                          >
                            <span className="text-[#D5B38B] mr-2">#{idx + 1}</span>
                            {milestone.title}
                          </h3>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                                priorityColors[milestone.priority] || priorityColors.medium
                              }`}
                            >
                              {milestone.priority}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-[#8FAAB5] tabular-nums">
                              <Clock className="h-3 w-3 text-[#8FAAB5]/70" />
                              {milestone.estimated_time}
                            </span>
                          </div>
                        </div>

                        <p
                          className={`text-xs leading-relaxed ${
                            isCompleted ? "text-[#8FAAB5]/60" : "text-[#8FAAB5]"
                          }`}
                        >
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
