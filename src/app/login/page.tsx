"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/auth/actions";
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const [state, formAction, isPending] = useActionState(loginAction, null);

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
            <span className="editorial-kicker text-[#D5B38B]">Authentication</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#DBD3C1]">
              Welcome back
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#DBD3C1]/75 leading-relaxed">
              Sign in to access your hackathon team, projects, and career roadmaps
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

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="redirect" value={redirectTarget} />

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]"
              >
                Email Address
              </label>
              <div className="relative mt-2">
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]"
                >
                  Password
                </label>
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="glass-button-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-xl shadow-[#9E532D]/25 transition-all hover:shadow-[#9E532D]/35 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#D5B38B]" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#DBD3C1]/10 pt-6 text-center text-xs text-[#8FAAB5]">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#D5B38B] transition hover:text-[#E4C8A6] hover:underline"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D5B38B]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
