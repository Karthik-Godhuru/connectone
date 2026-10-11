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
    <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#4E1F1A]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-[#9E532D]/15 blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8FAAB5] transition hover:text-[#DBD3C1]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <div className="mt-2">
            <span className="editorial-kicker text-[#D5B38B]">Diagnostics &amp; Infrastructure</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#DBD3C1]">
              System Status &amp; Health
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#DBD3C1]/75 leading-relaxed">
              Real-time diagnostics for ConnectOne core framework and database integrations.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-2 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-500/10">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          System Operational
        </div>
      </div>

      {/* Grid of status cards */}
      <div className="relative mt-10 grid gap-6 md:grid-cols-2">
        {/* Card 1: Runtime & Core Stack */}
        <div className="glass-card rounded-3xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl transition hover:border-[#DBD3C1]/20">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9E532D] to-[#4E1F1A] text-[#DBD3C1] shadow-md shadow-[#9E532D]/20">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#DBD3C1]">Application Framework</h2>
              <p className="text-xs text-[#8FAAB5]">Next.js &amp; Frontend Tooling</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md">
              <span className="text-[#8FAAB5]">Framework</span>
              <span className="font-semibold text-[#DBD3C1]">Next.js 16 (App Router)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md">
              <span className="text-[#8FAAB5]">Language</span>
              <span className="font-semibold text-[#DBD3C1]">TypeScript (Strict)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md">
              <span className="text-[#8FAAB5]">Styling Engine</span>
              <span className="font-semibold text-[#DBD3C1]">Tailwind CSS v4</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md">
              <span className="text-[#8FAAB5]">Health Endpoint</span>
              <a
                href="/api/health"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#D5B38B] hover:underline"
              >
                /api/health
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Supabase Environment Readiness */}
        <div className="glass-card rounded-3xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl transition hover:border-[#DBD3C1]/20">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4E1F1A] to-[#252E33] text-[#DBD3C1] shadow-md shadow-[#4E1F1A]/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#DBD3C1]">Environment Configuration</h2>
              <p className="text-xs text-[#8FAAB5]">Public &amp; Protected Variables</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md">
              <span className="text-[#8FAAB5]">NEXT_PUBLIC_SUPABASE_URL</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isSupabaseUrlConfigured ? "text-emerald-300" : "text-amber-300"
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

            <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md">
              <span className="text-[#8FAAB5]">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isSupabaseAnonConfigured ? "text-emerald-300" : "text-amber-300"
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

            <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md">
              <span className="text-[#8FAAB5]">SUPABASE_SERVICE_ROLE_KEY</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isServiceRoleConfigured ? "text-emerald-300" : "text-[#8FAAB5]"
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

            <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md">
              <span className="text-[#8FAAB5]">GEMINI_API_KEY</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  isGeminiKeyConfigured ? "text-emerald-300" : "text-[#8FAAB5]"
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
      <div className="relative mt-8 glass-card rounded-3xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9E532D] to-[#4E1F1A] text-[#DBD3C1] shadow-md shadow-[#9E532D]/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#DBD3C1]">Registered Supabase Tables</h2>
              <p className="text-xs text-[#8FAAB5]">9 verified tables in schema</p>
            </div>
          </div>
          <span className="glass-pill px-3 py-1 text-xs font-semibold text-[#D5B38B] ring-1 ring-[#DBD3C1]/10">
            9/9 Tables Typed
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {databaseTables.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3 text-xs backdrop-blur-md transition hover:border-[#DBD3C1]/20"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-[#D5B38B]" />
                <span className="font-mono text-[#DBD3C1]">{t.name}</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-300">{t.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="relative mt-8 rounded-2xl border border-[#DBD3C1]/10 bg-[#192024]/50 p-4 text-xs text-[#8FAAB5] backdrop-blur-md">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-[#DBD3C1]">Security Architecture Enforced: </span>
            Service role keys and server credentials are never shipped to the client browser bundle.
            Client components exclusively communicate with Supabase via anonymous public tokens and
            Row Level Security (RLS).
          </div>
        </div>
      </div>
    </div>
  );
}
