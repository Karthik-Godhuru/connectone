import { createClient } from "@/lib/supabase/server";
import {
  calculateCompatibilityScore,
  generateMatchExplanation,
} from "./engine";
import type {
  CandidateProfile,
  MatchRecommendation,
  MatchingFilterOptions,
} from "@/types/matching";

/**
 * Retrieves the full candidate profile for a given user ID
 */
export async function getCandidateProfile(
  userId: string
): Promise<CandidateProfile | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || !profile.full_name) {
    return null;
  }

  const { data: userSkills } = await supabase
    .from("user_skills")
    .select("level, skills(name, category)")
    .eq("user_id", userId);

  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interests(name, category)")
    .eq("user_id", userId);

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId);

  return {
    userId: profile.id,
    fullName: profile.full_name,
    email: null,
    careerDomain: profile.career_domain || "General",
    education: profile.education,
    bio: profile.bio,
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
    primaryGoal: profile.primary_goal,
    secondaryGoal: profile.secondary_goal,
    tertiaryGoal: profile.tertiary_goal,
  };
}

/**
 * Generates and stores recommendations for the authenticated user
 */
export async function getMatchRecommendations(
  currentUserId: string,
  options: MatchingFilterOptions = {}
): Promise<{
  matches: MatchRecommendation[];
  total: number;
  page: number;
  limit: number;
}> {
  const supabase = await createClient();

  // 1. Fetch current user profile
  const currentUser = await getCandidateProfile(currentUserId);
  if (!currentUser) {
    return { matches: [], total: 0, page: 1, limit: 20 };
  }

  // 2. Fetch existing connections for the current user (column is sender_id)
  const { data: existingConnections } = await supabase
    .from("connections")
    .select("*")
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

  const connectionStatusMap = new Map<string, "pending" | "received" | "accepted" | "declined">();
  const declinedUserIds = new Set<string>();

  (existingConnections || []).forEach((conn) => {
    const isOutgoing = conn.sender_id === currentUserId;
    const otherId = isOutgoing ? conn.receiver_id : conn.sender_id;
    if (conn.status === "pending") {
      connectionStatusMap.set(otherId, isOutgoing ? "pending" : "received");
    } else {
      connectionStatusMap.set(otherId, conn.status as any);
    }
    if (conn.status === "declined") {
      declinedUserIds.add(otherId);
    }
  });

  // 3. Fetch other profiles (excluding current user and declined users)
  const { data: otherProfiles } = await supabase
    .from("profiles")
    .select("id")
    .neq("id", currentUserId);

  if (!otherProfiles || otherProfiles.length === 0) {
    return { matches: [], total: 0, page: 1, limit: 20 };
  }

  // 4. Assemble candidates and compute compatibility
  const candidatePromises = otherProfiles
    .filter((p) => !declinedUserIds.has(p.id))
    .map(async (p) => {
      const candidate = await getCandidateProfile(p.id);
      if (!candidate) return null;

      candidate.connectionStatus = connectionStatusMap.get(candidate.userId) || "none";

      const calculation = calculateCompatibilityScore(currentUser, candidate);
      const explanation = generateMatchExplanation(
        calculation.score,
        currentUser,
        candidate,
        calculation.complementarySkillPairs,
        calculation.sharedInterests,
        calculation.sharedSkills
      );

      return {
        userId: currentUserId,
        candidate,
        compatibilityScore: calculation.score,
        explanation,
        breakdown: calculation.breakdown,
        sharedInterests: calculation.sharedInterests,
        sharedSkills: calculation.sharedSkills,
        complementarySkillPairs: calculation.complementarySkillPairs,
      } as MatchRecommendation;
    });

  const allRecommendations = (await Promise.all(candidatePromises)).filter(
    (item): item is MatchRecommendation => item !== null
  );

  // 5. Store / Upsert generated matches into `matches` table to avoid duplicates
  // matches schema: id, user_id, matched_user_id, score, created_at
  try {
    for (const match of allRecommendations) {
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("matched_user_id", match.candidate.userId)
        .maybeSingle();

      if (existingMatch) {
        await supabase
          .from("matches")
          .update({
            score: match.compatibilityScore,
          })
          .eq("id", existingMatch.id);
      } else {
        await supabase.from("matches").insert({
          user_id: currentUserId,
          matched_user_id: match.candidate.userId,
          score: match.compatibilityScore,
        });
      }
    }
  } catch (err) {
    console.warn("Notice: Match persistence in matches table:", err);
  }

  // 6. Sort by compatibility score descending
  let filtered = allRecommendations.sort(
    (a, b) => b.compatibilityScore - a.compatibilityScore
  );

  // 7. Apply optional filters
  if (options.careerDomain && options.careerDomain !== "All") {
    filtered = filtered.filter(
      (m) =>
        m.candidate.careerDomain.toLowerCase() ===
        options.careerDomain?.toLowerCase()
    );
  }

  if (options.minScore && options.minScore > 0) {
    filtered = filtered.filter((m) => m.compatibilityScore >= options.minScore!);
  }

  if (options.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.candidate.fullName.toLowerCase().includes(q) ||
        m.candidate.careerDomain.toLowerCase().includes(q) ||
        m.candidate.skills.some((s) => s.name.toLowerCase().includes(q)) ||
        m.candidate.interests.some((i) => i.name.toLowerCase().includes(q))
    );
  }

  // 8. Pagination
  const page = options.page || 1;
  const limit = options.limit || 20;
  const startIndex = (page - 1) * limit;
  const paginatedMatches = filtered.slice(startIndex, startIndex + limit);

  return {
    matches: paginatedMatches,
    total: filtered.length,
    page,
    limit,
  };
}
