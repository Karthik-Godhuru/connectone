import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeUserProfile } from "@/lib/gemini/server";
import type { UserProfileContext, IntelligenceApiResponse } from "@/types/intelligence";

export async function POST(): Promise<NextResponse<IntelligenceApiResponse>> {
  try {
    const supabase = await createClient();

    // 1. Enforce authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. You must be signed in to analyze your profile.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // 2. Fetch authenticated user's onboarding data from Supabase
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr || !profile || !profile.full_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found or onboarding incomplete. Please finish onboarding first.",
          code: "PROFILE_INCOMPLETE",
        },
        { status: 400 }
      );
    }

    // Fetch user skills
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("level, skills(name, category)")
      .eq("user_id", user.id);

    // Fetch user interests
    const { data: userInterests } = await supabase
      .from("user_interests")
      .select("interests(name, category)")
      .eq("user_id", user.id);

    // Fetch user projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id);

    // Assemble UserProfileContext
    const context: UserProfileContext = {
      userId: user.id,
      fullName: profile.full_name,
      email: user.email || null,
      education: profile.education || null,
      careerDomain: profile.career_domain || "General",
      bio: profile.bio || null,
      skills: (userSkills || []).map((us: any) => ({
        name: us.skills?.name ?? "Skill",
        proficiencyLevel: us.level ?? null,
        category: us.skills?.category ?? null,
      })),
      interests: (userInterests || []).map((ui: any) => ({
        name: ui.interests?.name ?? "Interest",
        category: ui.interests?.category ?? null,
      })),
      projects: (projects || []).map((p: any) => ({
        title: p.title,
        description: p.description,
        repoUrl: null,
        demoUrl: null,
        tags: p.technologies || [],
      })),
      primaryGoal: profile.primary_goal || null,
      secondaryGoal: profile.secondary_goal || null,
      tertiaryGoal: profile.tertiary_goal || null,
    };

    // 3. Execute server-side Gemini analysis
    const analysis = await analyzeUserProfile(context);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze profile with Gemini";

    return NextResponse.json(
      {
        success: false,
        error: message,
        code: "ANALYSIS_FAILED",
      },
      { status: 500 }
    );
  }
}
