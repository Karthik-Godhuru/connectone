export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: "sending" | "sent" | "error";
  dataCards?: CompanionDataCard[];
  suggestedQuestions?: string[];
  isFallback?: boolean;
}

export type CompanionDataCard =
  | {
      type: "teammate";
      id: string;
      name: string;
      domain: string;
      score: number;
      skills: string[];
      explanation: string;
      actionUrl: string;
    }
  | {
      type: "opportunity";
      id: string;
      title: string;
      category: string;
      organization: string;
      matchScore: number;
      deadline: string;
      actionUrl: string;
    }
  | {
      type: "roadmap";
      targetCareer: string;
      currentStage: string;
      nextAction: string;
      completedCount: number;
      totalCount: number;
      milestones: Array<{
        title: string;
        priority: string;
        estimated_time: string;
        completed?: boolean;
      }>;
      actionUrl: string;
    }
  | {
      type: "navigation";
      title: string;
      description: string;
      url: string;
    };

export interface CompanionChatRequest {
  message: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface CompanionChatResponse {
  success: boolean;
  message: string;
  dataCards?: CompanionDataCard[];
  suggestedQuestions?: string[];
  error?: string;
}
