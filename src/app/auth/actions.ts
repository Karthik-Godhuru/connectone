"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionResult {
  error?: string;
  success?: boolean;
  message?: string;
  requiresEmailVerification?: boolean;
}

function validateSupabaseConfig(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return "Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured in .env.local.";
  }

  if (
    supabaseUrl.includes("placeholder-project.supabase.co") ||
    supabaseAnonKey.includes("placeholder")
  ) {
    return "Supabase credentials are not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local are currently using default placeholders. Please update .env.local with your active Supabase project URL and anon key.";
  }

  return null;
}

function handleAuthError(error: { message: string; name?: string; status?: number }): string {
  if (
    error.message === "fetch failed" ||
    error.name === "AuthRetryableFetchError" ||
    error.message.includes("ENOTFOUND") ||
    error.message.includes("Failed to fetch")
  ) {
    return "Unable to connect to Supabase authentication server (fetch failed). Please verify that your NEXT_PUBLIC_SUPABASE_URL is reachable and that your network connection is active.";
  }
  if (
    error.message.includes("rate limit") ||
    error.message.includes("over_email_send_rate_limit") ||
    error.status === 429
  ) {
    return "Supabase email rate limit reached (free tier allows limited confirmation emails per hour). To enable instant signups without email delays during development, open Supabase Dashboard -> Authentication -> Providers -> Email, and disable 'Confirm email'.";
  }
  if (error.message.includes("is invalid")) {
    return "Please enter a valid personal or organizational email address (e.g. name@gmail.com, name@outlook.com). Supabase blocks test domains like example.com.";
  }
  return error.message;
}

export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const configError = validateSupabaseConfig();
  if (configError) {
    return { error: configError };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database configuration error";
    return { error: errorMsg };
  }

  let data, error;
  try {
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    data = res.data;
    error = res.error;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication request failed";
    return { error: handleAuthError({ message }) };
  }

  if (error) {
    return { error: handleAuthError(error) };
  }

  if (!data.user) {
    return { error: "Authentication failed. User session not found." };
  }

  // Check if profile exists and has been onboarded
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, career_domain")
      .eq("id", data.user.id)
      .maybeSingle();

    revalidatePath("/", "layout");

    // If profile doesn't exist or hasn't finished onboarding, route to /onboarding
    if (!profile || !profile.full_name) {
      redirect("/onboarding");
    }
  } catch (err) {
    // If NEXT_REDIRECT was thrown by redirect(), rethrow it
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    // Fallback if table query has issues: redirect to onboarding to ensure profile is saved
    redirect("/onboarding");
  }

  redirect(redirectTo);
}

export async function signupAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName) {
    return { error: "Full name is required." };
  }
  if (!email || !email.includes("@")) {
    return { error: "A valid email address is required." };
  }
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const configError = validateSupabaseConfig();
  if (configError) {
    return { error: configError };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database configuration error";
    return { error: errorMsg };
  }

  let data, error;
  try {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    data = res.data;
    error = res.error;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication request failed";
    return { error: handleAuthError({ message }) };
  }

  if (error) {
    return { error: handleAuthError(error) };
  }

  // If user session is created immediately (no confirmation needed)
  if (data?.session && data?.user) {
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  // If Supabase project requires email confirmation
  return {
    success: true,
    requiresEmailVerification: true,
    message: `Account created! We sent a confirmation link to ${email}. Please check your inbox to verify your email and complete onboarding.`,
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
