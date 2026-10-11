export type MilestonePriority = "high" | "medium" | "low";

export interface RoadmapMilestone {
  id?: string;
  title: string;
  description: string;
  priority: MilestonePriority;
  estimated_time: string;
  completed?: boolean;
}

export interface CareerRoadmap {
  target_career: string;
  current_stage: string;
  next_skills: string[];
  milestones: RoadmapMilestone[];
  next_action: string;
}

export interface RoadmapContext {
  userId: string;
  fullName: string;
  careerDomain: string;
  education?: string | null;
  bio?: string | null;
  primaryGoal?: string | null;
  secondaryGoal?: string | null;
  tertiaryGoal?: string | null;
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
    tags?: string[] | null;
  }>;
  strengths?: string[];
  skillGaps?: string[];
  recommendedSkills?: string[];
}

export interface RoadmapApiResponse {
  success: boolean;
  roadmap?: CareerRoadmap;
  id?: string;
  updatedAt?: string;
  error?: string;
  code?: string;
}
