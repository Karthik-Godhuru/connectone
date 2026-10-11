import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { milestoneIndex, completed } = body;

    if (typeof milestoneIndex !== "number" || typeof completed !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid parameters. milestoneIndex and completed are required." },
        { status: 400 }
      );
    }

    const { data: record, error: fetchErr } = await supabase
      .from("career_roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr || !record) {
      return NextResponse.json(
        { success: false, error: "Roadmap not found." },
        { status: 404 }
      );
    }

    let parsedAction = record.next_action || "";
    let nextSkills: string[] = [];
    let milestones: any[] = [];

    if (record.next_action && record.next_action.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(record.next_action);
        if (parsed.action) parsedAction = parsed.action;
        if (Array.isArray(parsed.next_skills)) nextSkills = parsed.next_skills;
        if (Array.isArray(parsed.milestones)) milestones = parsed.milestones;
      } catch (e) {
        // Fallback
      }
    }

    if (milestoneIndex >= 0 && milestoneIndex < milestones.length) {
      milestones[milestoneIndex] = {
        ...milestones[milestoneIndex],
        completed,
      };
    }

    const updatedNextAction = JSON.stringify({
      action: parsedAction,
      next_skills: nextSkills,
      milestones,
    });

    const { error: updateErr } = await supabase
      .from("career_roadmaps")
      .update({
        next_action: updatedNextAction,
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: "Failed to update milestone." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      milestones,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
