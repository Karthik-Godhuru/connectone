import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const geminiKey = process.env.GEMINI_API_KEY || "";

  const isUrlConfigured = Boolean(supabaseUrl) && !supabaseUrl.includes("placeholder-project.supabase.co");
  const isAnonConfigured = Boolean(supabaseAnon) && !supabaseAnon.includes("placeholder");
  const isServiceRoleConfigured = Boolean(serviceRole) && !serviceRole.includes("placeholder");
  const isGeminiConfigured = Boolean(geminiKey) && !geminiKey.includes("placeholder");

  const isDatabaseReady = isUrlConfigured && isAnonConfigured;

  return NextResponse.json({
    status: isDatabaseReady ? "ok" : "warning",
    application: "ConnectOne",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    framework: {
      name: "Next.js",
      router: "App Router",
      nodeVersion: process.version,
    },
    configuration: {
      supabasePublicUrlConfigured: isUrlConfigured,
      supabasePublicAnonKeyConfigured: isAnonConfigured,
      supabaseServiceRoleConfigured: isServiceRoleConfigured,
      geminiKeyConfigured: isGeminiConfigured,
      isDatabaseLive: isDatabaseReady,
      note: isDatabaseReady
        ? "All credentials are configured."
        : "Supabase environment variables in .env.local are currently using default placeholders. Configure active project credentials to enable database connectivity.",
    },
    databaseSchema: {
      expectedTablesCount: 9,
      tables: [
        "profiles",
        "skills",
        "user_skills",
        "interests",
        "user_interests",
        "projects",
        "connections",
        "matches",
        "career_roadmaps",
      ],
    },
  });
}
