"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SkillItem {
  name: string;
  proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category?: string;
}

export interface InterestItem {
  name: string;
  category?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  repoUrl?: string;
  demoUrl?: string;
  tags?: string[];
}

export interface OnboardingPayload {
  // Personal & Professional
  fullName: string;
  dateOfBirth: string;
  education: string;
  careerDomain: string;
  bio: string;

  // Taxonomy
  skills: SkillItem[];
  interests: InterestItem[];

  // Portfolio
  projects: ProjectItem[];

  // Goals
  primaryGoal: string;
  secondaryGoal: string;
  tertiaryGoal: string;
}

export interface OnboardingActionResult {
  error?: string;
  success?: boolean;
}

/**
 * AI Analysis Architecture Hook
 * Prepares user payload for future Gemini embedding & analysis.
 */
async function prepareAiProfileAnalysis(userId: string, payload: OnboardingPayload) {
  return {
    userId,
    preparedAt: new Date().toISOString(),
    aiReady: true,
    summary: `${payload.fullName} - ${payload.careerDomain}`,
  };
}

export async function submitOnboardingAction(
  payload: OnboardingPayload
): Promise<OnboardingActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required. Please sign in again." };
  }

  if (!payload.fullName.trim()) {
    return { error: "Full name is required." };
  }
  if (!payload.careerDomain.trim()) {
    return { error: "Career domain is required." };
  }

  // 1. Save into profiles table
  // NOTE: In the live database schema, email belongs to auth.users and is NOT a column in profiles.
  // The profiles table has: id, full_name, bio, avatar_url, date_of_birth, education, career_domain,
  // primary_goal, secondary_goal, tertiary_goal, created_at, updated_at.
  try {
    const profileData = {
      id: user.id,
      full_name: payload.fullName.trim(),
      bio: payload.bio.trim(),
      date_of_birth: payload.dateOfBirth || null,
      education: payload.education || null,
      career_domain: payload.careerDomain,
      primary_goal: payload.primaryGoal || null,
      secondary_goal: payload.secondaryGoal || null,
      tertiary_goal: payload.tertiaryGoal || null,
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" });

    if (profileError) {
      console.error("Profile upsert error:", profileError.message);
      return { error: `Failed to save profile: ${profileError.message}` };
    }
  } catch (err) {
    return {
      error: `Profile save error: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }

  // 2. Save Skills and User_Skills
  // user_skills schema: id, user_id, skill_id, level, created_at
  try {
    for (const skill of payload.skills) {
      if (!skill.name.trim()) continue;

      const trimmedName = skill.name.trim();

      // Check if skill already exists in skills table
      let skillId: string | null = null;
      const { data: existingSkill } = await supabase
        .from("skills")
        .select("id")
        .ilike("name", trimmedName)
        .maybeSingle();

      if (existingSkill?.id) {
        skillId = existingSkill.id;
      } else {
        // Insert new skill into taxonomy if allowed
        const { data: newSkill, error: newSkillErr } = await supabase
          .from("skills")
          .insert({
            name: trimmedName,
            category: skill.category || payload.careerDomain,
          })
          .select("id")
          .maybeSingle();

        if (!newSkillErr && newSkill?.id) {
          skillId = newSkill.id;
        } else {
          // If insert failed (e.g. RLS or concurrent insert), re-query
          const { data: retrySkill } = await supabase
            .from("skills")
            .select("id")
            .ilike("name", trimmedName)
            .maybeSingle();
          if (retrySkill?.id) {
            skillId = retrySkill.id;
          }
        }
      }

      // Link in user_skills (column is 'level', not 'proficiency_level')
      if (skillId) {
        const { error: usError } = await supabase.from("user_skills").upsert(
          {
            user_id: user.id,
            skill_id: skillId,
            level: skill.proficiencyLevel,
          },
          { onConflict: "user_id,skill_id" }
        );
        if (usError) {
          console.warn("user_skills upsert warning:", usError.message);
        }
      }
    }
  } catch (err) {
    console.error("Warning: user_skills update error:", err);
  }

  // 3. Save Interests and User_Interests
  // user_interests schema: id, user_id, interest_id, created_at
  try {
    for (const interest of payload.interests) {
      if (!interest.name.trim()) continue;

      const trimmedName = interest.name.trim();

      let interestId: string | null = null;
      const { data: existingInterest } = await supabase
        .from("interests")
        .select("id")
        .ilike("name", trimmedName)
        .maybeSingle();

      if (existingInterest?.id) {
        interestId = existingInterest.id;
      } else {
        const { data: newInterest, error: newIntErr } = await supabase
          .from("interests")
          .insert({
            name: trimmedName,
            category: interest.category || "General",
          })
          .select("id")
          .maybeSingle();

        if (!newIntErr && newInterest?.id) {
          interestId = newInterest.id;
        } else {
          const { data: retryInterest } = await supabase
            .from("interests")
            .select("id")
            .ilike("name", trimmedName)
            .maybeSingle();
          if (retryInterest?.id) {
            interestId = retryInterest.id;
          }
        }
      }

      if (interestId) {
        const { error: uiError } = await supabase.from("user_interests").upsert(
          {
            user_id: user.id,
            interest_id: interestId,
          },
          { onConflict: "user_id,interest_id" }
        );
        if (uiError) {
          console.warn("user_interests upsert warning:", uiError.message);
        }
      }
    }
  } catch (err) {
    console.error("Warning: user_interests update error:", err);
  }

  // 4. Save Projects
  // projects schema: id, user_id, title, description, technologies, status, created_at, updated_at
  try {
    for (const proj of payload.projects) {
      if (!proj.title.trim()) continue;

      let description = proj.description.trim();
      const links: string[] = [];
      if (proj.repoUrl?.trim()) links.push(`Repository: ${proj.repoUrl.trim()}`);
      if (proj.demoUrl?.trim()) links.push(`Demo: ${proj.demoUrl.trim()}`);
      if (links.length > 0) {
        description = description ? `${description}\n\n${links.join(" | ")}` : links.join(" | ");
      }

      const { error: projError } = await supabase.from("projects").insert({
        user_id: user.id,
        title: proj.title.trim(),
        description: description || null,
        technologies: proj.tags || [],
        status: "active",
      });

      if (projError) {
        console.warn("projects insert warning:", projError.message);
      }
    }
  } catch (err) {
    console.error("Warning: projects insert error:", err);
  }

  // 5. Trigger AI Profile Analysis architecture hook
  await prepareAiProfileAnalysis(user.id, payload);

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { success: true };
}
