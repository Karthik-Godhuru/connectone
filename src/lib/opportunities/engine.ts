import type {
  Opportunity,
  OpportunityRecommendation,
  OpportunityCategory,
} from "@/types/opportunities";
import { SAMPLE_OPPORTUNITIES_CATALOG } from "./catalog";

export interface OpportunityUserContext {
  careerDomain: string;
  primaryGoal?: string | null;
  skills: Array<{ name: string; proficiencyLevel?: string | null }>;
  interests: Array<{ name: string }>;
  currentStage?: string;
}

export interface OpportunityFilterOptions {
  category?: OpportunityCategory | "All";
  domain?: string;
  search?: string;
  minScore?: number;
}

/**
 * Calculates a 0-100 compatibility score and generates explainable reasons
 * for an opportunity given a user's context.
 */
export function scoreOpportunity(
  opportunity: Opportunity,
  user: OpportunityUserContext
): OpportunityRecommendation {
  let score = 0;
  const matchReasons: string[] = [];
  const matchedSkills: string[] = [];

  const userDomain = (user.careerDomain || "").toLowerCase().trim();
  const userPrimaryGoal = (user.primaryGoal || "").toLowerCase().trim();

  const userSkillsSet = new Set(
    user.skills.map((s) => s.name.toLowerCase().trim()).filter(Boolean)
  );
  const userInterestsSet = new Set(
    user.interests.map((i) => i.name.toLowerCase().trim()).filter(Boolean)
  );

  // 1. Domain Compatibility (up to 35 pts)
  const isDirectDomain = opportunity.targetDomains.some(
    (d) => d.toLowerCase() === userDomain || userDomain.includes(d.toLowerCase())
  );
  const isPartialDomain = opportunity.targetDomains.some(
    (d) =>
      d.toLowerCase().includes(userDomain) ||
      userDomain.split("/").some((part) => d.toLowerCase().includes(part.trim()))
  );

  if (isDirectDomain) {
    score += 35;
    matchReasons.push(`Direct alignment with your active career domain (${user.careerDomain})`);
  } else if (isPartialDomain) {
    score += 25;
    matchReasons.push(`Relevant cross-disciplinary scope for ${user.careerDomain}`);
  } else {
    score += 10;
  }

  // 2. Target Skills Overlap (up to 30 pts)
  for (const skill of opportunity.targetSkills) {
    const sLower = skill.toLowerCase();
    const hasSkill = Array.from(userSkillsSet).some(
      (us) => us.includes(sLower) || sLower.includes(us)
    );
    if (hasSkill) {
      matchedSkills.push(skill);
    }
  }

  if (matchedSkills.length > 0) {
    const skillRatio = Math.min(matchedSkills.length / Math.max(opportunity.targetSkills.length, 1), 1);
    const skillScore = Math.round(15 + skillRatio * 15);
    score += skillScore;
    matchReasons.push(`Matches ${matchedSkills.length} of your current skills (${matchedSkills.slice(0, 3).join(", ")})`);
  } else {
    // Growth opportunity
    score += 8;
    matchReasons.push(`High-leverage opportunity to build target skills (${opportunity.targetSkills.slice(0, 2).join(", ")})`);
  }

  // 3. Goal & Interest Alignment (up to 20 pts)
  let goalMatched = false;
  if (userPrimaryGoal) {
    const oppKeywords = [
      ...opportunity.tags.map((t) => t.toLowerCase()),
      opportunity.title.toLowerCase(),
      opportunity.category.toLowerCase(),
    ];

    if (oppKeywords.some((k) => userPrimaryGoal.includes(k) || k.includes(userPrimaryGoal))) {
      score += 15;
      goalMatched = true;
      matchReasons.push(`Directly accelerates your primary aspiration`);
    }
  }

  if (!goalMatched) {
    // Check interests
    const sharedInterests = opportunity.tags.filter((t) =>
      Array.from(userInterestsSet).some((ui) => ui.includes(t.toLowerCase()))
    );
    if (sharedInterests.length > 0) {
      score += 12;
      matchReasons.push(`Aligns with your passions in ${sharedInterests.join(", ")}`);
    } else {
      score += 7;
    }
  }

  // 4. Career Stage & Scope Suitability (up to 15 pts)
  if (opportunity.stage === "All Stages") {
    score += 15;
  } else {
    const userStage = (user.currentStage || "intermediate").toLowerCase();
    if (userStage.includes(opportunity.stage.toLowerCase())) {
      score += 15;
      matchReasons.push(`Specifically calibrated for ${opportunity.stage} builders`);
    } else {
      score += 10;
    }
  }

  // Bound score between 20 and 99
  const boundedScore = Math.min(Math.max(score, 25), 98);

  return {
    ...opportunity,
    matchScore: boundedScore,
    matchReasons: matchReasons.slice(0, 3),
    matchedSkills,
  };
}

/**
 * Retrieves and scores opportunities for a given user, applying active filters and sorting by matchScore descending.
 */
export function getRecommendedOpportunities(
  user: OpportunityUserContext,
  filters: OpportunityFilterOptions = {}
): OpportunityRecommendation[] {
  let scored = SAMPLE_OPPORTUNITIES_CATALOG.map((opp) => scoreOpportunity(opp, user));

  // Filter by category
  if (filters.category && filters.category !== "All") {
    scored = scored.filter((opp) => opp.category === filters.category);
  }

  // Filter by domain
  if (filters.domain && filters.domain !== "All") {
    const dLower = filters.domain.toLowerCase();
    scored = scored.filter((opp) =>
      opp.targetDomains.some((d) => d.toLowerCase().includes(dLower))
    );
  }

  // Filter by search query
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    scored = scored.filter(
      (opp) =>
        opp.title.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.tags.some((t) => t.toLowerCase().includes(q)) ||
        opp.targetSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Filter by minimum match score
  if (typeof filters.minScore === "number" && filters.minScore > 0) {
    scored = scored.filter((opp) => opp.matchScore >= (filters.minScore ?? 0));
  }

  // Sort descending by score
  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
