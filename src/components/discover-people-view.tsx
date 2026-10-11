"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Briefcase,
  Target,
  GraduationCap,
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { MatchRecommendation } from "@/types/matching";

const CAREER_DOMAINS = [
  "All",
  "AI / Machine Learning",
  "Software Development",
  "Data Science",
  "Cybersecurity",
  "Research",
  "Entrepreneurship",
  "Design / UI UX",
  "Art",
  "Dance",
  "Singing / Music",
  "Content Creation",
  "Marketing",
  "Other",
];

const SCORE_THRESHOLDS = [
  { label: "All Matches", value: 0 },
  { label: "70%+ Compatibility", value: 70 },
  { label: "80%+ High Compatibility", value: 80 },
  { label: "85%+ Exceptional Synergy", value: 85 },
];

export function DiscoverPeopleView() {
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Connection request states
  const [connectionStates, setConnectionStates] = useState<
    Record<string, "none" | "pending" | "received" | "accepted" | "connecting">
  >({});
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (selectedDomain !== "All") params.set("domain", selectedDomain);
    if (minScore > 0) params.set("minScore", minScore.toString());
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    try {
      const res = await fetch(`/api/matching/recommendations?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load match recommendations.");
      }

      setMatches(data.matches || []);
      setTotal(data.total || 0);

      // Pre-seed connection states
      const initialMap: Record<string, "none" | "pending" | "received" | "accepted"> = {};
      (data.matches || []).forEach((m: MatchRecommendation) => {
        initialMap[m.candidate.userId] = (m.candidate.connectionStatus as any) || "none";
      });
      setConnectionStates((prev) => ({ ...initialMap, ...prev }));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error fetching match recommendations."
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedDomain, minScore, searchQuery, page]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleConnect = async (targetUserId: string) => {
    setConnectionStates((prev) => ({ ...prev, [targetUserId]: "connecting" }));

    try {
      const res = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send connection request.");
      }

      setConnectionStates((prev) => ({
        ...prev,
        [targetUserId]: "pending",
      }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Could not send connection request.");
      setConnectionStates((prev) => ({ ...prev, [targetUserId]: "none" }));
    }
  };

  const handleRespondReceived = async (
    targetUserId: string,
    status: "accepted" | "declined"
  ) => {
    try {
      // Find connection ID
      const res = await fetch("/api/connections");
      const data = await res.json();
      if (!res.ok || !data.success) return;

      const conn = (data.connections || []).find(
        (c: any) => c.partner?.id === targetUserId && c.status === "pending"
      );
      if (!conn) return;

      const updateRes = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: conn.id, status }),
      });

      if (updateRes.ok) {
        setConnectionStates((prev) => ({
          ...prev,
          [targetUserId]: status === "accepted" ? "accepted" : "none",
        }));
      }
    } catch (err) {
      console.error("Error responding to connection request:", err);
    }
  };

  const toggleBreakdown = (userId: string) => {
    setExpandedBreakdownId((prev) => (prev === userId ? null : userId));
  };

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Builder Network
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Discover Teammates
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-xl">
              Connect with peers based on complementary skills, shared interests, and mutual career goals.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-300">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-white">{total}</span>
            <span>Candidates Available</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3 border-t border-slate-800/80 pt-5">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, skill, interest..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Domain */}
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              {CAREER_DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom === "All" ? "All Career Domains" : dom}
                </option>
              ))}
            </select>
          </div>

          {/* Threshold */}
          <div className="relative">
            <select
              value={minScore}
              onChange={(e) => {
                setMinScore(Number(e.target.value));
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              {SCORE_THRESHOLDS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Candidates List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 p-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <p className="mt-3 text-xs text-slate-400">Loading candidate matches...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
          <Users className="mx-auto h-8 w-8 text-slate-500" />
          <h3 className="mt-3 text-sm font-bold text-white">No Matching Candidates Found</h3>
          <p className="mt-1 text-xs text-slate-400">
            Try adjusting your search criteria or domain filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => {
            const {
              candidate,
              compatibilityScore,
              breakdown,
              complementarySkillPairs,
              explanation,
            } = match;
            const cState = connectionStates[candidate.userId] || "none";
            const isBreakdownOpen = expandedBreakdownId === candidate.userId;

            return (
              <div
                key={candidate.userId}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700"
              >
                <div>
                  {/* Top row: Name, Domain, Score Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold text-white text-sm border border-slate-700">
                        {candidate.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">
                          {candidate.fullName}
                        </h3>
                        <p className="text-xs text-slate-400">{candidate.careerDomain}</p>
                      </div>
                    </div>

                    {/* Prominent Analytical Compatibility Score */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-bold text-white">
                        <span>{compatibilityScore}%</span>
                        <span className="text-[10px] font-normal text-slate-400">Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {candidate.bio && (
                    <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {candidate.bio}
                    </p>
                  )}

                  {/* Why Good Match (Explanation) */}
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Match Rationale
                    </span>
                    <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                      {explanation}
                    </p>
                  </div>

                  {/* Complementary Synergies */}
                  {complementarySkillPairs && complementarySkillPairs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {complementarySkillPairs.map((pair, idx) => (
                        <span
                          key={idx}
                          className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300"
                          title={pair.synergyReason}
                        >
                          ⚡ {pair.userSkill} + {pair.candidateSkill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Skills tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 4).map((s, i) => (
                      <span
                        key={i}
                        className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-300"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>

                  {/* Expandable Breakdown Drawer */}
                  {isBreakdownOpen && breakdown && (
                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1.5 text-[11px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Score Breakdown (0–100)
                      </span>
                      <div className="flex justify-between text-slate-300">
                        <span>Complementary Skills (Max 30)</span>
                        <span className="font-semibold text-white">{breakdown.complementarySkillsScore} pts</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Shared Interests (Max 20)</span>
                        <span className="font-semibold text-white">{breakdown.sharedInterestsScore} pts</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Career Goals (Max 20)</span>
                        <span className="font-semibold text-white">{breakdown.careerGoalsScore} pts</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Project Artifacts (Max 15)</span>
                        <span className="font-semibold text-white">{breakdown.projectCompatibilityScore} pts</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Domain & Education (Max 10)</span>
                        <span className="font-semibold text-white">{breakdown.domainEducationScore} pts</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Direct Goal Target (Max 5)</span>
                        <span className="font-semibold text-white">{breakdown.goalAlignmentScore} pts</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Row */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                  <button
                    onClick={() => toggleBreakdown(candidate.userId)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white"
                  >
                    <span>{isBreakdownOpen ? "Hide Breakdown" : "View Breakdown"}</span>
                    {isBreakdownOpen ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>

                  {/* Connect / Pending / Connected Button States */}
                  {cState === "accepted" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Connected</span>
                    </span>
                  ) : cState === "pending" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Pending Request</span>
                    </span>
                  ) : cState === "received" ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRespondReceived(candidate.userId, "accepted")}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondReceived(candidate.userId, "declined")}
                        className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(candidate.userId)}
                      disabled={cState === "connecting"}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      {cState === "connecting" ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
