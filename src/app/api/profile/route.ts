import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found." }, { status: 404 });
    }

    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("level, skills(name, category)")
      .eq("user_id", user.id);

    const { data: userInterests } = await supabase
      .from("user_interests")
      .select("interests(name, category)")
      .eq("user_id", user.id);

    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: user.email ?? null,
      },
      skills: (userSkills || []).map((us: any) => ({
        ...us,
        proficiency_level: us.level,
      })),
      interests: userInterests || [],
      projects: projects || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      bio,
      education,
      career_domain,
      primary_goal,
      secondary_goal,
      tertiary_goal,
    } = body;

    const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
      updated_at: new Date().toISOString(),
    };

    if (typeof full_name === "string" && full_name.trim()) updates.full_name = full_name.trim();
    if (typeof bio === "string") updates.bio = bio.trim();
    if (typeof education === "string") updates.education = education.trim();
    if (typeof career_domain === "string" && career_domain.trim()) updates.career_domain = career_domain.trim();
    if (typeof primary_goal === "string") updates.primary_goal = primary_goal.trim();
    if (typeof secondary_goal === "string") updates.secondary_goal = secondary_goal.trim();
    if (typeof tertiary_goal === "string") updates.tertiary_goal = tertiary_goal.trim();

    const { data: updatedProfile, error: updateErr } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateErr) {
      console.error("Error updating profile:", updateErr);
      return NextResponse.json({ success: false, error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...updatedProfile,
        email: user.email ?? null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
