export type OpportunityCategory =
  | "Hackathons"
  | "Internships"
  | "Courses"
  | "Competitions"
  | "Research opportunities"
  | "Workshops"
  | "Events"
  | "Fellowships"
  | "Scholarships"
  | "Open-source opportunities";

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  targetDomains: string[];
  targetSkills: string[];
  stage: "Beginner" | "Intermediate" | "Advanced" | "All Stages";
  description: string;
  location: string;
  deadline?: string;
  timeline: string;
  rewardOrPerk?: string;
  isSampleOrDemo: true;
  sampleLabel: string;
  tags: string[];
}

export interface OpportunityRecommendation extends Opportunity {
  matchScore: number; // 0 - 100
  matchReasons: string[];
  matchedSkills: string[];
}

export interface OpportunitiesApiResponse {
  success: boolean;
  opportunities?: OpportunityRecommendation[];
  total?: number;
  error?: string;
}
