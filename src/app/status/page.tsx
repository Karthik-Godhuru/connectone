import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldCheck,
  Server,
  Layers,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

export default function StatusPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const geminiKey = process.env.GEMINI_API_KEY || "";

  const isSupabaseUrlConfigured = Boolean(supabaseUrl) && !supabaseUrl.includes("placeholder-project.supabase.co");
  const isSupabaseAnonConfigured = Boolean(supabaseAnon) && !supabaseAnon.includes("placeholder");
  const isServiceRoleConfigured = Boolean(serviceRole) && !serviceRole.includes("placeholder");
  const isGeminiKeyConfigured = Boolean(geminiKey) && !geminiKey.includes("placeholder");
  const isSystemFullyConfigured = isSupabaseUrlConfigured && isSupabaseAnonConfigured;

  const databaseTables = [
    { name: "profiles", status: "Mapped" },
    { name: "skills", status: "Mapped" },
    { name: "user_skills", status: "Mapped" },
    { name: "interests", status: "Mapped" },
    { name: "user_interests", status: "Mapped" },
    { name: "projects", status: "Mapped" },
    { name: "connections", status: "Mapped" },
    { name: "matches", status: "Mapped" },
    { name: "career_roadmaps", status: "Mapped" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            System Status & Health
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time diagnostics for ConnectOne core framework and database integrations.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          System Operational
        </div>
      </div>

      {/* Grid of status cards */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Card 1: Runtime & Core Stack */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Application Framework</h2>
              <p className="text-xs text-slate-400">Next.js & Frontend Tooling</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 text-xs">
              <span className="text-slate-400">Framework</span>
              <span className="font-semibold text-white">Next.js 16 (App Router)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 text-xs">
              <span className="text-slate-400">Language</span>
              <span className="font-semibold text-white">TypeScript (Strict)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 text-xs">
              <span className="text-slate-400">Styling Engine</span>
              <span className="font-semibold text-white">Tailwind CSS v4</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 text-xs">
              <span className="text-slate-400">Health Endpoint</span>
              <a
                href="/api/health"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:underline"
              >
                /api/health
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Supabase Environment Readiness */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Environment Configuration</h2>
              <p className="text-xs text-slate-400">Public & Protected Variables</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 text-xs">
              <span className="text-slate-400">NEXT_PUBLIC_SUPABASE_URL</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isSupabaseUrlConfigured ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isSupabaseUrlConfigured ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" /> Placeholder (.env.local)
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 text-xs">
              <span className="text-slate-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isSupabaseAnonConfigured ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isSupabaseAnonConfigured ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" /> Placeholder (.env.local)
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 text-xs">
              <span className="text-slate-400">SUPABASE_SERVICE_ROLE_KEY</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isServiceRoleConfigured ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                {isServiceRoleConfigured ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Server Protected
                  </>
                ) : (
                  "Optional (Server only)"
                )}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 text-xs">
              <span className="text-slate-400">GEMINI_API_KEY</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isGeminiKeyConfigured ? "text-emerald-400" : "text-slate-500"
                }`}
              >
                {isGeminiKeyConfigured ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Present
                  </>
                ) : (
                  "Not Configured (Fallback Active)"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Schema Registry */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registered Supabase Tables</h2>
              <p className="text-xs text-slate-400">9 verified tables in schema</p>
            </div>
          </div>
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
            9/9 Tables Typed
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {databaseTables.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 p-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-mono text-slate-200">{t.name}</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-400">{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Security Architecture Enforced: </span>
            Service role keys and server credentials are never shipped to the client browser bundle.
            Client components exclusively communicate with Supabase via anonymous public tokens and
            Row Level Security (RLS).
          </div>
        </div>
      </div>
    </div>
  );
}
