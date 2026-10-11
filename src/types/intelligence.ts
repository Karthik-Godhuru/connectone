export interface AiProfileAnalysis {
  profile_summary: string;
  career_direction: string;
  strengths: string[];
  current_skills: string[];
  skill_gaps: string[];
  recommended_skills: string[];
  collaboration_preferences: string[];
  recommended_next_actions: string[];
}

export interface UserProfileContext {
  userId: string;
  fullName: string;
  email?: string | null;
  education?: string | null;
  careerDomain: string;
  bio?: string | null;
  skills: Array<{
    name: string;
    proficiencyLevel?: string | null;
    category?: string | null;
  }>;
  interests: Array<{
    name: string;
    category?: string | null;
  }>;
  projects: Array<{
    title: string;
    description?: string | null;
    repoUrl?: string | null;
    demoUrl?: string | null;
    tags?: string[] | null;
  }>;
  primaryGoal?: string | null;
  secondaryGoal?: string | null;
  tertiaryGoal?: string | null;
}

export interface IntelligenceApiResponse {
  success: boolean;
  analysis?: AiProfileAnalysis;
  error?: string;
  code?: string;
  cached?: boolean;
  timestamp?: string;
}
