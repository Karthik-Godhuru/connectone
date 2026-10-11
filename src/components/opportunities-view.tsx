"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Trophy,
  Loader2,
  AlertCircle,
  Info,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import type { OpportunityRecommendation, OpportunityCategory } from "@/types/opportunities";

const CATEGORIES: Array<OpportunityCategory | "All"> = [
  "All",
  "Hackathons",
  "Internships",
  "Courses",
  "Competitions",
  "Research opportunities",
  "Workshops",
  "Events",
  "Fellowships",
  "Scholarships",
  "Open-source opportunities",
];

const DOMAINS = [
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
];

export function OpportunitiesView() {
  const [opportunities, setOpportunities] = useState<OpportunityRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory | "All">("All");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);

  // Modal / preview details
  const [selectedOpp, setSelectedOpp] = useState<OpportunityRecommendation | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (selectedDomain !== "All") params.set("domain", selectedDomain);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (minScore > 0) params.set("minScore", String(minScore));

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load opportunities (${res.status})`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.opportunities)) {
        setOpportunities(data.opportunities);
      } else {
        setOpportunities([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading opportunities";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCategory, selectedDomain, minScore]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-[#4E1F1A]/22 via-[#9E532D]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <span className="editorial-kicker text-[10px] text-[#D5B38B]">
            Curated Ecosystem Programs
          </span>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-[#DBD3C1] sm:text-3xl">
            Opportunities Hub
          </h1>
          <p className="max-w-2xl text-xs text-[#8FAAB5] leading-relaxed">
            Curated hackathons, research grants, internships, and fellowships matched to your domain, verified proficiencies, and career stage.
          </p>
        </div>

        {/* Prototype architecture banner */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3.5 text-xs text-[#8FAAB5] relative z-10">
          <Info className="h-4 w-4 shrink-0 text-[#D5B38B] mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-[#DBD3C1]">Curated Program Telemetry: </span>
            Evaluated by the ConnectOne matching engine against your active skills and goals. Applications submit directly to verified host endpoints.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat
                  ? "glass-button-primary font-semibold shadow-md shadow-[#9E532D]/20 text-[#F4EFE6]"
                  : "glass-pill text-[#8FAAB5] hover:text-[#DBD3C1] hover:bg-[#252E33]/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Domain Selector & Min Score */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8FAAB5]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, organization, or required skills..."
              className="glass-input w-full rounded-xl py-2 pl-9 pr-3.5 text-xs text-[#DBD3C1] placeholder-[#8FAAB5]/50 focus:border-[#D5B38B] focus:ring-[#D5B38B]"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-xs text-[#DBD3C1] focus:border-[#D5B38B]"
            >
              {DOMAINS.map((dom) => (
                <option key={dom} value={dom} className="bg-[#192024] text-[#DBD3C1]">
                  {dom === "All" ? "All Domains" : dom}
                </option>
              ))}
            </select>

            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="glass-input rounded-xl px-3 py-2 text-xs text-[#DBD3C1] focus:border-[#D5B38B]"
            >
              <option value={0} className="bg-[#192024] text-[#DBD3C1]">All Scores</option>
              <option value={60} className="bg-[#192024] text-[#DBD3C1]">60%+ Match</option>
              <option value={75} className="bg-[#192024] text-[#DBD3C1]">75%+ Match</option>
              <option value={85} className="bg-[#192024] text-[#DBD3C1]">85%+ Match</option>
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

      {/* Grid of Opportunities */}
      {loading ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#D5B38B]" />
          <p className="mt-3 text-xs text-[#8FAAB5]">Scanning verified opportunities catalog...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center border-dashed border-[#DBD3C1]/15">
          <Award className="mx-auto h-8 w-8 text-[#8FAAB5]/60" />
          <h3 className="mt-3 font-serif text-sm font-medium text-[#DBD3C1]">No Matching Opportunities Found</h3>
          <p className="mt-1 text-xs text-[#8FAAB5]">
            Try relaxing your filter criteria or choosing a different category.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="glass-card flex flex-col justify-between rounded-2xl p-6 relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5">
                  <span className="glass-pill rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-[#8FAAB5]">
                    {opp.category}
                  </span>
                  <div className="rounded-full border border-[#D5B38B]/30 bg-[#D5B38B]/10 px-2.5 py-0.5 text-xs font-bold text-[#D5B38B] tabular-nums shadow-[0_0_12px_rgba(213,179,139,0.15)]">
                    {opp.matchScore}% Match
                  </div>
                </div>

                <h3 className="mt-3 font-serif text-base font-semibold text-[#DBD3C1] leading-snug tracking-tight">{opp.title}</h3>
                <p className="text-xs text-[#8FAAB5] mt-0.5">{opp.organization}</p>

                <p className="mt-2.5 text-xs text-[#DBD3C1]/85 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                {opp.matchReasons && opp.matchReasons.length > 0 && (
                  <div className="mt-3.5 rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-3 text-[11px]">
                    <span className="editorial-kicker text-[9px] text-[#D5B38B] block mb-1">
                      Why Recommended
                    </span>
                    <ul className="space-y-0.5">
                      {opp.matchReasons.slice(0, 2).map((r, i) => (
                        <li key={i} className="text-[#DBD3C1]/80 leading-relaxed">• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3.5 flex flex-wrap items-center gap-3 text-[11px] text-[#8FAAB5] border-t border-[#DBD3C1]/08 pt-3">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#D5B38B]" />
                    {opp.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#D5B38B]" />
                    {opp.timeline}
                  </span>
                  {opp.deadline && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-[#8FAAB5]" />
                      <span>Deadline: {opp.deadline}</span>
                    </span>
                  )}
                </div>

                {opp.rewardOrPerk && (
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-[#9E532D]/15 border border-[#9E532D]/25 px-3 py-1 text-[11px] text-[#D5B38B]">
                    <Trophy className="h-3.5 w-3.5 text-[#D5B38B] shrink-0" />
                    <span className="font-medium">{opp.rewardOrPerk}</span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-1">
                  {opp.targetSkills.slice(0, 4).map((s, i) => (
                    <span
                      key={i}
                      className="glass-pill rounded px-2 py-0.5 text-[10px] text-[#8FAAB5]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#DBD3C1]/08 flex items-center justify-between">
                <span className="editorial-kicker text-[9px] text-[#8FAAB5]/60">
                  {opp.sampleLabel}
                </span>

                <button
                  onClick={() => setSelectedOpp(opp)}
                  className="glass-button-secondary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold"
                >
                  <span>View Program Brief</span>
                  <ArrowRight className="h-3 w-3 text-[#D5B38B]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Program Brief Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="glass-panel max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-7 space-y-4 relative border-[#DBD3C1]/15">
            <div className="flex items-start justify-between">
              <div>
                <span className="glass-pill rounded-full px-2.5 py-0.5 text-xs font-semibold text-[#D5B38B]">
                  {selectedOpp.category}
                </span>
                <h3 className="font-serif mt-2 text-lg font-medium text-[#DBD3C1] tracking-tight">{selectedOpp.title}</h3>
                <p className="text-xs text-[#8FAAB5]">{selectedOpp.organization}</p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="rounded-lg p-1.5 text-[#8FAAB5] hover:bg-[#252E33]/60 hover:text-[#DBD3C1] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#DBD3C1]/90 leading-relaxed">{selectedOpp.description}</p>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/70 p-3.5 text-xs">
              <div>
                <span className="editorial-kicker text-[9px] text-[#8FAAB5]">Location</span>
                <p className="font-semibold text-[#DBD3C1] mt-0.5">{selectedOpp.location}</p>
              </div>
              <div>
                <span className="editorial-kicker text-[9px] text-[#8FAAB5]">Timeline</span>
                <p className="font-semibold text-[#DBD3C1] mt-0.5">{selectedOpp.timeline}</p>
              </div>
              {selectedOpp.deadline && (
                <div>
                  <span className="editorial-kicker text-[9px] text-[#8FAAB5]">Deadline</span>
                  <p className="font-semibold text-[#DBD3C1] mt-0.5">{selectedOpp.deadline}</p>
                </div>
              )}
              {selectedOpp.rewardOrPerk && (
                <div>
                  <span className="editorial-kicker text-[9px] text-[#8FAAB5]">Grant / Award</span>
                  <p className="font-semibold text-[#D5B38B] mt-0.5">{selectedOpp.rewardOrPerk}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3.5 text-[11px] text-[#8FAAB5] leading-relaxed">
              <span className="font-semibold text-[#DBD3C1]">Application Pipeline: </span>
              This brief illustrates ConnectOne&apos;s multi-dimensional opportunity matching. In production, requests dispatch to host API partners without synthetic links.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOpp(null)}
                className="glass-button-primary rounded-xl px-4 py-2 text-xs font-semibold"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
