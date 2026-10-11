import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRecommendedOpportunities, type OpportunityUserContext } from "@/lib/opportunities/engine";
import type { OpportunityCategory, OpportunitiesApiResponse } from "@/types/opportunities";

export async function GET(
  request: NextRequest
): Promise<NextResponse<OpportunitiesApiResponse>> {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to discover opportunities." },
        { status: 401 }
      );
    }

    // 2. Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found. Please complete onboarding first." },
        { status: 400 }
      );
    }

    // 3. Fetch user skills and interests
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("level, skills(name)")
      .eq("user_id", user.id);

    const { data: userInterests } = await supabase
      .from("user_interests")
      .select("interests(name)")
      .eq("user_id", user.id);

    // 4. Fetch roadmap if available to extract current stage
    const { data: roadmapRecord } = await supabase
      .from("career_roadmaps")
      .select("current_stage")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentStage = roadmapRecord?.current_stage || "Early Progression";

    // 5. Parse query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as OpportunityCategory | "All" | null;
    const domain = searchParams.get("domain") || undefined;
    const search = searchParams.get("search") || undefined;
    const minScore = searchParams.get("minScore")
      ? Number(searchParams.get("minScore"))
      : undefined;

    const userContext: OpportunityUserContext = {
      careerDomain: profile.career_domain || "General Innovation",
      primaryGoal: profile.primary_goal,
      skills: (userSkills || []).map((us: any) => ({
        name: us.skills?.name ?? "Skill",
        proficiencyLevel: us.level,
      })),
      interests: (userInterests || []).map((ui: any) => ({
        name: ui.interests?.name ?? "Interest",
      })),
      currentStage,
    };

    const opportunities = getRecommendedOpportunities(userContext, {
      category: category || "All",
      domain: domain === "All" ? undefined : domain,
      search,
      minScore,
    });

    return NextResponse.json({
      success: true,
      opportunities,
      total: opportunities.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
