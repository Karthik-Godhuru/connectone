export interface SkillWithLevel {
  name: string;
  proficiencyLevel?: string | null;
  category?: string | null;
}

export interface InterestItem {
  name: string;
  category?: string | null;
}

export interface ProjectSummary {
  title: string;
  description?: string | null;
  repoUrl?: string | null;
  demoUrl?: string | null;
  tags?: string[] | null;
}

export interface CandidateProfile {
  userId: string;
  fullName: string;
  email?: string | null;
  careerDomain: string;
  education?: string | null;
  bio?: string | null;
  skills: SkillWithLevel[];
  interests: InterestItem[];
  projects: ProjectSummary[];
  primaryGoal?: string | null;
  secondaryGoal?: string | null;
  tertiaryGoal?: string | null;
  connectionStatus?: "none" | "pending" | "received" | "accepted" | "declined";
}

export interface ScoreBreakdown {
  sharedInterestsScore: number; // max 20
  complementarySkillsScore: number; // max 30
  careerGoalsScore: number; // max 20
  projectCompatibilityScore: number; // max 15
  domainEducationScore: number; // max 10
  goalAlignmentScore: number; // max 5
}

export interface MatchRecommendation {
  userId: string;
  candidate: CandidateProfile;
  compatibilityScore: number; // 0 to 100
  explanation: string;
  breakdown: ScoreBreakdown;
  sharedInterests: string[];
  sharedSkills: string[];
  complementarySkillPairs: Array<{
    userSkill: string;
    candidateSkill: string;
    synergyReason: string;
  }>;
}

export interface MatchingFilterOptions {
  careerDomain?: string;
  minScore?: number;
  searchQuery?: string;
  skill?: string;
  interest?: string;
  limit?: number;
  page?: number;
}
