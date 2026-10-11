import type {
  CandidateProfile,
  MatchRecommendation,
  ScoreBreakdown,
  SkillWithLevel,
} from "@/types/matching";

/**
 * Functional skill categories for synergy detection
 */
type SkillCategory =
  | "ai_ml"
  | "frontend"
  | "backend_cloud"
  | "design_creative"
  | "business_marketing"
  | "audio_music"
  | "video_media"
  | "performance"
  | "security"
  | "research"
  | "general";

const CATEGORY_KEYWORDS: Record<SkillCategory, string[]> = {
  ai_ml: [
    "ai",
    "ml",
    "machine learning",
    "python",
    "pytorch",
    "tensorflow",
    "nlp",
    "llm",
    "computer vision",
    "deep learning",
    "data science",
    "neural networks",
    "langchain",
    "prompt engineering",
  ],
  frontend: [
    "react",
    "next.js",
    "nextjs",
    "vue",
    "svelte",
    "angular",
    "typescript",
    "javascript",
    "html",
    "css",
    "tailwind",
    "web development",
    "frontend",
    "mobile",
    "flutter",
    "react native",
    "ios",
    "android",
  ],
  backend_cloud: [
    "node.js",
    "nodejs",
    "express",
    "go",
    "golang",
    "rust",
    "django",
    "fastapi",
    "java",
    "spring",
    "c++",
    "c#",
    ".net",
    "sql",
    "postgresql",
    "supabase",
    "mongodb",
    "docker",
    "kubernetes",
    "aws",
    "gcp",
    "azure",
    "devops",
    "backend",
    "database",
    "api",
  ],
  design_creative: [
    "ui/ux",
    "ui",
    "ux",
    "design",
    "figma",
    "graphic design",
    "3d modeling",
    "blender",
    "art",
    "illustration",
    "animation",
    "wireframing",
    "prototyping",
    "product design",
  ],
  business_marketing: [
    "entrepreneurship",
    "product management",
    "marketing",
    "growth",
    "sales",
    "business",
    "strategy",
    "pitching",
    "finance",
    "operations",
    "startup",
    "management",
    "public speaking",
  ],
  audio_music: [
    "music",
    "music production",
    "singing",
    "audio engineering",
    "sound design",
    "audio",
    "songwriting",
    "instruments",
    "mixing",
    "mastering",
  ],
  video_media: [
    "video editing",
    "content creation",
    "premiere",
    "after effects",
    "filmmaking",
    "storytelling",
    "youtube",
    "cinematography",
    "media",
    "direction",
  ],
  performance: [
    "dance",
    "choreography",
    "performance",
    "acting",
    "theatre",
    "stage",
  ],
  security: [
    "cybersecurity",
    "penetration testing",
    "ethical hacking",
    "security",
    "network security",
    "cryptography",
    "infosec",
  ],
  research: [
    "research",
    "scientific writing",
    "statistics",
    "data analysis",
    "academic research",
    "math",
    "mathematics",
  ],
  general: [],
};

/**
 * Cross-domain complementary synergy pairs
 */
interface SynergyDefinition {
  catA: SkillCategory;
  catB: SkillCategory;
  reason: string;
  weight: number;
}

const SYNERGY_RULES: SynergyDefinition[] = [
  {
    catA: "ai_ml",
    catB: "frontend",
    reason: "AI/ML engineering complements interactive frontend development for shipping user-facing AI applications.",
    weight: 15,
  },
  {
    catA: "backend_cloud",
    catB: "frontend",
    reason: "Backend and frontend specializations create a complete, high-velocity fullstack team.",
    weight: 15,
  },
  {
    catA: "ai_ml",
    catB: "design_creative",
    reason: "AI engineers and UI/UX designers combine algorithmic power with intuitive user experience.",
    weight: 14,
  },
  {
    catA: "design_creative",
    catB: "frontend",
    reason: "Designers and frontend engineers collaborate seamlessly to turn prototypes into production code.",
    weight: 14,
  },
  {
    catA: "business_marketing",
    catB: "ai_ml",
    reason: "Business strategists and AI specialists bridge technical capability with product-market viability.",
    weight: 13,
  },
  {
    catA: "business_marketing",
    catB: "frontend",
    reason: "Product visionaries and frontend creators accelerate rapid MVP testing and customer validation.",
    weight: 13,
  },
  {
    catA: "business_marketing",
    catB: "backend_cloud",
    reason: "Founders and infrastructure architects establish scalable system fundamentals.",
    weight: 13,
  },
  {
    catA: "audio_music",
    catB: "video_media",
    reason: "Sound producers and video editors produce rich, synchronized multimedia productions.",
    weight: 14,
  },
  {
    catA: "performance",
    catB: "video_media",
    reason: "Performers and content creators collaborate on dynamic visual showcases and media reels.",
    weight: 14,
  },
  {
    catA: "research",
    catB: "ai_ml",
    reason: "Domain researchers and AI practitioners translate analytical models into working software.",
    weight: 12,
  },
  {
    catA: "security",
    catB: "backend_cloud",
    reason: "Security specialists and backend engineers harden infrastructure against vulnerabilities.",
    weight: 12,
  },
  {
    catA: "design_creative",
    catB: "video_media",
    reason: "Visual designers and video creators craft cohesive branding and engaging storytelling.",
    weight: 11,
  },
];

/**
 * Classifies a skill name into a functional category
 */
export function classifySkill(skillName: string): SkillCategory {
  const normalized = skillName.toLowerCase().trim();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "general") continue;
    if (keywords.some((kw) => normalized === kw || normalized.includes(kw))) {
      return category as SkillCategory;
    }
  }

  return "general";
}

/**
 * Calculates deterministic compatibility score (0-100) between user and candidate
 */
export function calculateCompatibilityScore(
  user: CandidateProfile,
  candidate: CandidateProfile
): {
  score: number;
  breakdown: ScoreBreakdown;
  sharedInterests: string[];
  sharedSkills: string[];
  complementarySkillPairs: Array<{
    userSkill: string;
    candidateSkill: string;
    synergyReason: string;
  }>;
} {
  // 1. Shared Interests (Max 20 points)
  const userInterestNames = new Set(user.interests.map((i) => i.name.toLowerCase().trim()));
  const candidateInterestNames = candidate.interests.map((i) => i.name.toLowerCase().trim());
  const sharedInterests = candidateInterestNames.filter((i) => userInterestNames.has(i));

  const interestRatio =
    userInterestNames.size > 0
      ? sharedInterests.length / Math.max(userInterestNames.size, 1)
      : candidateInterestNames.length > 0
      ? 0.5
      : 0.3;
  const sharedInterestsScore = Math.min(20, Math.round(interestRatio * 20));

  // 2. Complementary Skills (Max 30 points)
  const userSkillCats = user.skills.map((s) => ({
    name: s.name,
    cat: classifySkill(s.name),
  }));
  const candidateSkillCats = candidate.skills.map((s) => ({
    name: s.name,
    cat: classifySkill(s.name),
  }));

  // Also check shared identical skills
  const userSkillNames = new Set(user.skills.map((s) => s.name.toLowerCase().trim()));
  const sharedSkills = candidate.skills
    .map((s) => s.name)
    .filter((s) => userSkillNames.has(s.toLowerCase().trim()));

  const complementaryPairs: Array<{
    userSkill: string;
    candidateSkill: string;
    synergyReason: string;
  }> = [];

  let complementaryRawPoints = 0;
  const visitedRuleKeys = new Set<string>();

  for (const uSkill of userSkillCats) {
    for (const cSkill of candidateSkillCats) {
      if (uSkill.cat === cSkill.cat && uSkill.cat !== "general") continue;

      for (const rule of SYNERGY_RULES) {
        const matchesForward = uSkill.cat === rule.catA && cSkill.cat === rule.catB;
        const matchesBackward = uSkill.cat === rule.catB && cSkill.cat === rule.catA;

        if (matchesForward || matchesBackward) {
          const ruleKey = `${rule.catA}-${rule.catB}`;
          if (!visitedRuleKeys.has(ruleKey)) {
            visitedRuleKeys.add(ruleKey);
            complementaryRawPoints += rule.weight;
            complementaryPairs.push({
              userSkill: uSkill.name,
              candidateSkill: cSkill.name,
              synergyReason: rule.reason,
            });
          }
        }
      }
    }
  }

  // Bonus for foundational shared skills to ensure they speak the same language
  if (sharedSkills.length > 0 && complementaryPairs.length > 0) {
    complementaryRawPoints += Math.min(6, sharedSkills.length * 2);
  }

  const complementarySkillsScore = Math.min(30, Math.round(complementaryRawPoints));

  // 3. Shared / Compatible Career Goals (Max 20 points)
  const goalKeywords = [
    "hackathon",
    "startup",
    "build",
    "launch",
    "internship",
    "portfolio",
    "learn",
    "collaborate",
    "open source",
    "ai",
    "saas",
    "scale",
    "mentor",
    "win",
    "team",
  ];

  const userGoalsText = `${user.primaryGoal || ""} ${user.secondaryGoal || ""} ${
    user.tertiaryGoal || ""
  }`.toLowerCase();
  const candGoalsText = `${candidate.primaryGoal || ""} ${candidate.secondaryGoal || ""} ${
    candidate.tertiaryGoal || ""
  }`.toLowerCase();

  const userMatchedKeywords = goalKeywords.filter((kw) => userGoalsText.includes(kw));
  const sharedGoalKeywords = userMatchedKeywords.filter((kw) => candGoalsText.includes(kw));

  const goalsRatio =
    userMatchedKeywords.length > 0
      ? sharedGoalKeywords.length / userMatchedKeywords.length
      : 0.5;
  const careerGoalsScore = Math.min(20, Math.round(goalsRatio * 15 + (sharedGoalKeywords.length > 0 ? 5 : 0)));

  // 4. Project Compatibility (Max 15 points)
  let projectPoints = 5; // base baseline
  if (candidate.projects.length > 0) {
    projectPoints += 4;
    // Check if project tags complement each other
    const userTags = new Set(
      user.projects.flatMap((p) => p.tags || []).map((t) => t.toLowerCase())
    );
    const candidateTags = candidate.projects.flatMap((p) => p.tags || []).map((t) => t.toLowerCase());
    const sharedTags = candidateTags.filter((t) => userTags.has(t));
    if (sharedTags.length > 0) {
      projectPoints += Math.min(6, sharedTags.length * 2);
    } else if (candidateTags.length > 0 && userTags.size > 0) {
      // Diverse project stacks also complement
      projectPoints += 3;
    }
  }
  const projectCompatibilityScore = Math.min(15, projectPoints);

  // 5. Domain / Education Compatibility (Max 10 points)
  let domainPoints = 4;
  const sameDomain =
    user.careerDomain.toLowerCase() === candidate.careerDomain.toLowerCase();
  if (sameDomain) {
    domainPoints = 8;
  } else {
    // Cross-domain collaboration synergy
    domainPoints = 9;
  }
  if (candidate.education && user.education) {
    domainPoints = Math.min(10, domainPoints + 1);
  }
  const domainEducationScore = Math.min(10, domainPoints);

  // 6. Goal Alignment (Max 5 points)
  let goalAlignmentPoints = 3;
  if (
    (userGoalsText.includes("team") || userGoalsText.includes("hackathon") || userGoalsText.includes("collaborat")) &&
    (candGoalsText.includes("team") || candGoalsText.includes("hackathon") || candGoalsText.includes("collaborat"))
  ) {
    goalAlignmentPoints = 5;
  }
  const goalAlignmentScore = Math.min(5, goalAlignmentPoints);

  // Sum total score
  const totalRaw =
    sharedInterestsScore +
    complementarySkillsScore +
    careerGoalsScore +
    projectCompatibilityScore +
    domainEducationScore +
    goalAlignmentScore;

  const score = Math.max(15, Math.min(100, Math.round(totalRaw)));

  const breakdown: ScoreBreakdown = {
    sharedInterestsScore,
    complementarySkillsScore,
    careerGoalsScore,
    projectCompatibilityScore,
    domainEducationScore,
    goalAlignmentScore,
  };

  return {
    score,
    breakdown,
    sharedInterests,
    sharedSkills,
    complementarySkillPairs: complementaryPairs,
  };
}

/**
 * Generates an explainable, human-readable rationale for the match
 */
export function generateMatchExplanation(
  score: number,
  user: CandidateProfile,
  candidate: CandidateProfile,
  complementaryPairs: Array<{ userSkill: string; candidateSkill: string; synergyReason: string }>,
  sharedInterests: string[],
  sharedSkills: string[]
): string {
  const parts: string[] = [];

  // Complementary synergy highlight
  if (complementaryPairs.length > 0) {
    const pair = complementaryPairs[0];
    parts.push(
      `Your ${pair.userSkill} expertise pairs effectively with their ${pair.candidateSkill} skills.`
    );
  } else if (sharedSkills.length > 0) {
    parts.push(`You both share strong technical ground in ${sharedSkills.slice(0, 2).join(" and ")}.`);
  } else {
    parts.push(
      `Your focus in ${user.careerDomain} pairs with their experience in ${candidate.careerDomain}.`
    );
  }

  // Shared interests highlight
  if (sharedInterests.length > 0) {
    parts.push(
      `You both share mutual interest in ${sharedInterests.slice(0, 2).join(" & ")}.`
    );
  } else if (candidate.primaryGoal) {
    parts.push(`Their goal to "${candidate.primaryGoal}" complements your team ambitions.`);
  }

  // Collaboration value conclusion
  if (score >= 85) {
    parts.push(
      "Exceptional synergy for hackathon building or co-founding a multi-disciplinary project."
    );
  } else if (score >= 70) {
    parts.push(
      "High collaboration potential with balanced skill distribution."
    );
  } else {
    parts.push(
      "Good potential for peer learning and project collaboration."
    );
  }

  return `${score}% match — ${parts.join(" ")}`;
}
