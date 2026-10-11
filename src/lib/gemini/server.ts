import { GoogleGenAI } from "@google/genai";
import type { AiProfileAnalysis, UserProfileContext } from "@/types/intelligence";

/**
 * Validates and sanitizes the parsed Gemini response.
 * Guarantees that all 8 required fields exist with valid types.
 */
export function validateAiProfileAnalysis(raw: unknown): AiProfileAnalysis {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid AI response: Expected a JSON object.");
  }

  const obj = raw as Record<string, unknown>;

  const toStringSafe = (val: unknown, fallback: string): string =>
    typeof val === "string" && val.trim() ? val.trim() : fallback;

  const toStringArraySafe = (val: unknown): string[] => {
    if (Array.isArray(val)) {
      return val
        .map((item) => (typeof item === "string" ? item.trim() : String(item)))
        .filter((item) => item.length > 0);
    }
    if (typeof val === "string" && val.trim()) {
      return [val.trim()];
    }
    return [];
  };

  const analysis: AiProfileAnalysis = {
    profile_summary: toStringSafe(
      obj.profile_summary,
      "Profile summary could not be extracted from the analysis."
    ),
    career_direction: toStringSafe(
      obj.career_direction,
      "Strategic career direction based on target aspirations."
    ),
    strengths: toStringArraySafe(obj.strengths),
    current_skills: toStringArraySafe(obj.current_skills),
    skill_gaps: toStringArraySafe(obj.skill_gaps),
    recommended_skills: toStringArraySafe(obj.recommended_skills),
    collaboration_preferences: toStringArraySafe(obj.collaboration_preferences),
    recommended_next_actions: toStringArraySafe(obj.recommended_next_actions),
  };

  if (!analysis.profile_summary || !analysis.career_direction) {
    throw new Error("AI response was incomplete: Missing profile summary or career direction.");
  }

  return analysis;
}

/**
 * Server-side AI profile analysis using Gemini API.
 * NEVER call this function from client components.
 */
export async function analyzeUserProfile(
  context: UserProfileContext
): Promise<AiProfileAnalysis> {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY ERROR: analyzeUserProfile can only be executed on the server."
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "placeholder-gemini-key") {
    throw new Error(
      "Gemini API key is not configured. Please set a valid GEMINI_API_KEY in your server environment variables."
    );
  }

  const client = new GoogleGenAI({ apiKey });

  // Format user profile data for Gemini analysis
  const formattedSkills = context.skills.length > 0
    ? context.skills.map((s) => `${s.name} (${s.proficiencyLevel || "Not specified"})`).join(", ")
    : "None listed";

  const formattedInterests = context.interests.length > 0
    ? context.interests.map((i) => i.name).join(", ")
    : "None listed";

  const formattedProjects = context.projects.length > 0
    ? context.projects
        .map(
          (p) =>
            `- ${p.title}: ${p.description || "No description"} (Tags: ${
              p.tags && p.tags.length > 0 ? p.tags.join(", ") : "None"
            })`
        )
        .join("\n")
    : "No prior projects listed.";

  const prompt = `You are the Lead Talent & Collaboration Intelligence AI for ConnectOne, a next-generation platform for hackathons, builder collaborations, and tech careers.

Analyze the following builder profile comprehensively and extract structured intelligence to power teammate matchmaking, project opportunities, and skill progression.

=== BUILDER PROFILE DATA ===
Name: ${context.fullName}
Career Domain: ${context.careerDomain}
Education: ${context.education || "Not specified"}
Bio / About Me: ${context.bio || "Not specified"}
Current Skills: ${formattedSkills}
Interests: ${formattedInterests}
Past / Current Projects:
${formattedProjects}
Primary Goal: ${context.primaryGoal || "Not specified"}
Secondary Goal: ${context.secondaryGoal || "Not specified"}
Tertiary Goal: ${context.tertiaryGoal || "Not specified"}

=== INSTRUCTIONS ===
1. Profile Summary: Provide an insightful 2-3 sentence overview capturing their identity, technical/creative depth, and ambition.
2. Career Direction: Synthesize their trajectory and best suited roles/disciplines.
3. Strengths: List 4-6 key strengths (technical, creative, execution, or collaborative).
4. Current Skills: List their verified inventory of current abilities.
5. Skill Gaps: Identify 3-5 critical skills they are missing to achieve their stated goals.
6. Recommended Skills: 3-5 high-leverage skills, technologies, or tools to learn next.
7. Collaboration Preferences: 3-5 points describing what types of teammates, team roles, or hackathon dynamics they complement best.
8. Recommended Next Actions: 4-6 actionable, high-impact steps to advance their portfolio, team formation, or career immediately.

Return the response matching the requested JSON schema strictly.`;

  try {
    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      response_format: [
        {
          type: "text",
          mime_type: "application/json",
          schema: {
            type: "object",
            properties: {
              profile_summary: {
                type: "string",
                description: "Synthesized executive summary of the builder",
              },
              career_direction: {
                type: "string",
                description: "Strategic domain focus and future trajectory",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                description: "List of key strengths and competitive edges",
              },
              current_skills: {
                type: "array",
                items: { type: "string" },
                description: "Inventory of current skills extracted from profile",
              },
              skill_gaps: {
                type: "array",
                items: { type: "string" },
                description: "Missing skills needed to achieve primary goals",
              },
              recommended_skills: {
                type: "array",
                items: { type: "string" },
                description: "Highest leverage skills to master next",
              },
              collaboration_preferences: {
                type: "array",
                items: { type: "string" },
                description: "Ideal teammates and working dynamics",
              },
              recommended_next_actions: {
                type: "array",
                items: { type: "string" },
                description: "Actionable next steps to accelerate growth",
              },
            },
            required: [
              "profile_summary",
              "career_direction",
              "strengths",
              "current_skills",
              "skill_gaps",
              "recommended_skills",
              "collaboration_preferences",
              "recommended_next_actions",
            ],
          },
        },
      ],
    });

    const outputText = interaction.output_text;

    if (!outputText) {
      throw new Error("Gemini returned an empty response.");
    }

    // Clean potential markdown backticks if model wrapped JSON
    let cleanJson = outputText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleanJson);
    return validateAiProfileAnalysis(parsed);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown Gemini API error";
    // Sanitize message to avoid leaking any raw credentials
    const sanitizedMsg = errorMsg
      .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]")
      .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, "Bearer [REDACTED]");

    console.error("Gemini Profile Analysis Error:", sanitizedMsg);
    throw new Error(sanitizedMsg);
  }
}
