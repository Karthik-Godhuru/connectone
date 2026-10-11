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
  Sparkles,
  Zap,
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
  { label: "All Synergy Levels", value: 0 },
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
    <div className="space-y-7">
      {/* Directory Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-[#4E1F1A]/22 via-[#9E532D]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <span className="editorial-kicker text-[10px] text-[#D5B38B]">
              Synergy Discovery Studio
            </span>
            <h1 className="font-serif mt-1 text-2xl font-medium tracking-tight text-[#DBD3C1] sm:text-3xl">
              Discover Complementary Teammates
            </h1>
            <p className="mt-1 text-xs text-[#8FAAB5] max-w-xl leading-relaxed">
              Find peers who balance your technical and creative skill set, shared domain passions, and project aspirations.
            </p>
          </div>

          <div className="glass-pill flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs text-[#DBD3C1]">
            <Users className="h-4 w-4 text-[#D5B38B]" />
            <span className="font-bold text-[#DBD3C1] tabular-nums">{total}</span>
            <span className="text-[#8FAAB5]">Candidates Available</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3 border-t border-[#DBD3C1]/10 pt-5 relative z-10">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8FAAB5]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, skill, interest..."
              className="glass-input w-full rounded-xl py-2 pl-9 pr-3.5 text-xs text-[#DBD3C1] placeholder-[#8FAAB5]/50 focus:border-[#D5B38B] focus:ring-[#D5B38B]"
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
              className="glass-input w-full rounded-xl py-2 px-3.5 text-xs text-[#DBD3C1] focus:border-[#D5B38B]"
            >
              {CAREER_DOMAINS.map((dom) => (
                <option key={dom} value={dom} className="bg-[#192024] text-[#DBD3C1]">
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
              className="glass-input w-full rounded-xl py-2 px-3.5 text-xs text-[#DBD3C1] focus:border-[#D5B38B]"
            >
              {SCORE_THRESHOLDS.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#192024] text-[#DBD3C1]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Candidates List */}
      {isLoading ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#D5B38B]" />
          <p className="mt-3 text-xs text-[#8FAAB5]">Computing multi-factor compatibility scores...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center border-dashed border-[#DBD3C1]/15">
          <Users className="mx-auto h-8 w-8 text-[#8FAAB5]/60" />
          <h3 className="mt-3 font-serif text-sm font-medium text-[#DBD3C1]">No Matching Candidates Found</h3>
          <p className="mt-1 text-xs text-[#8FAAB5]">
            Try broadening your search criteria or selecting a different career domain.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
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
                className="glass-card flex flex-col justify-between rounded-2xl p-6 relative overflow-hidden"
              >
                <div>
                  {/* Top row: Name, Domain, Score Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E532D]/25 via-[#4E1F1A]/20 to-[#D5B38B]/20 border border-[#DBD3C1]/10 text-sm font-black text-[#D5B38B]">
                        {candidate.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-serif font-medium text-[#DBD3C1] text-base tracking-tight">
                          {candidate.fullName}
                        </h3>
                        <p className="text-xs text-[#8FAAB5]">{candidate.careerDomain}</p>
                      </div>
                    </div>

                    {/* Prominent Compatibility Score Badge */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 tabular-nums shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                        <span>{compatibilityScore}%</span>
                        <span className="text-[10px] font-normal text-emerald-400/80">Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {candidate.bio && (
                    <p className="mt-3 text-xs text-[#DBD3C1]/85 line-clamp-2 leading-relaxed">
                      {candidate.bio}
                    </p>
                  )}

                  {/* Why Good Match (Explanation) */}
                  <div className="mt-3.5 rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-3 text-xs">
                    <span className="editorial-kicker text-[9px] text-[#D5B38B]">
                      Synergy Analysis
                    </span>
                    <p className="mt-1 text-[#DBD3C1]/90 text-[11px] leading-relaxed italic">
                      &ldquo;{explanation}&rdquo;
                    </p>
                  </div>

                  {/* Complementary Synergies */}
                  {complementarySkillPairs && complementarySkillPairs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {complementarySkillPairs.map((pair, idx) => (
                        <span
                          key={idx}
                          className="glass-pill rounded-lg px-2.5 py-0.5 text-[10px] font-medium text-[#D5B38B] border-[#D5B38B]/20"
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
                        className="glass-pill rounded px-2 py-0.5 text-[10px] text-[#8FAAB5]"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>

                  {/* Expandable Breakdown Drawer */}
                  {isBreakdownOpen && breakdown && (
                    <div className="mt-3.5 rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/70 p-3.5 space-y-1.5 text-[11px]">
                      <span className="editorial-kicker text-[9px] text-[#8FAAB5]">
                        Multi-Factor Breakdown (0–100)
                      </span>
                      <div className="flex justify-between text-[#8FAAB5]">
                        <span>Complementary Skills (Max 30)</span>
                        <span className="font-semibold text-[#DBD3C1] tabular-nums">{breakdown.complementarySkillsScore} pts</span>
                      </div>
                      <div className="flex justify-between text-[#8FAAB5]">
                        <span>Shared Interests (Max 20)</span>
                        <span className="font-semibold text-[#DBD3C1] tabular-nums">{breakdown.sharedInterestsScore} pts</span>
                      </div>
                      <div className="flex justify-between text-[#8FAAB5]">
                        <span>Career Goals (Max 20)</span>
                        <span className="font-semibold text-[#DBD3C1] tabular-nums">{breakdown.careerGoalsScore} pts</span>
                      </div>
                      <div className="flex justify-between text-[#8FAAB5]">
                        <span>Project Artifacts (Max 15)</span>
                        <span className="font-semibold text-[#DBD3C1] tabular-nums">{breakdown.projectCompatibilityScore} pts</span>
                      </div>
                      <div className="flex justify-between text-[#8FAAB5]">
                        <span>Domain & Education (Max 10)</span>
                        <span className="font-semibold text-[#DBD3C1] tabular-nums">{breakdown.domainEducationScore} pts</span>
                      </div>
                      <div className="flex justify-between text-[#8FAAB5]">
                        <span>Direct Goal Target (Max 5)</span>
                        <span className="font-semibold text-[#DBD3C1] tabular-nums">{breakdown.goalAlignmentScore} pts</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Row */}
                <div className="mt-4 flex items-center justify-between border-t border-[#DBD3C1]/08 pt-3.5">
                  <button
                    onClick={() => toggleBreakdown(candidate.userId)}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#8FAAB5] hover:text-[#DBD3C1] transition"
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
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Connected</span>
                    </span>
                  ) : cState === "pending" ? (
                    <span className="glass-pill inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium text-[#8FAAB5]">
                      <Clock className="h-3.5 w-3.5 text-[#D5B38B]" />
                      <span>Pending Request</span>
                    </span>
                  ) : cState === "received" ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRespondReceived(candidate.userId, "accepted")}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondReceived(candidate.userId, "declined")}
                        className="rounded-xl border border-[#DBD3C1]/10 px-3 py-1.5 text-xs font-semibold text-[#8FAAB5] hover:text-[#DBD3C1]"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(candidate.userId)}
                      disabled={cState === "connecting"}
                      className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
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
