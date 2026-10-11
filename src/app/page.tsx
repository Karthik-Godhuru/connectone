import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Compass,
  Database,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Code2,
  Award,
  Zap,
  Sparkles,
} from "lucide-react";

export default async function Home() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {}

  const schemaTables = [
    { name: "profiles", desc: "User identity, bio, links, and career domain metadata" },
    { name: "skills", desc: "Master technical and craft skill taxonomy" },
    { name: "user_skills", desc: "User-skill junction with verified proficiency levels" },
    { name: "interests", desc: "Domain verticals, passions, and creative tracks" },
    { name: "user_interests", desc: "User-interest associations and preferences" },
    { name: "projects", desc: "Portfolio items, hackathon builds, and artifacts" },
    { name: "connections", desc: "Peer collaboration requests, invites, and states" },
    { name: "matches", desc: "Computed teammate and project compatibility records" },
    { name: "career_roadmaps", desc: "Target role progression and milestone paths" },
  ];

  const capabilities = [
    {
      title: "Complementary Teammate Matching",
      description:
        "Bilateral skill synergy algorithm pairing frontend architects with AI specialists, product designers with backend engineers, and founders with domain experts.",
      metric: "6-Factor Weighted Synergy",
      icon: Users,
      accent: "text-[#D5B38B]",
      border: "border-[#D5B38B]/20",
    },
    {
      title: "AI Profile Intelligence Studio",
      description:
        "Transforms background information into executive synthesis covering verified competencies, strategic skill gaps, learning paths, and collaboration dynamics.",
      metric: "Gemini 3.8 Intelligence",
      icon: Cpu,
      accent: "text-[#B86539]",
      border: "border-[#9E532D]/20",
    },
    {
      title: "Dynamic Career Roadmaps",
      description:
        "Calibrates milestones, sequential timeframes, priorities, and actionable tactical next steps stored directly in relational PostgreSQL schema.",
      metric: "Cross-Disciplinary Paths",
      icon: Compass,
      accent: "text-[#D5B38B]",
      border: "border-[#D5B38B]/20",
    },
    {
      title: "Opportunity Discovery Engine",
      description:
        "Surfaces curated hackathons, research grants, builder fellowships, and high-impact internships calibrated to your active domain and current stage.",
      metric: "10 Curated Verticals",
      icon: Award,
      accent: "text-[#8FAAB5]",
      border: "border-[#5A7E8B]/20",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-28 relative">
      {/* Hero Section */}
      <section className="pt-10 pb-12 sm:pt-20 sm:pb-20 text-center relative">
        {/* Subtle hero warm glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[340px] bg-gradient-to-r from-[#4E1F1A]/22 via-[#9E532D]/15 to-[#D5B38B]/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-3xl space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DBD3C1]/15 bg-[#252E33]/60 px-4 py-1.5 text-xs font-medium text-[#DBD3C1] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D5B38B] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D5B38B]" />
            </span>
            <span className="font-semibold text-[#F4EFE6]">ConnectOne Studio</span>
            <span className="text-[#DBD3C1]/30">•</span>
            <span className="text-[#8FAAB5]">AI-Powered Student Career & Collaboration OS</span>
          </div>

          <div className="space-y-3">
            <span className="font-script text-2xl sm:text-3xl text-[#D5B38B] block tracking-normal">
              Curated synergy for builders
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl sm:leading-[1.12] text-[#DBD3C1] font-normal tracking-tight">
              Connect with <span className="italic font-normal text-[#F4EFE6]">complementary builders</span>.{" "}
              <span className="block mt-1 font-serif text-[#D5B38B]">
                Accelerate your craft.
              </span>
            </h1>
          </div>

          <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-[#8FAAB5]">
            ConnectOne unifies developers, designers, hackers, and researchers. Match through multi-factor skill synergy, generate guided career progression roadmaps, and build together.
          </p>

          <div className="pt-3 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="glass-button-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-semibold sm:w-auto shadow-lg shadow-[#9E532D]/25"
                >
                  <span>Open Studio Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/discover"
                  className="glass-button-secondary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-semibold sm:w-auto"
                >
                  <Users className="h-3.5 w-3.5 text-[#D5B38B]" />
                  <span>Discover Teammates</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="glass-button-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-semibold sm:w-auto shadow-lg shadow-[#9E532D]/25"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/login"
                  className="glass-button-secondary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-semibold sm:w-auto"
                >
                  <span>Sign In to Dashboard</span>
                </Link>
              </>
            )}
            <Link
              href="/status"
              className="glass-pill flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-medium text-[#8FAAB5] hover:text-[#DBD3C1] transition sm:w-auto"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>System Health</span>
            </Link>
          </div>

          {/* Architectural specs pill */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8FAAB5]/90">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#D5B38B]" />
              Next.js 16 App Router
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Supabase PostgreSQL & SSR Auth
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#D5B38B]" />
              Gemini 3.8 Intelligence
            </span>
          </div>
        </div>
      </section>

      {/* Product Workflow: 4 Functional Pillars */}
      <section className="space-y-8">
        <div className="border-b border-[#DBD3C1]/10 pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <span className="editorial-kicker text-[10px] text-[#D5B38B]">
              Core Capabilities
            </span>
            <h2 className="mt-1 font-serif text-xl sm:text-2xl font-medium text-[#DBD3C1] tracking-tight">
              A cohesive system for collaboration and career momentum
            </h2>
          </div>
          <p className="text-xs text-[#8FAAB5] max-w-sm">
            Engineered with deep multi-factor matchmaking, intelligent synthesis, and live telemetry.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="glass-card flex flex-col justify-between rounded-2xl p-6 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`editorial-kicker text-[9px] font-bold ${cap.accent}`}>
                      {cap.metric}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#252E33]/60 border border-[#DBD3C1]/10">
                      <Icon className={`h-4 w-4 ${cap.accent}`} />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[#DBD3C1] tracking-tight leading-snug">{cap.title}</h3>
                  <p className="mt-2.5 text-xs text-[#8FAAB5] leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Flow Preview Grid */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Matchmaking Methodology Preview */}
        <div className="glass-panel rounded-2xl p-7 space-y-5">
          <div className="border-b border-[#DBD3C1]/10 pb-4">
            <span className="editorial-kicker text-[10px] text-[#D5B38B]">
              Explainable Scoring Engine
            </span>
            <h3 className="mt-1 font-serif text-lg font-medium text-[#DBD3C1]">
              Deterministic Teammate Synergy Formulation
            </h3>
            <p className="mt-1 text-xs text-[#8FAAB5] leading-relaxed">
              Matchmaking prioritizes bilateral complementarity over homogeneous skill sets. Developers pair with designers, and technical builders unite with domain experts.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { label: "Complementary Skill Synergy", pct: 30, desc: "Cross-domain technical pairing (e.g., Frontend ↔ Backend)" },
              { label: "Shared Verified Interests", pct: 20, desc: "Alignment in domain verticals and hackathon focus" },
              { label: "Career Goal Compatibility", pct: 20, desc: "Harmonized career trajectory and timeline objectives" },
              { label: "Project Artifact Alignment", pct: 15, desc: "Historical repo and build evidence synergy" },
              { label: "Domain & Education Cross-Over", pct: 10, desc: "Institutional & regional proximity weighting" },
              { label: "Direct Primary Target Alignment", pct: 5, desc: "Primary career track synchronicity" },
            ].map((weight, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-3"
              >
                <div>
                  <span className="text-[#DBD3C1] font-semibold text-xs">{weight.label}</span>
                  <p className="text-[10px] text-[#8FAAB5]/70">{weight.desc}</p>
                </div>
                <span className="font-bold text-[#D5B38B] tabular-nums text-xs ml-3">
                  {weight.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Database & Schema Integrity */}
        <div className="glass-panel rounded-2xl p-7 space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#DBD3C1]/10 pb-4">
              <span className="editorial-kicker text-[10px] text-[#8FAAB5]">
                Relational Architecture
              </span>
              <h3 className="mt-1 font-serif text-lg font-medium text-[#DBD3C1]">
                9 Connected Supabase Tables
              </h3>
              <p className="mt-1 text-xs text-[#8FAAB5] leading-relaxed">
                Normalized PostgreSQL relational model governing profiles, skill junction graphs, connection invites, and AI roadmap progression.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-4">
              {schemaTables.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-[#D5B38B]" />
                    <span className="font-mono text-[11px] font-bold text-[#DBD3C1]">{t.name}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-[#8FAAB5] line-clamp-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/status"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D5B38B] hover:text-[#E4C8A6] transition"
            >
              <span>Inspect schema health & connection status</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="glass-panel rounded-3xl p-8 sm:p-14 text-center space-y-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4E1F1A]/20 via-[#9E532D]/12 to-[#D5B38B]/10 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="editorial-kicker text-[10px] text-[#D5B38B]">
            Join ConnectOne
          </span>
          <h2 className="font-serif text-2xl font-medium text-[#DBD3C1] sm:text-4xl tracking-tight">
            Ready to find your ideal collaborators and advance?
          </h2>
          <p className="text-xs text-[#8FAAB5] sm:text-sm leading-relaxed">
            Complete quick onboarding, receive your personalized AI career roadmap, and match with verified teammates calibrated to your objectives.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="glass-button-primary rounded-xl px-6 py-3 text-xs font-semibold"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="glass-button-secondary rounded-xl px-6 py-3 text-xs font-semibold"
                >
                  View Your Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="glass-button-primary rounded-xl px-6 py-3 text-xs font-semibold shadow-lg shadow-[#9E532D]/25"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/login"
                  className="glass-button-secondary rounded-xl px-6 py-3 text-xs font-semibold"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
