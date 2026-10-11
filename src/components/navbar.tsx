"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Sparkles,
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
  const pathname = usePathname();

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: null },
        { href: "/discover", label: "Discover", icon: Users },
        { href: "/roadmap", label: "Roadmap", icon: Compass },
        { href: "/opportunities", label: "Opportunities", icon: Award },
        { href: "/connections", label: "Network", icon: UserCheck },
        { href: "/profile", label: "Profile", icon: User },
      ]
    : [
        { href: "/discover", label: "Discover", icon: Users },
        { href: "/opportunities", label: "Opportunities", icon: Award },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DBD3C1]/10 bg-[#192024]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5 transition">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E532D] via-[#4E1F1A] to-[#D5B38B] p-[1px] shadow-[0_0_16px_rgba(158,83,45,0.35)] transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#192024]/90 backdrop-blur-md">
                <span className="bg-gradient-to-r from-[#F4EFE6] to-[#D5B38B] bg-clip-text text-xs font-black tracking-tight text-transparent">
                  C1
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#DBD3C1]">
                Connect<span className="text-[#D5B38B]">One</span>
              </span>
              <span className="hidden text-[9px] font-medium uppercase tracking-[0.18em] text-[#8FAAB5]/80 sm:inline-block">
                AI Career Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex lg:items-center lg:gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#252E33]/80 text-[#F4EFE6] shadow-[inset_0_1px_0_0_rgba(213,179,139,0.2)] border border-[#D5B38B]/25"
                    : "text-[#8FAAB5] hover:bg-[#252E33]/40 hover:text-[#DBD3C1]"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive ? "text-[#D5B38B]" : "text-[#8FAAB5]/70"
                    }`}
                  />
                )}
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D5B38B] to-transparent" />
                )}
              </Link>
            );
          })}

          <div className="mx-2 h-3.5 w-[1px] bg-[#DBD3C1]/10" />

          <Link
            href="/status"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              pathname === "/status"
                ? "bg-[#252E33]/80 text-[#F4EFE6] border border-[#D5B38B]/25"
                : "text-[#8FAAB5] hover:bg-[#252E33]/40 hover:text-[#DBD3C1]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px]">Live</span>
          </Link>
        </nav>

        {/* Right CTA / Session actions */}
        <div className="hidden lg:flex lg:items-center lg:gap-2.5">
          <a
            href="https://github.com/Karthik-Godhuru/connectone"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="inline-flex items-center rounded-lg border border-[#DBD3C1]/10 bg-[#252E33]/40 p-1.5 text-[#8FAAB5] backdrop-blur-md transition hover:border-[#D5B38B]/30 hover:bg-[#252E33]/70 hover:text-[#DBD3C1]"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DBD3C1]/10 bg-[#252E33]/40 px-3 py-1.5 text-xs font-medium text-[#DBD3C1] backdrop-blur-md transition hover:border-[#D5B38B]/40 hover:bg-[#252E33]/70"
              >
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#9E532D]/25 text-[9px] font-bold text-[#D5B38B]">
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="max-w-[110px] truncate text-[11px]">
                  {user.email ? user.email.split("@")[0] : "Profile"}
                </span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#DBD3C1]/10 bg-[#252E33]/30 px-2.5 py-1.5 text-[11px] font-medium text-[#8FAAB5] transition hover:border-rose-500/40 hover:bg-rose-950/20 hover:text-rose-300"
                  title="Sign Out"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Exit</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-[#DBD3C1]/10 bg-[#252E33]/40 px-3 py-1.5 text-xs font-medium text-[#DBD3C1] backdrop-blur-md transition hover:border-[#D5B38B]/30 hover:bg-[#252E33]/70"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="glass-button-primary inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg border border-[#DBD3C1]/10 bg-[#252E33]/40 p-1.5 text-[#8FAAB5] hover:text-[#DBD3C1]"
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#DBD3C1]/10 bg-[#192024]/95 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "bg-[#252E33]/90 text-[#F4EFE6] border border-[#D5B38B]/25"
                      : "text-[#8FAAB5] hover:bg-[#252E33]/40 hover:text-[#DBD3C1]"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 text-[#D5B38B]" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <Link
              href="/status"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#8FAAB5] hover:bg-[#252E33]/40 hover:text-[#DBD3C1]"
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>System Status</span>
            </Link>

            <div className="mt-3 flex items-center gap-2 border-t border-[#DBD3C1]/10 pt-3">
              {user ? (
                <form action={signOutAction} className="w-full">
                  <button
                    type="submit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 py-2 text-xs font-medium text-rose-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              ) : (
                <div className="flex w-full gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-lg border border-[#DBD3C1]/10 bg-[#252E33]/40 py-2 text-center text-xs font-medium text-[#DBD3C1]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="glass-button-primary flex-1 rounded-lg py-2 text-center text-xs font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
