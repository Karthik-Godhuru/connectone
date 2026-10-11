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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Progression Planning
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Career Roadmap
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-xl">
              Sequential career trajectory synthesizing your current skills, projects, and target role into concrete milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
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
                  <span>Generate Roadmap</span>
                </>
              )}
            </button>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <span>Explore Opportunities</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Roadmap Trajectory & Progress Bar */}
        {roadmap && (
          <div className="mt-6 border-t border-slate-800/80 pt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Target Role</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-lg font-bold text-white">{roadmap.target_career}</h2>
                  <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                    {roadmap.current_stage}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Progress</span>
                <p className="text-xs font-bold text-white">
                  {completedMilestones} of {totalMilestones} Completed ({progressPercent}%)
                </p>
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 p-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <p className="mt-3 text-xs text-slate-400">Loading your roadmap...</p>
        </div>
      ) : !roadmap ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
          <Compass className="mx-auto h-8 w-8 text-slate-500" />
          <h3 className="mt-3 text-sm font-bold text-white">No Roadmap Generated Yet</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            ConnectOne will generate an actionable trajectory with milestones customized to your career domain and aspirations.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
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
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span>Immediate Next Action</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-white leading-relaxed">
                {roadmap.next_action}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Priority: High</span>
                <span className="font-semibold text-blue-400">Next Step</span>
              </div>
            </div>

            {/* Next Skills to Acquire */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                <Layers className="h-4 w-4 text-slate-400" />
                <span>Next Skills to Acquire</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Recommended proficiencies to advance your target role.
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {roadmap.next_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Milestones Checklist */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-sm font-bold text-white">Progression Milestones</h2>
                <span className="text-xs text-slate-400">
                  {completedMilestones} of {totalMilestones} Completed
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {roadmap.milestones.map((milestone, idx) => {
                  const isCompleted = Boolean(milestone.completed);
                  const isToggling = togglingIndex === idx;

                  const priorityColors = {
                    high: "border-rose-500/30 text-rose-400 bg-rose-500/10",
                    medium: "border-amber-500/30 text-amber-400 bg-amber-500/10",
                    low: "border-blue-500/30 text-blue-400 bg-blue-500/10",
                  };

                  return (
                    <div
                      key={milestone.id || idx}
                      className={`flex items-start gap-3.5 rounded-lg border p-4 transition ${
                        isCompleted
                          ? "border-slate-800/60 bg-slate-950/40 opacity-70"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <button
                        onClick={() => toggleMilestone(idx, isCompleted)}
                        disabled={isToggling}
                        className="mt-0.5 shrink-0 transition hover:scale-105 disabled:opacity-50"
                        title={isCompleted ? "Mark as in-progress" : "Mark as completed"}
                      >
                        {isToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3
                            className={`text-xs font-bold ${
                              isCompleted ? "line-through text-slate-500" : "text-white"
                            }`}
                          >
                            <span className="text-slate-500 mr-2">#{idx + 1}</span>
                            {milestone.title}
                          </h3>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                priorityColors[milestone.priority] || priorityColors.medium
                              }`}
                            >
                              {milestone.priority}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock className="h-3 w-3 text-slate-500" />
                              {milestone.estimated_time}
                            </span>
                          </div>
                        </div>

                        <p
                          className={`text-xs leading-relaxed ${
                            isCompleted ? "text-slate-500" : "text-slate-400"
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
