"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  User,
  Users,
  Compass,
  Award,
  UserCheck,
  Activity,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface NavbarProps {
  user?: { id: string; email?: string | null } | null;
}

export function Navbar({ user = null }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
              C1
            </div>
            <span className="text-sm font-bold tracking-tight text-white">ConnectOne</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex lg:items-center lg:gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs font-medium text-slate-300 transition hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/discover"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                <Users className="h-3.5 w-3.5 text-slate-400" />
                Discover
              </Link>
              <Link
                href="/roadmap"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                <Compass className="h-3.5 w-3.5 text-slate-400" />
                Roadmap
              </Link>
              <Link
                href="/opportunities"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                <Award className="h-3.5 w-3.5 text-slate-400" />
                Opportunities
              </Link>
              <Link
                href="/connections"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                Connections
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/discover"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                <Users className="h-3.5 w-3.5 text-slate-400" />
                Discover
              </Link>
              <Link
                href="/opportunities"
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                <Award className="h-3.5 w-3.5 text-slate-400" />
                Opportunities
              </Link>
            </>
          )}

          <Link
            href="/status"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-300"
          >
            <Activity className="h-3 w-3 text-emerald-400" />
            Status
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <a
            href="https://github.com/Karthik-Godhuru/connectone"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <User className="h-3 w-3 text-slate-400" />
                <span className="max-w-[120px] truncate">
                  {user.email ? user.email.split("@")[0] : "Profile"}
                </span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-rose-950/30 hover:border-rose-900/50 hover:text-rose-300"
                  title="Sign Out"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/discover"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <Users className="h-4 w-4 text-slate-400" />
                  Discover Teammates
                </Link>
                <Link
                  href="/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <Compass className="h-4 w-4 text-slate-400" />
                  Career Roadmap
                </Link>
                <Link
                  href="/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <Award className="h-4 w-4 text-slate-400" />
                  Opportunities
                </Link>
                <Link
                  href="/connections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  Connections
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  My Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/discover"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <Users className="h-4 w-4 text-slate-400" />
                  Discover Teammates
                </Link>
                <Link
                  href="/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <Award className="h-4 w-4 text-slate-400" />
                  Opportunities
                </Link>
              </>
            )}

            <Link
              href="/status"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900"
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              System Status
            </Link>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              {user ? (
                <form action={signOutAction} className="w-full">
                  <button
                    type="submit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 py-2 text-xs font-medium text-slate-400 hover:text-rose-400"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center rounded-lg border border-slate-800 bg-slate-900 py-2 text-xs font-medium text-slate-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center rounded-lg bg-blue-600 py-2 text-xs font-medium text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
