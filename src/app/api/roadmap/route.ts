import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAiCareerRoadmap } from "@/lib/roadmap/server";
import type { RoadmapContext, CareerRoadmap, RoadmapApiResponse, RoadmapMilestone } from "@/types/roadmap";

export async function GET(): Promise<NextResponse<RoadmapApiResponse>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to view your career roadmap." },
        { status: 401 }
      );
    }

    // Fetch existing roadmap record from Supabase career_roadmaps table
    const { data: record, error: dbError } = await supabase
      .from("career_roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbError) {
      console.error("Error fetching career roadmap:", dbError);
      return NextResponse.json(
        { success: false, error: "Database error retrieving roadmap." },
        { status: 500 }
      );
    }

    if (!record) {
      return NextResponse.json({
        success: true,
        roadmap: undefined,
      });
    }

    let parsedAction = record.next_action || "Continue progressing through your high-priority milestones.";
    let nextSkills: string[] = [];
    let milestones: RoadmapMilestone[] = [];

    if (record.next_action && record.next_action.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(record.next_action);
        if (parsed.action) parsedAction = parsed.action;
        if (Array.isArray(parsed.next_skills)) nextSkills = parsed.next_skills;
        if (Array.isArray(parsed.milestones)) milestones = parsed.milestones;
      } catch (e) {
        // Plain text fallback
      }
    }

    const roadmap: CareerRoadmap = {
      target_career: record.target_career || "Career Specialist",
      current_stage: record.current_stage || "Early Progression",
      next_skills: nextSkills,
      milestones: milestones,
      next_action: parsedAction,
    };

    return NextResponse.json({
      success: true,
      roadmap,
      id: record.id,
      updatedAt: record.updated_at || record.created_at,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(): Promise<NextResponse<RoadmapApiResponse>> {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to generate a roadmap." },
        { status: 401 }
      );
    }

    // 2. Fetch user's profile and onboarding details
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.full_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Incomplete profile. Please complete onboarding first.",
          code: "PROFILE_INCOMPLETE",
        },
        { status: 400 }
      );
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
      .eq("user_id", user.id);

    // 3. Assemble RoadmapContext
    const context: RoadmapContext = {
      userId: user.id,
      fullName: profile.full_name,
      careerDomain: profile.career_domain || "General Innovation",
      education: profile.education || null,
      bio: profile.bio || null,
      primaryGoal: profile.primary_goal || null,
      secondaryGoal: profile.secondary_goal || null,
      tertiaryGoal: profile.tertiary_goal || null,
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
        tags: p.technologies || [],
      })),
    };

    // 4. Generate AI Career Roadmap via Gemini server service
    const roadmap = await generateAiCareerRoadmap(context);

    // 5. Save/update to existing Supabase career_roadmaps table
    // live columns: id, user_id, target_career, current_stage, next_action, created_at, updated_at
    const now = new Date().toISOString();

    const storedNextAction = JSON.stringify({
      action: roadmap.next_action,
      next_skills: roadmap.next_skills,
      milestones: roadmap.milestones,
    });

    const { data: existing } = await supabase
      .from("career_roadmaps")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let recordId: string;

    if (existing) {
      const { data: updated, error: updateErr } = await supabase
        .from("career_roadmaps")
        .update({
          target_career: roadmap.target_career,
          current_stage: roadmap.current_stage,
          next_action: storedNextAction,
          updated_at: now,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateErr) {
        console.error("Error updating career roadmap:", updateErr);
        throw new Error("Failed to save updated roadmap to database.");
      }
      recordId = updated.id;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("career_roadmaps")
        .insert({
          user_id: user.id,
          target_career: roadmap.target_career,
          current_stage: roadmap.current_stage,
          next_action: storedNextAction,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Error inserting career roadmap:", insertErr);
        throw new Error("Failed to save new roadmap to database.");
      }
      recordId = inserted.id;
    }

    return NextResponse.json({
      success: true,
      roadmap,
      id: recordId,
      updatedAt: now,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
