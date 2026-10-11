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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Curated Programs
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Opportunities
          </h1>
          <p className="max-w-2xl text-xs text-slate-400">
            Personalized hackathons, fellowships, courses, internships, and grants matched to your career domain, target skills, and goals.
          </p>
        </div>

        {/* Prototype architecture banner */}
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-slate-700 bg-slate-950 p-3.5 text-xs text-slate-400">
          <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Prototype Opportunity Architecture: </span>
            Curated opportunity briefs illustrate the scoring pipeline and will connect directly to verified ecosystem partner APIs in production without synthetic links.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Domain Selector & Min Score */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, organization, or required skills..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              {DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom === "All" ? "All Domains" : dom}
                </option>
              ))}
            </select>

            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              <option value={0}>All Scores</option>
              <option value={60}>60%+ Match</option>
              <option value={75}>75%+ Match</option>
              <option value={85}>85%+ Match</option>
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

      {/* Grid of Opportunities */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 p-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <p className="mt-3 text-xs text-slate-400">Loading opportunities...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
          <Award className="mx-auto h-8 w-8 text-slate-500" />
          <h3 className="mt-3 text-sm font-bold text-white">No Matching Opportunities Found</h3>
          <p className="mt-1 text-xs text-slate-400">
            Try adjusting your search criteria or domain filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                    {opp.category}
                  </span>
                  <div className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-bold text-white">
                    {opp.matchScore}% Match
                  </div>
                </div>

                <h3 className="mt-3 text-sm font-bold text-white leading-snug">{opp.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{opp.organization}</p>

                <p className="mt-2.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                {opp.matchReasons && opp.matchReasons.length > 0 && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-[11px] text-slate-300">
                    <span className="font-semibold text-slate-400 block mb-1">
                      Why Recommended
                    </span>
                    <ul className="space-y-0.5">
                      {opp.matchReasons.slice(0, 2).map((r, i) => (
                        <li key={i} className="text-slate-300">• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    {opp.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {opp.timeline}
                  </span>
                  {opp.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      Deadline: {opp.deadline}
                    </span>
                  )}
                </div>

                {opp.rewardOrPerk && (
                  <div className="mt-2.5 flex items-center gap-1.5 rounded bg-slate-950 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300">
                    <Trophy className="h-3 w-3 text-amber-400 shrink-0" />
                    <span>{opp.rewardOrPerk}</span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-1">
                  {opp.targetSkills.slice(0, 4).map((s, i) => (
                    <span
                      key={i}
                      className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  {opp.sampleLabel}
                </span>

                <button
                  onClick={() => setSelectedOpp(opp)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                >
                  View Program Brief
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Program Brief Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                  {selectedOpp.category}
                </span>
                <h3 className="mt-2 text-lg font-bold text-white">{selectedOpp.title}</h3>
                <p className="text-xs text-slate-400">{selectedOpp.organization}</p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="rounded-md p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedOpp.description}</p>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Location</span>
                <p className="font-medium text-white">{selectedOpp.location}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Timeline</span>
                <p className="font-medium text-white">{selectedOpp.timeline}</p>
              </div>
              {selectedOpp.deadline && (
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Deadline</span>
                  <p className="font-medium text-white">{selectedOpp.deadline}</p>
                </div>
              )}
              {selectedOpp.rewardOrPerk && (
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Grant / Award</span>
                  <p className="font-medium text-amber-400">{selectedOpp.rewardOrPerk}</p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-400">
              <span className="font-semibold text-white">Prototype Note: </span>
              This program illustrates ConnectOne&apos;s opportunity scoring pipeline. In production, applications submit directly to authorized ecosystem partner endpoints.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOpp(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
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
