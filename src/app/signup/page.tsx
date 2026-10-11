"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/app/auth/actions";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#4E1F1A]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[#9E532D]/15 blur-3xl" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9E532D] via-[#4E1F1A] to-[#252E33] shadow-xl shadow-[#9E532D]/20 ring-1 ring-[#DBD3C1]/20 transition hover:scale-105"
          >
            <Sparkles className="h-7 w-7 text-[#D5B38B]" />
          </Link>
          <div className="mt-4">
            <span className="editorial-kicker text-[#D5B38B]">Join ConnectOne</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#DBD3C1]">
              Create your account
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#DBD3C1]/75 leading-relaxed">
              Join ConnectOne to discover teammates and build next-level projects
            </p>
          </div>
        </div>

        <div className="glass-panel relative rounded-3xl border border-[#DBD3C1]/15 bg-[#192024]/85 p-8 sm:p-9 shadow-2xl backdrop-blur-2xl">
          {state?.error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/25 p-4 text-xs text-rose-200 backdrop-blur-md shadow-lg">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {state?.success && state?.message && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-4 text-xs text-emerald-200 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{state.message}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]"
              >
                Full Name
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Karthik Godhuru"
                  className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]"
              >
                Email Address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="At least 6 characters"
                  className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]"
              >
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Repeat your password"
                  className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="glass-button-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-xl shadow-[#9E532D]/25 transition-all hover:shadow-[#9E532D]/35 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#D5B38B]" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Onboarding</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-[#DBD3C1]/10 pt-6 text-center text-xs text-[#8FAAB5]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#D5B38B] transition hover:text-[#E4C8A6] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
