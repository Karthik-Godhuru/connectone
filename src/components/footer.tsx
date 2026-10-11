import Link from "next/link";
import { Sparkles, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-10 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-200">ConnectOne</span>
            <span className="text-xs text-slate-500">· Hackathon 2026 Edition</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/status" className="transition hover:text-white">
              Health Status
            </Link>
            <a
              href="https://github.com/Karthik-Godhuru/connectone"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub
            </a>
            <span className="flex items-center gap-1 text-slate-500">
              <Terminal className="h-3 w-3" />
              Next.js 16 App Router
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 text-center text-xs text-slate-600">
          Built for seamless developer collaboration and career growth. Connected to Supabase & Gemini AI.
        </div>
      </div>
    </footer>
  );
}
