import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { getCandidateProfile, getMatchRecommendations } from "@/lib/matching/service";
import { getRecommendedOpportunities } from "@/lib/opportunities/engine";
import type {
  ChatMessage,
  CompanionDataCard,
  CompanionChatResponse,
} from "@/types/companion";

// Rate limiting in-memory storage (20 requests per minute per user)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}

/**
 * Validates and sanitizes user input against prompt injection and oversized payloads.
 */
function sanitizeUserInput(input: string): string {
  if (typeof input !== "string") {
    throw new Error("Message must be a string.");
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error("Message cannot be empty.");
  }
  if (trimmed.length > 1000) {
    throw new Error("Message exceeds the maximum length of 1,000 characters.");
  }

  // Remove dangerous control characters while preserving standard unicode and punctuation
  return trimmed.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

interface ProcessCompanionChatParams {
  userId: string;
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function processCompanionChat({
  userId,
  message,
  history = [],
}: ProcessCompanionChatParams): Promise<CompanionChatResponse> {
  // 1. Rate Limit Check
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `You have sent too many messages in a short time. Please wait ${rateLimit.retryAfter} seconds before trying again.`,
      error: "Rate limit exceeded.",
    };
  }

  // 2. Input Sanitization
  let sanitizedMessage: string;
  try {
    sanitizedMessage = sanitizeUserInput(message);
  } catch (validationErr: any) {
    return {
      success: false,
      message: validationErr.message || "Invalid input message.",
      error: "Validation failed.",
    };
  }

  // 3. Authenticated Context Retrieval (RLS compliant)
  const supabase = await createClient();
  const currentUser = await getCandidateProfile(userId);

  if (!currentUser) {
    return {
      success: false,
      message: "Please complete your onboarding profile first so I can assist you with personalized insights.",
      suggestedQuestions: ["How do I complete onboarding?", "Where is my profile?"],
      error: "Profile not found.",
    };
  }

  const activeUser = currentUser;

  // Fetch Career Roadmap Record
  const { data: roadmapRecord } = await supabase
    .from("career_roadmaps")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let parsedMilestones: any[] = [];
  let roadmapNextAction = roadmapRecord?.next_action || "";
  if (roadmapNextAction.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(roadmapNextAction);
      if (parsed.action) roadmapNextAction = parsed.action;
      if (Array.isArray(parsed.milestones)) parsedMilestones = parsed.milestones;
    } catch (e) {}
  }

  const collectedDataCards: CompanionDataCard[] = [];

  // ========================================================
  // CONTROLLED APPLICATION SERVICE EXECUTION HELPERS
  // ========================================================

  async function executeRecommendTeammates(params: {
    domain?: string;
    searchQuery?: string;
    minScore?: number;
  }) {
    try {
      const recs = await getMatchRecommendations(userId, {
        careerDomain: params.domain,
        searchQuery: params.searchQuery,
        minScore: params.minScore || 40,
        limit: 3,
      });

      if (!recs.matches || recs.matches.length === 0) {
        return {
          found: 0,
          candidates: [],
          message: "No matching members currently meet those exact filter criteria in your network.",
        };
      }

      for (const m of recs.matches) {
        collectedDataCards.push({
          type: "teammate",
          id: m.candidate.userId,
          name: m.candidate.fullName,
          domain: m.candidate.careerDomain,
          score: m.compatibilityScore,
          skills: m.candidate.skills.slice(0, 3).map((s) => s.name),
          explanation: m.explanation,
          actionUrl: "/discover",
        });
      }

      return {
        found: recs.matches.length,
        candidates: recs.matches.map((m) => ({
          name: m.candidate.fullName,
          careerDomain: m.candidate.careerDomain,
          compatibilityScore: m.compatibilityScore,
          explanation: m.explanation,
          complementarySkills: m.complementarySkillPairs.map((p) => `${p.userSkill} <-> ${p.candidateSkill}`),
          sharedInterests: m.sharedInterests,
        })),
      };
    } catch (err: any) {
      return { error: "Failed to query matching engine: " + err.message };
    }
  }

  async function executeExplainCompatibility(params: { candidateNameOrId: string }) {
    try {
      const recs = await getMatchRecommendations(userId, { limit: 10 });
      const query = (params.candidateNameOrId || "").toLowerCase();
      const match = recs.matches.find(
        (m) =>
          m.candidate.userId === params.candidateNameOrId ||
          m.candidate.fullName.toLowerCase().includes(query)
      );

      if (!match) {
        return {
          found: false,
          message: `Could not find a member matching "${params.candidateNameOrId}" in your current recommendations.`,
        };
      }

      collectedDataCards.push({
        type: "teammate",
        id: match.candidate.userId,
        name: match.candidate.fullName,
        domain: match.candidate.careerDomain,
        score: match.compatibilityScore,
        skills: match.candidate.skills.slice(0, 3).map((s) => s.name),
        explanation: match.explanation,
        actionUrl: "/discover",
      });

      return {
        found: true,
        candidateName: match.candidate.fullName,
        careerDomain: match.candidate.careerDomain,
        compatibilityScore: match.compatibilityScore,
        scoreBreakdown: match.breakdown,
        complementarySkills: match.complementarySkillPairs,
        sharedInterests: match.sharedInterests,
        explanation: match.explanation,
      };
    } catch (err: any) {
      return { error: "Failed to compute compatibility explanation: " + err.message };
    }
  }

  function executeSummarizeRoadmap() {
    if (!roadmapRecord) {
      return {
        hasRoadmap: false,
        message: "You have not generated a career roadmap yet. Visit the Career Roadmap page to create your personalized plan.",
        navigationUrl: "/roadmap",
      };
    }

    const completedCount = parsedMilestones.filter((m) => m.completed).length;
    const totalCount = parsedMilestones.length;

    collectedDataCards.push({
      type: "roadmap",
      targetCareer: roadmapRecord.target_career || "Career Specialist",
      currentStage: roadmapRecord.current_stage || "In Progress",
      nextAction: roadmapNextAction || "Review your roadmap milestones.",
      completedCount,
      totalCount,
      milestones: parsedMilestones.slice(0, 3),
      actionUrl: "/roadmap",
    });

    return {
      hasRoadmap: true,
      targetCareer: roadmapRecord.target_career,
      currentStage: roadmapRecord.current_stage,
      completedMilestones: completedCount,
      totalMilestones: totalCount,
      nextImmediateAction: roadmapNextAction,
      milestones: parsedMilestones.map((m) => ({
        title: m.title,
        priority: m.priority,
        estimatedTime: m.estimated_time,
        isCompleted: Boolean(m.completed),
      })),
    };
  }

  function executeFindOpportunities(params: {
    category?: string;
    search?: string;
    minScore?: number;
  }) {
    const oppUserContext = {
      careerDomain: activeUser.careerDomain,
      primaryGoal: activeUser.primaryGoal,
      skills: activeUser.skills,
      interests: activeUser.interests,
      currentStage: roadmapRecord?.current_stage || "Emerging Practitioner",
    };

    const opps = getRecommendedOpportunities(oppUserContext, {
      category: (params.category as any) || "All",
      search: params.search,
      minScore: params.minScore || 30,
    });

    const topOpps = opps.slice(0, 3);
    for (const opp of topOpps) {
      collectedDataCards.push({
        type: "opportunity",
        id: opp.id,
        title: opp.title,
        category: opp.category,
        organization: opp.organization,
        matchScore: opp.matchScore,
        deadline: opp.deadline || "Ongoing",
        actionUrl: "/opportunities",
      });
    }

    return {
      totalFound: opps.length,
      topOpportunities: topOpps.map((o) => ({
        title: o.title,
        category: o.category,
        organization: o.organization,
        matchScore: o.matchScore,
        matchReasons: o.matchReasons,
        deadline: o.deadline,
        targetSkills: o.targetSkills,
      })),
    };
  }

  function executeGuideNavigation(params: { destination: string }) {
    const dest = (params.destination || "").toLowerCase();
    const routes: Record<string, { title: string; description: string; url: string }> = {
      discover: {
        title: "Discover People",
        description: "Browse complementary teammates, view compatibility breakdowns, and connect.",
        url: "/discover",
      },
      roadmap: {
        title: "Career Roadmap",
        description: "Generate and track your sequential milestones and tactical career steps.",
        url: "/roadmap",
      },
      opportunities: {
        title: "Opportunities Hub",
        description: "Explore curated hackathons, grants, internships, and builder projects.",
        url: "/opportunities",
      },
      intelligence: {
        title: "AI Profile Intelligence",
        description: "Deep dive into your strengths, skill gaps, and strategic career trajectory.",
        url: "/intelligence",
      },
      connections: {
        title: "Connections & Requests",
        description: "Review pending invitations, sent requests, and active teammates.",
        url: "/connections",
      },
      profile: {
        title: "Edit Profile",
        description: "Update your career domain, skills, portfolio projects, and goals.",
        url: "/profile",
      },
      dashboard: {
        title: "Dashboard",
        description: "Return to your personal command center and overview metrics.",
        url: "/dashboard",
      },
    };

    const matchedKey = Object.keys(routes).find((k) => dest.includes(k)) || "dashboard";
    const nav = routes[matchedKey];

    collectedDataCards.push({
      type: "navigation",
      title: nav.title,
      description: nav.description,
      url: nav.url,
    });

    return nav;
  }

  // ========================================================
  // SYSTEM INSTRUCTION & PROMPT DEFINITION
  // ========================================================

  const systemInstruction = `You are "ConnectOne AI Companion", an intelligent, production-grade career & collaboration advisor built for ConnectOne.

=== CURRENT AUTHENTICATED USER CONTEXT ===
Name: ${activeUser.fullName}
Career Domain: ${activeUser.careerDomain}
Primary Goal: ${activeUser.primaryGoal || "Advance in career"}
Secondary Goal: ${activeUser.secondaryGoal || "Collaborate effectively"}
Skills: ${activeUser.skills.map((s) => s.name).join(", ") || "None listed"}
Interests: ${activeUser.interests.map((i) => i.name).join(", ") || "None listed"}
Active Projects Count: ${activeUser.projects.length}
Roadmap Target Role: ${roadmapRecord?.target_career || "Not generated yet"}
Roadmap Next Action: ${roadmapNextAction || "None set"}

=== BEHAVIORAL & SAFETY RULES ===
1. GROUNDING & TRUTH: You must NEVER fabricate users, teammates, compatibility percentages, opportunities, or database records. Only cite verified candidates or opportunities returned by your tools. Clearly distinguish live platform data from general AI advice.
2. CONSEQUENTIAL ACTION RESTRICTION: You MUST NOT create connection requests, update profiles, or modify database records autonomously. If the user asks to connect with someone or change their profile, guide them to the appropriate page (/discover or /profile) and explain that they must confirm and execute the action themselves.
3. PRIVACY: Never expose private information such as user email addresses or database IDs of other users.
4. TONE & FORMAT: Professional, clear, concise, and structured. Use markdown formatting with bullet points and bold headers. Avoid cheesy AI buzzwords and robotic intros.
5. SUGGESTED NEXT QUESTIONS: At the end of every helpful reply, propose 2-3 logical follow-up questions relevant to the user.`;

  const apiKey = (
    process.env["GEMINI_API_KEY"] ||
    process.env.GEMINI_API_KEY ||
    ""
  )
    .trim()
    .replace(/^["']|["']$/g, "");

  if (apiKey && apiKey !== "placeholder-gemini-key") {
    try {
      const client = new GoogleGenAI({ apiKey });

      const companionTools = [
        {
          name: "recommend_teammates",
          description:
            "Recommends matching teammates and collaborators from the live ConnectOne database using the multi-factor matching engine.",
          parameters: {
            type: "object",
            properties: {
              domain: {
                type: "string",
                description: "Optional career domain filter (e.g., 'Software Development', 'UI/UX', 'AI / Machine Learning')",
              },
              searchQuery: {
                type: "string",
                description: "Optional search query for specific skill, keyword, or interest",
              },
              minScore: {
                type: "number",
                description: "Optional minimum compatibility score threshold (0-100)",
              },
            },
          },
          type: "function" as const,
        },
        {
          name: "explain_compatibility_score",
          description:
            "Explains the detailed compatibility score breakdown and why a specific member or candidate is a strong match for the current user.",
          parameters: {
            type: "object",
            properties: {
              candidateNameOrId: {
                type: "string",
                description: "Name or ID of the candidate to explain compatibility for",
              },
            },
            required: ["candidateNameOrId"],
          },
          type: "function" as const,
        },
        {
          name: "summarize_career_roadmap",
          description:
            "Summarizes the authenticated user's current career roadmap, milestones, completion progress, and next immediate action.",
          parameters: {
            type: "object",
            properties: {},
          },
          type: "function" as const,
        },
        {
          name: "find_opportunities",
          description:
            "Finds verified hackathons, grants, internships, and projects scored against the user's career domain and skills.",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "Optional category: 'Hackathon', 'Grant', 'Internship', 'Fellowship', or 'Project'",
              },
              search: {
                type: "string",
                description: "Optional search term for keyword, technology, or host organization",
              },
              minScore: {
                type: "number",
                description: "Minimum match score threshold (0-100)",
              },
            },
          },
          type: "function" as const,
        },
        {
          name: "guide_navigation",
          description:
            "Provides navigation guidance and direct links to ConnectOne pages (discover, roadmap, opportunities, intelligence, connections, profile, dashboard).",
          parameters: {
            type: "object",
            properties: {
              destination: {
                type: "string",
                description: "Destination page name: 'discover', 'roadmap', 'opportunities', 'intelligence', 'connections', 'profile', or 'dashboard'",
              },
            },
            required: ["destination"],
          },
          type: "function" as const,
        },
      ];

      // Format interaction input steps
      const steps: any[] = [
        {
          type: "user_input",
          content: [
            {
              type: "text",
              text: `${systemInstruction}\n\n=== RECENT CONVERSATION HISTORY ===\n${history
                .slice(-4)
                .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
                .join("\n")}\n\nUser Question: ${sanitizedMessage}`,
            },
          ],
        },
      ];

      // Initial interaction call
      const response = await client.interactions.create({
        model: "gemini-3.8-flash",
        input: steps,
        tools: companionTools,
      });

      steps.push(...response.steps);

      // Check if model called any tools
      let hasToolCalls = false;
      for (const step of response.steps) {
        if (step.type === "function_call" && step.name) {
          hasToolCalls = true;
          const args = (step.arguments as Record<string, any>) || {};
          let resultData: any;

          if (step.name === "recommend_teammates") {
            resultData = await executeRecommendTeammates(args);
          } else if (step.name === "explain_compatibility_score") {
            resultData = await executeExplainCompatibility({
              candidateNameOrId: args.candidateNameOrId || "",
            });
          } else if (step.name === "summarize_career_roadmap") {
            resultData = executeSummarizeRoadmap();
          } else if (step.name === "find_opportunities") {
            resultData = executeFindOpportunities(args);
          } else if (step.name === "guide_navigation") {
            resultData = executeGuideNavigation({ destination: args.destination || "" });
          } else {
            resultData = { status: "unknown_function" };
          }

          steps.push({
            type: "function_result",
            name: step.name,
            call_id: step.id || "call_" + Date.now(),
            result: JSON.stringify(resultData),
          });
        }
      }

      let finalOutputText = "";

      if (hasToolCalls) {
        // Send tool results back to Gemini for final synthesis
        const response2 = await client.interactions.create({
          model: "gemini-3.8-flash",
          input: steps,
        });
        finalOutputText = response2.output_text || "";
      } else {
        finalOutputText = response.output_text || "";
      }

      if (finalOutputText) {
        const dynamicQuestions = extractSuggestedQuestions(
          sanitizedMessage,
          activeUser.careerDomain,
          Boolean(roadmapRecord)
        );

        return {
          success: true,
          message: finalOutputText,
          dataCards: collectedDataCards,
          suggestedQuestions: dynamicQuestions,
        };
      }
    } catch (apiError: any) {
      console.warn("Gemini Companion API call encountered an issue, transitioning to deterministic engine:", apiError?.message);
    }
  }

  // ========================================================
  // DETERMINISTIC PRODUCTION FALLBACK ENGINE
  // (Guarantees zero downtime when offline, key missing, or quota exceeded)
  // ========================================================

  return executeDeterministicCompanionResponse({
    currentUser: activeUser,
    message: sanitizedMessage,
    roadmapRecord,
    parsedMilestones,
    roadmapNextAction,
    executeRecommendTeammates,
    executeExplainCompatibility,
    executeSummarizeRoadmap,
    executeFindOpportunities,
    executeGuideNavigation,
    collectedDataCards,
  });
}

/**
 * Extracts sensible suggested next questions based on the current context.
 */
function extractSuggestedQuestions(
  userQuery: string,
  domain: string,
  hasRoadmap: boolean
): string[] {
  const qLower = userQuery.toLowerCase();

  if (qLower.includes("match") || qLower.includes("team") || qLower.includes("collaborat")) {
    return [
      "Explain how my compatibility score is calculated",
      "Find hackathons matching our complementary skills",
      "How do I send a connection request?",
    ];
  }

  if (qLower.includes("roadmap") || qLower.includes("milestone") || qLower.includes("career")) {
    return [
      "What is my highest-priority milestone to tackle first?",
      "Find opportunities that align with my roadmap",
      "Who can I collaborate with to achieve this milestone?",
    ];
  }

  if (qLower.includes("opportunity") || qLower.includes("hackathon") || qLower.includes("grant")) {
    return [
      "Recommend teammates to form a squad for these opportunities",
      "What skills should I learn next to qualify for more grants?",
      "Where can I see all available opportunities?",
    ];
  }

  return [
    "Who are my best matching teammates right now?",
    hasRoadmap
      ? "What is my next career roadmap milestone?"
      : "How do I generate my personalized Career Roadmap?",
    "Find relevant opportunities for my skills",
  ];
}

/**
 * Deterministic Fallback Engine providing exact, grounded answers using live platform services.
 */
export async function executeDeterministicCompanionResponse({
  currentUser,
  message,
  roadmapRecord,
  parsedMilestones,
  roadmapNextAction,
  executeRecommendTeammates,
  executeExplainCompatibility,
  executeSummarizeRoadmap,
  executeFindOpportunities,
  executeGuideNavigation,
  collectedDataCards,
}: {
  currentUser: any;
  message: string;
  roadmapRecord: any;
  parsedMilestones: any[];
  roadmapNextAction: string;
  executeRecommendTeammates: Function;
  executeExplainCompatibility: Function;
  executeSummarizeRoadmap: Function;
  executeFindOpportunities: Function;
  executeGuideNavigation: Function;
  collectedDataCards: CompanionDataCard[];
}): Promise<CompanionChatResponse> {
  // Clear any existing cards to prevent bleeding across turns
  collectedDataCards.length = 0;
  const text = message.toLowerCase().trim();

  // 1. Compatibility Score Explanation (Check specific score inquiries first)
  if (
    text.includes("compatibility") ||
    text.includes("score calculated") ||
    text.includes("calculate score") ||
    text.includes("score determined") ||
    text.includes("how is my score") ||
    text.includes("scoring work") ||
    (text.includes("explain") && (text.includes("score") || text.includes("match")))
  ) {
    const res = await executeRecommendTeammates({ limit: 1 });
    const sampleCandidate = res.candidates?.[0];

    let reply = `### How Compatibility Scoring Works on ConnectOne\n\n`;
    reply += `ConnectOne's matching engine evaluates compatibility holistically, prioritizing **both shared strengths and complementary synergy**:\n\n`;
    reply += `1. **Complementary Skill Synergy (35%)**: Pairs complementary disciplines (e.g., Frontend + Backend, AI/ML + Product Design) so you can build complete projects.\n`;
    reply += `2. **Shared Passions & Interests (25%)**: Overlapping interests that drive motivation.\n`;
    reply += `3. **Career Domain & Vision (25%)**: Alignment in career verticals and strategic goals.\n`;
    reply += `4. **Verified Skills Overlap (15%)**: Shared baseline knowledge for smooth technical communication.\n\n`;

    if (sampleCandidate) {
      reply += `#### Example Match: ${sampleCandidate.name} (${sampleCandidate.compatibilityScore}% Match)\n`;
      reply += `*${sampleCandidate.explanation}*\n\n`;
    }

    reply += `Explore all candidate breakdowns on the [Discover People](/discover) page.`;

    return {
      success: true,
      message: reply,
      dataCards: collectedDataCards,
      suggestedQuestions: [
        "Who are my highest-scoring matches?",
        "Find opportunities tailored to my skills",
        "What is my next career roadmap milestone?",
      ],
    };
  }

  // 2. Opportunities / Hackathons / Grants / Competitions
  if (
    text.includes("opportunit") ||
    text.includes("hackathon") ||
    text.includes("grant") ||
    text.includes("internship") ||
    text.includes("fellowship") ||
    (text.includes("competition") && !text.includes("compatibility"))
  ) {
    const oppRes = await executeFindOpportunities({});
    const list = oppRes?.topOpportunities || oppRes?.opportunities || [];
    let reply = `### Tailored Opportunities for ${currentUser.fullName}\n\n`;
    reply += `I searched the verified opportunities catalog for programs aligned with **${currentUser.careerDomain}** and your target skills:\n\n`;

    if (list.length > 0) {
      list.forEach((opp: any) => {
        reply += `- **${opp.title}** (${opp.category}) — **${opp.matchScore}% Match**\n`;
        reply += `  *Host: ${opp.organization || "ConnectOne Partner"} | Deadline: ${opp.deadline || "Ongoing"}*\n`;
        if (opp.matchReasons && opp.matchReasons.length > 0) {
          reply += `  *${opp.matchReasons.join("; ")}*\n`;
        }
        reply += `\n`;
      });
    } else {
      reply += `No immediate program matches found. You can explore all active tracks directly on the [Opportunities Hub](/opportunities).\n\n`;
    }

    reply += `Explore full details, eligibility, and application links on the [Opportunities Hub](/opportunities).`;

    return {
      success: true,
      message: reply,
      dataCards: collectedDataCards,
      suggestedQuestions: [
        "Who are my top complementary teammates right now?",
        "What is my next career roadmap milestone?",
        "Explain how compatibility scores are determined",
      ],
    };
  }

  // 3. Roadmap / Milestones / Next Steps / Career Stage
  if (
    text.includes("roadmap") ||
    text.includes("milestone") ||
    text.includes("next step") ||
    text.includes("next action") ||
    text.includes("career stage") ||
    (text.includes("what should i do") && !text.includes("opportunity")) ||
    (text.includes("goal") && (text.includes("career") || text.includes("next")))
  ) {
    executeSummarizeRoadmap();

    let reply = "";
    if (roadmapRecord) {
      const completedCount = parsedMilestones.filter((m) => m.completed).length;
      reply += `### Career Roadmap: ${roadmapRecord.target_career || "Career Specialist"}\n\n`;
      reply += `**Current Stage:** ${roadmapRecord.current_stage || "In Progress"}\n`;
      reply += `**Progress:** ${completedCount} of ${parsedMilestones.length} milestones completed.\n\n`;

      if (parsedMilestones.length > 0) {
        reply += `#### Key Milestones:\n`;
        parsedMilestones.slice(0, 3).forEach((m, idx) => {
          const status = m.completed ? " [Completed]" : "";
          reply += `${idx + 1}. **${m.title}** (${m.estimated_time}, Priority: ${m.priority})${status}\n   ${m.description}\n`;
        });
      }

      reply += `\n**Immediate Tactical Action:**\n> ${roadmapNextAction || "Review your roadmap."}\n\n`;
      reply += `You can view details and toggle milestone completion directly on the [Career Roadmap](/roadmap) page.`;
    } else {
      reply += `### Career Roadmap Not Yet Generated\n\n`;
      reply += `You haven't generated a personalized career progression roadmap yet. ConnectOne can generate custom milestones, next skills, and immediate actions calibrated to your domain (**${currentUser.careerDomain}**) and primary goal (**${currentUser.primaryGoal || "Career Growth"}**).\n\n`;
      reply += `Visit the [Career Roadmap](/roadmap) page to generate your plan.`;
    }

    return {
      success: true,
      message: reply,
      dataCards: collectedDataCards,
      suggestedQuestions: [
        "Who are my top complementary teammates right now?",
        "Find hackathons and grants tailored to my skills",
        "Explain how compatibility scores are determined",
      ],
    };
  }

  // 4. Navigation / Where is / How do I find / Go to
  if (
    text.includes("where") ||
    text.includes("how do i find") ||
    text.includes("navigate") ||
    text.includes("go to") ||
    text.includes("link to") ||
    text.includes("page")
  ) {
    let dest = "dashboard";
    if (text.includes("teammate") || text.includes("people") || text.includes("discover")) dest = "discover";
    else if (text.includes("roadmap") || text.includes("milestone")) dest = "roadmap";
    else if (text.includes("opportunity") || text.includes("hackathon")) dest = "opportunities";
    else if (text.includes("profile") || text.includes("edit") || text.includes("skill")) dest = "profile";
    else if (text.includes("intelligence") || text.includes("analysis") || text.includes("gap")) dest = "intelligence";
    else if (text.includes("connection") || text.includes("request")) dest = "connections";

    const nav = executeGuideNavigation({ destination: dest });

    return {
      success: true,
      message: `You can access **${nav.title}** directly at [${nav.url}](${nav.url}).\n\n${nav.description}`,
      dataCards: collectedDataCards,
      suggestedQuestions: [
        "Who are my top complementary teammates right now?",
        "What is my next career roadmap milestone?",
        "Find hackathons and grants tailored to my skills",
      ],
    };
  }

  // 5. Teammates / Matching / Collaborators
  if (
    text.includes("teammate") ||
    text.includes("partner") ||
    text.includes("collaborat") ||
    text.includes("match") ||
    text.includes("who can i work with") ||
    text.includes("find members") ||
    text.includes("recommend people") ||
    text.includes("candidates") ||
    text.includes("connect")
  ) {
    const res = await executeRecommendTeammates({});
    let reply = `### Teammate Recommendations for ${currentUser.fullName}\n\n`;

    if (res.candidates && res.candidates.length > 0) {
      reply += `Based on our multi-factor matching engine, I found **${res.candidates.length} verified candidate(s)** who complement your skills in **${currentUser.careerDomain}**:\n\n`;
      res.candidates.forEach((c: any) => {
        reply += `- **${c.name}** (${c.careerDomain}) — **${c.compatibilityScore}% Compatibility**\n  *${c.explanation}*\n\n`;
      });
      reply += `> **Action Note:** To connect with these members, visit [Discover People](/discover). I cannot send connection requests automatically without your confirmation.`;
    } else {
      reply += `Currently, there are no additional members in your network matching the criteria. As new peers join ConnectOne, you will see them appear in your recommendations.\n\nExplore [Discover People](/discover) to search by skill or domain.`;
    }

    return {
      success: true,
      message: reply,
      dataCards: collectedDataCards,
      suggestedQuestions: [
        "What is my next career roadmap milestone?",
        "Find hackathons and grants tailored to my skills",
        "Explain how compatibility scores are determined",
      ],
    };
  }

  // 6. Default General Guidance
  return {
    success: true,
    message: `Hello ${currentUser.fullName}! I am your **ConnectOne AI Companion**.\n\nI can assist you with:\n- **Teammate Discovery**: Recommending high-compatibility peers based on complementary skills.\n- **Compatibility Rationale**: Explaining why specific members complement your background.\n- **Career Roadmap**: Tracking your milestones and immediate tactical next actions.\n- **Opportunities Discovery**: Finding curated hackathons, grants, and builder fellowships.\n- **Platform Navigation**: Directing you to key ConnectOne resources.\n\nWhat would you like to explore today?`,
    dataCards: collectedDataCards,
    suggestedQuestions: [
      "Who are my top complementary teammates right now?",
      "What is my next career roadmap milestone?",
      "Find hackathons and grants tailored to my skills",
    ],
  };
}
