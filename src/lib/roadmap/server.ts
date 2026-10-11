import { GoogleGenAI } from "@google/genai";
import type {
  CareerRoadmap,
  RoadmapMilestone,
  RoadmapContext,
  MilestonePriority,
} from "@/types/roadmap";

/**
 * Validates and sanitizes the parsed Gemini roadmap response.
 * Guarantees that target_career, current_stage, next_skills, milestones, and next_action exist.
 */
export function validateCareerRoadmap(raw: unknown): CareerRoadmap {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid AI roadmap response: Expected a JSON object.");
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

  const parseMilestones = (val: unknown): RoadmapMilestone[] => {
    if (!Array.isArray(val)) return [];
    const parsedList: RoadmapMilestone[] = [];
    for (let idx = 0; idx < val.length; idx++) {
      const m = val[idx];
      if (!m || typeof m !== "object") continue;
      const mObj = m as Record<string, unknown>;
      const rawPriority = String(mObj.priority || "medium").toLowerCase();
      const priority: MilestonePriority =
        rawPriority === "high" || rawPriority === "low" ? rawPriority : "medium";

      parsedList.push({
        id: `ms-${idx + 1}-${Date.now().toString(36)}`,
        title: toStringSafe(mObj.title, `Milestone ${idx + 1}`),
        description: toStringSafe(mObj.description, "Complete recommended objectives."),
        priority,
        estimated_time: toStringSafe(mObj.estimated_time, "2-4 weeks"),
        completed: Boolean(mObj.completed),
      });
    }
    return parsedList;
  };

  const targetCareer = toStringSafe(obj.target_career, "Career Specialist");
  const currentStage = toStringSafe(obj.current_stage, "Early Exploration");
  const nextSkills = toStringArraySafe(obj.next_skills);
  const milestones = parseMilestones(obj.milestones);
  const nextAction = toStringSafe(
    obj.next_action,
    "Review your primary career goal and start your first high-priority milestone."
  );

  if (milestones.length === 0) {
    throw new Error("AI roadmap response did not contain any valid milestones.");
  }

  return {
    target_career: targetCareer,
    current_stage: currentStage,
    next_skills: nextSkills.length > 0 ? nextSkills : ["Core Domain Mastery"],
    milestones,
    next_action: nextAction,
  };
}

/**
 * Server-side AI Career Roadmap generator using Gemini API.
 * NEVER call this function from client components.
 */
export async function generateAiCareerRoadmap(
  context: RoadmapContext
): Promise<CareerRoadmap> {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY ERROR: generateAiCareerRoadmap can only be executed on the server."
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Format context for prompt
  const skillsList =
    context.skills.length > 0
      ? context.skills.map((s) => `${s.name} (${s.proficiencyLevel || "Practitioner"})`).join(", ")
      : "None explicitly listed";

  const interestsList =
    context.interests.length > 0
      ? context.interests.map((i) => i.name).join(", ")
      : "None explicitly listed";

  const projectsList =
    context.projects.length > 0
      ? context.projects
          .map(
            (p) =>
              `- ${p.title}: ${p.description || "Portfolio artifact"} (Tags: ${
                p.tags?.join(", ") || "None"
              })`
          )
          .join("\n")
      : "No documented projects yet.";

  const strengthsList =
    context.strengths && context.strengths.length > 0
      ? context.strengths.join(", ")
      : "Not yet analyzed";

  const skillGapsList =
    context.skillGaps && context.skillGaps.length > 0
      ? context.skillGaps.join(", ")
      : "Not yet analyzed";

  const recommendedSkillsList =
    context.recommendedSkills && context.recommendedSkills.length > 0
      ? context.recommendedSkills.join(", ")
      : "Not yet analyzed";

  // Check if live Gemini API key is configured
  if (apiKey && apiKey !== "placeholder-gemini-key") {
    try {
      const client = new GoogleGenAI({ apiKey });

      const prompt = `You are the Lead Career Strategist & Progression Architect for ConnectOne.
ConnectOne empowers builders across diverse domains: Technology (AI, Software, Data Science, Cybersecurity), Creative Arts (Design, UI/UX, Art, Dance, Singing/Music), Research, Entrepreneurship, Content Creation, and Marketing.

Your objective is to generate an empowering, actionable, high-impact career progression roadmap for this individual based on their unique background, goals, and domain.

=== BUILDER CONTEXT ===
Name: ${context.fullName}
Career Domain: ${context.careerDomain}
Education: ${context.education || "Not specified"}
Bio / Story: ${context.bio || "Not specified"}
Primary Goal: ${context.primaryGoal || "Advance in career domain"}
Secondary Goal: ${context.secondaryGoal || "Build meaningful work"}
Tertiary Goal: ${context.tertiaryGoal || "Collaborate with high-caliber peers"}

Current Skills: ${skillsList}
Interests: ${interestsList}
Projects & Works:
${projectsList}

AI Intelligence Signals:
- Known Strengths: ${strengthsList}
- Skill Gaps to Address: ${skillGapsList}
- Recommended Next Skills: ${recommendedSkillsList}

=== INSTRUCTIONS ===
1. Target Career: Identify the concrete target role / title best aligned with their domain and aspirations (e.g. "Senior Machine Learning Engineer", "Venture-Backed Founder", "Lead Product Designer", "Independent Music Producer & Composer", "Creative Director", "Cybersecurity Threat Hunter", "Contemporary Dance Choreographer").
2. Current Stage: A concise label of their current career phase (e.g. "Foundational Explorer", "Emerging Specialist", "Active Builder & Contributor", "Scaling Professional").
3. Next Skills: 3-5 immediate high-leverage skills or craft capabilities they must acquire to advance.
4. Milestones: 4-6 sequential, high-impact milestones. For each milestone, provide:
   - title: Clear milestone heading
   - description: 1-2 practical, actionable sentences detailing what to build, study, or execute
   - priority: "high", "medium", or "low"
   - estimated_time: Realistic duration (e.g. "2 weeks", "1 month", "6 weeks")
5. Next Action: A single, punchy, immediate next action they should do today to make tangible progress.

Return the response matching the requested JSON schema strictly.`;

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
                target_career: {
                  type: "string",
                  description: "Specific target career title or role",
                },
                current_stage: {
                  type: "string",
                  description: "Current stage of progression",
                },
                next_skills: {
                  type: "array",
                  items: { type: "string" },
                  description: "Top 3 to 5 next skills to acquire",
                },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: {
                        type: "string",
                        enum: ["high", "medium", "low"],
                      },
                      estimated_time: { type: "string" },
                    },
                    required: ["title", "description", "priority", "estimated_time"],
                  },
                  description: "Sequential career milestones",
                },
                next_action: {
                  type: "string",
                  description: "Immediate high-impact next action",
                },
              },
              required: [
                "target_career",
                "current_stage",
                "next_skills",
                "milestones",
                "next_action",
              ],
            },
          },
        ],
      });

      const outputText = interaction.output_text;
      if (outputText) {
        let cleanJson = outputText.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanJson);
        return validateCareerRoadmap(parsed);
      }
    } catch (apiError: unknown) {
      const errorMsg =
        apiError instanceof Error ? apiError.message : "Gemini API execution error";
      console.warn("Live Gemini roadmap call failed, falling back to intelligent synthesizer:", errorMsg);
    }
  }

  // Fallback intelligent domain-specific roadmap synthesizer
  // Guarantees zero downtime when API keys are being provisioned or quota is exceeded
  return generateDeterministicRoadmapFallback(context);
}

/**
 * Intelligent deterministic fallback generator customized to user domain and goals.
 * Handles both tech and non-tech career verticals.
 */
function generateDeterministicRoadmapFallback(context: RoadmapContext): CareerRoadmap {
  const domain = (context.careerDomain || "").toLowerCase();
  const primaryGoal = context.primaryGoal || "Launch flagship initiative";

  let targetCareer = "Professional Pioneer";
  let currentStage = "Emerging Practitioner";
  let nextSkills = ["Strategic Planning", "Portfolio Presentation", "Cross-Domain Networking"];
  let nextAction = `Draft the architectural brief for your primary objective: "${primaryGoal}".`;
  let milestones: RoadmapMilestone[] = [];

  if (domain.includes("ai") || domain.includes("machine learning")) {
    targetCareer = "Lead AI / ML Engineer";
    currentStage = "Applied AI Builder";
    nextSkills = ["PyTorch & Model Fine-Tuning", "Vector Databases & RAG", "Evaluation Benchmarks", "Distributed Inference"];
    nextAction = "Build and benchmark a proof-of-concept multi-agent workflow solving an actual user workflow.";
    milestones = [
      {
        id: "ms-ai-1",
        title: "Master End-to-End LLM Orchestration & RAG",
        description: "Develop a domain-adapted retrieval pipeline using hybrid search, reranking, and semantic chunking.",
        priority: "high",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-ai-2",
        title: "Fine-tune & Quantize an Open-Source Foundation Model",
        description: "Apply LoRA/QLoRA on specialized domain datasets and evaluate inference latency and memory footprints.",
        priority: "high",
        estimated_time: "4 weeks",
        completed: false,
      },
      {
        id: "ms-ai-3",
        title: "Deploy Production Inference with Streaming & Guardrails",
        description: "Containerize the model service using vLLM or Triton with structured output validation and latency SLAs.",
        priority: "medium",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-ai-4",
        title: "Publish an Open-Source Artifact & Technical Benchmark",
        description: "Write an in-depth architecture breakdown and share the benchmark code on GitHub and community forums.",
        priority: "medium",
        estimated_time: "2 weeks",
        completed: false,
      },
    ];
  } else if (domain.includes("software") || domain.includes("web") || domain.includes("fullstack")) {
    targetCareer = "Staff Full-Stack Software Architect";
    currentStage = "High-Velocity Systems Builder";
    nextSkills = ["Distributed Architecture", "Event-Driven Pipelines", "High-Concurrency Optimization", "Cloud Infrastructure (IaC)"];
    nextAction = "Refactor key backend queries for zero-latency indexing and write automated end-to-end integration tests.";
    milestones = [
      {
        id: "ms-sw-1",
        title: "Architect Distributed State & Caching Hierarchy",
        description: "Implement multi-layer caching with Redis and optimistic cache invalidation for sub-50ms API responses.",
        priority: "high",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-sw-2",
        title: "Automate Resilient CI/CD & Security Auditing",
        description: "Configure GitHub Actions workflows with automated SAST scanning, container linting, and ephemeral staging previews.",
        priority: "high",
        estimated_time: "2 weeks",
        completed: false,
      },
      {
        id: "ms-sw-3",
        title: "Ship a Collaborative Real-Time Feature",
        description: "Introduce WebSocket or WebRTC state synchronization with conflict-free replicated data types (CRDTs).",
        priority: "medium",
        estimated_time: "4 weeks",
        completed: false,
      },
      {
        id: "ms-sw-4",
        title: "Open-Source a Core Reusable Component Library",
        description: "Package accessible, high-performance UI components with 100% test coverage and typed documentation.",
        priority: "medium",
        estimated_time: "2 weeks",
        completed: false,
      },
    ];
  } else if (domain.includes("design") || domain.includes("ui") || domain.includes("ux")) {
    targetCareer = "Lead Product & Systems Designer";
    currentStage = "Design Systems Practitioner";
    nextSkills = ["Advanced Micro-Interactions", "Accessibility (WCAG AAA)", "Design Tokens Engineering", "Design-to-Code Pipelines"];
    nextAction = "Audit existing user flows for friction and construct an interactive component variant library.";
    milestones = [
      {
        id: "ms-des-1",
        title: "Establish Unified Cross-Platform Design Token Hierarchy",
        description: "Map semantic color tokens, typography scales, and responsive elevation matrices in Figma and code.",
        priority: "high",
        estimated_time: "2 weeks",
        completed: false,
      },
      {
        id: "ms-des-2",
        title: "Conduct Generative Usability Studies & Journey Mapping",
        description: "Run 5 moderated customer usability sessions and synthesize insights into validated UX wireframes.",
        priority: "high",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-des-3",
        title: "Prototype High-Fidelity Micro-Interactions",
        description: "Implement buttery-smooth spring animations and feedback states in Framer Motion / CSS.",
        priority: "medium",
        estimated_time: "2 weeks",
        completed: false,
      },
      {
        id: "ms-des-4",
        title: "Launch Public Design System Documentation & Case Study",
        description: "Document component guidelines, accessibility rationales, and impact metrics in an interactive showcase.",
        priority: "medium",
        estimated_time: "3 weeks",
        completed: false,
      },
    ];
  } else if (domain.includes("entrepreneur") || domain.includes("business") || domain.includes("startup")) {
    targetCareer = "Venture-Backed Founder & CEO";
    currentStage = "Product-Market Fit Seeker";
    nextSkills = ["Customer Discovery Sprints", "Unit Economics & Financial Modeling", "Go-To-Market Traction", "Pitch Deck Narrative"];
    nextAction = "Schedule 10 problem-discovery interviews with target users to validate your value proposition.";
    milestones = [
      {
        id: "ms-ent-1",
        title: "Validate Core Hypothesis with 20 Target Customer Calls",
        description: "Map customer pain points, current manual workarounds, and willingness-to-pay signals into a validation scorecard.",
        priority: "high",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-ent-2",
        title: "Launch Minimum Viable Product (MVP) & Onboard Alpha Users",
        description: "Deploy an unbloated prototype focusing strictly on the single core 'magic moment' and track retention.",
        priority: "high",
        estimated_time: "4 weeks",
        completed: false,
      },
      {
        id: "ms-ent-3",
        title: "Establish Repeatable Customer Acquisition Channel",
        description: "Experiment with content flywheel, cold outreach, and developer communities to achieve steady weekly signups.",
        priority: "high",
        estimated_time: "4 weeks",
        completed: false,
      },
      {
        id: "ms-ent-4",
        title: "Synthesize Founder Pitch Deck & Financial Forecast",
        description: "Structure problem, solution, market size, traction, and unit economics for angel and accelerator applications.",
        priority: "medium",
        estimated_time: "2 weeks",
        completed: false,
      },
    ];
  } else if (domain.includes("music") || domain.includes("sing") || domain.includes("audio")) {
    targetCareer = "Independent Music Producer & Composer";
    currentStage = "Emerging Sonic Creator";
    nextSkills = ["Digital Audio Workstation (DAW) Mastery", "Spatial Audio Mixing", "Songwriting & Arrangement", "Music Licensing & Rights"];
    nextAction = "Record a foundational 4-track EP demo and assemble a press kit for sync licensing.";
    milestones = [
      {
        id: "ms-mus-1",
        title: "Produce & Master a 3-Track Sonic EP",
        description: "Complete full composition, vocal arrangement, and dynamic mastering conforming to broadcast standards.",
        priority: "high",
        estimated_time: "4 weeks",
        completed: false,
      },
      {
        id: "ms-mus-2",
        title: "Build Collaborative Network with Visual Media Directors",
        description: "Partner with indie game developers and filmmakers to compose original background scores.",
        priority: "high",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-mus-3",
        title: "Establish Digital Rights, Metadata & Distribution Pipeline",
        description: "Register work with PROs (BMI/ASCAP/PRS) and distribute to streaming platforms with synced lyrics.",
        priority: "medium",
        estimated_time: "2 weeks",
        completed: false,
      },
      {
        id: "ms-mus-4",
        title: "Host Live Streaming Listening Session & Behind-the-Scenes",
        description: "Engage early listeners with track breakdown tutorials and breakdown the creative process.",
        priority: "medium",
        estimated_time: "2 weeks",
        completed: false,
      },
    ];
  } else if (domain.includes("dance") || domain.includes("art") || domain.includes("content")) {
    targetCareer = "Creative Director & Multimedia Artist";
    currentStage = "Cross-Disciplinary Performer";
    nextSkills = ["Choreography Conceptualization", "Visual Storytelling & Direction", "Digital Brand Audience Building", "Production Budgeting"];
    nextAction = "Storyboard a 60-second signature visual showcase combining choreography and high-contrast cinematography.";
    milestones = [
      {
        id: "ms-art-1",
        title: "Produce Signature Visual Portfolio Reel",
        description: "Direct and edit a cinematic showcase highlighting movement diversity, musicality, and stage presence.",
        priority: "high",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-art-2",
        title: "Collaborate on a Cross-Genre Production Project",
        description: "Unite with musicians and digital artists to stage an experiential performance or digital premiere.",
        priority: "high",
        estimated_time: "4 weeks",
        completed: false,
      },
      {
        id: "ms-art-3",
        title: "Scale Digital Community with Weekly Masterclasses",
        description: "Produce educational process reels and movement breakdowns to establish industry thought leadership.",
        priority: "medium",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-art-4",
        title: "Apply for Prestigious Creative Residencies & Grants",
        description: "Submit conceptual artist statement and portfolio documentation to competitive cultural fellowships.",
        priority: "medium",
        estimated_time: "2 weeks",
        completed: false,
      },
    ];
  } else {
    // General / Research / Marketing / Cybersecurity / Other
    targetCareer = `${context.careerDomain || "Domain"} Strategist & Lead`;
    currentStage = "Specializing Contributor";
    nextSkills = ["Domain Research Methodology", "Strategic Communication", "Technical Execution", "Impact Quantification"];
    nextAction = `Define measurable milestones for your target objective: "${primaryGoal}".`;
    milestones = [
      {
        id: "ms-gen-1",
        title: "Conduct Deep Strategic Literature & Industry Audit",
        description: "Synthesize contemporary breakthroughs, competitive gaps, and best practices in your specialized focus.",
        priority: "high",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-gen-2",
        title: "Deliver a High-Impact Flagship Project",
        description: "Execute and publish a comprehensive project addressing an unsolved industry challenge.",
        priority: "high",
        estimated_time: "4 weeks",
        completed: false,
      },
      {
        id: "ms-gen-3",
        title: "Mentor Rising Builders & Publish Findings",
        description: "Share frameworks through technical writeups, conference talks, and interactive workshops.",
        priority: "medium",
        estimated_time: "3 weeks",
        completed: false,
      },
      {
        id: "ms-gen-4",
        title: "Expand Cross-Disciplinary Strategic Partnerships",
        description: "Collaborate with leaders in adjacent fields to pioneer interdisciplinary opportunities.",
        priority: "medium",
        estimated_time: "2 weeks",
        completed: false,
      },
    ];
  }

  return {
    target_career: targetCareer,
    current_stage: currentStage,
    next_skills: nextSkills,
    milestones,
    next_action: nextAction,
  };
}
