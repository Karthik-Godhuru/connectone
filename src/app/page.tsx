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
        "Calculates bilateral skill synergy across 10 disciplines. Connects developers with designers, founders with technical architects, and artists with media engineers.",
      metric: "6-Factor Weighted Scoring",
    },
    {
      title: "AI Profile Intelligence",
      description:
        "Transforms onboarding data into an executive synthesis covering verified strengths, critical skill gaps, recommended learning paths, and collaboration dynamics.",
      metric: "Gemini 3.8 Flash Powered",
    },
    {
      title: "Structured Career Roadmaps",
      description:
        "Synthesizes target career trajectories with sequential milestones, realistic timeframes, priority levels, and checklist tracking saved directly to PostgreSQL.",
      metric: "Cross-Disciplinary Tracks",
    },
    {
      title: "Opportunity Discovery Engine",
      description:
        "Scores and surfaces relevant hackathons, fellowships, internships, research grants, and open-source initiatives calibrated to your current stage and goals.",
      metric: "10 Curated Categories",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-24">
      {/* Hero Section */}
      <section className="pt-8 pb-12 sm:pt-16 sm:pb-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 text-xs font-medium text-slate-300">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>ConnectOne Platform</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Collaboration & Career Engine</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-tight">
            Connect with complementary builders. Move toward your career goals.
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-slate-400 sm:text-base leading-relaxed">
            ConnectOne brings together developers, designers, researchers, and creators.
            Match based on complementary skills, generate structured progression roadmaps,
            and discover high-impact opportunities.
          </p>

          <div className="pt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/discover"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:w-auto"
                >
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Discover Teammates</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:w-auto"
                >
                  <span>Sign In to Dashboard</span>
                </Link>
              </>
            )}
            <Link
              href="/status"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:text-slate-300 sm:w-auto"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>System Status</span>
            </Link>
          </div>

          {/* Architectural specs pill */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
              Next.js 16 App Router
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              Supabase PostgreSQL & SSR Auth
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-slate-400" />
              Gemini 3.8 Intelligence
            </span>
          </div>
        </div>
      </section>

      {/* Product Workflow: 4 Functional Pillars */}
      <section className="space-y-8">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Core Architecture
          </h2>
          <p className="mt-1 text-xl font-bold text-white sm:text-2xl">
            A cohesive system for collaboration and career momentum
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {cap.metric}
                </span>
                <h3 className="mt-2 text-sm font-bold text-white">{cap.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Flow Preview Grid */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Matchmaking Methodology Preview */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Explainable Scoring
            </span>
            <h3 className="mt-1 text-base font-bold text-white">
              Deterministic Teammate Matchmaking
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Matching balances identical strengths with cross-disciplinary synergies.
              A builder who excels at Machine Learning matches strongly with a product designer or full-stack engineer.
            </p>
          </div>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-300 font-medium">Complementary Skill Synergy</span>
              <span className="font-bold text-white">30%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-300 font-medium">Shared Verified Interests</span>
              <span className="font-bold text-white">20%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-300 font-medium">Career Goal Compatibility</span>
              <span className="font-bold text-white">20%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-300 font-medium">Project Artifact Alignment</span>
              <span className="font-bold text-white">15%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-300 font-medium">Domain & Education Cross-Over</span>
              <span className="font-bold text-white">10%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-300 font-medium">Direct Primary Target Alignment</span>
              <span className="font-bold text-white">5%</span>
            </div>
          </div>
        </div>

        {/* Database & Schema Integrity */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Database Schema
            </span>
            <h3 className="mt-1 text-base font-bold text-white">
              9 Connected Supabase Tables
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Clean relational schema modeling profiles, skills, interests, projects, connections,
              matches, and roadmaps without redundancy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {schemaTables.map((t, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-800 bg-slate-950 p-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-slate-500" />
                  <span className="font-mono text-[11px] font-bold text-slate-200">{t.name}</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400 line-clamp-1">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/status"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:underline"
            >
              <span>Inspect schema health check</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to find collaborators and level up?
        </h2>
        <p className="mx-auto max-w-xl text-xs text-slate-400 sm:text-sm">
          Complete onboarding in 2 minutes, get your personalized AI career roadmap,
          and discover peer builders matched to your goals.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/profile"
                className="rounded-lg border border-slate-800 bg-slate-950 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                View Your Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Create Your Account
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-800 bg-slate-950 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
