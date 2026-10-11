import Link from "next/link";
import { Sparkles, Terminal, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#DBD3C1]/10 bg-[#192024]/85 backdrop-blur-md py-12 text-[#8FAAB5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#9E532D]/20 via-[#4E1F1A]/20 to-[#D5B38B]/20 border border-[#DBD3C1]/10 text-[#D5B38B]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-semibold text-[#DBD3C1] text-xs">ConnectOne</span>
              <span className="ml-2 text-[10px] uppercase tracking-wider text-[#8FAAB5]/70 font-medium">
                AI Career Studio
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#8FAAB5]">
            <Link href="/discover" className="transition hover:text-[#DBD3C1]">
              Discover People
            </Link>
            <Link href="/opportunities" className="transition hover:text-[#DBD3C1]">
              Opportunities
            </Link>
            <Link href="/status" className="flex items-center gap-1.5 transition hover:text-[#DBD3C1]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Platform Health</span>
            </Link>
            <a
              href="https://github.com/Karthik-Godhuru/connectone"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[#DBD3C1]"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#DBD3C1]/08 pt-6 text-[11px] text-[#8FAAB5]/70 sm:flex-row">
          <p>
            Connected to Supabase PostgreSQL & Google Gemini API. Built for student builders and cross-functional creators.
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Terminal className="h-3 w-3 text-[#D5B38B]" />
              <span>Next.js 16 App Router</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>RLS Protected</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
