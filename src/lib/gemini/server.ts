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

  const apiKey = (
    process.env["GEMINI_API_KEY"] ||
    process.env.GEMINI_API_KEY ||
    ""
  )
    .trim()
    .replace(/^["']|["']$/g, "");

  // 1. If a valid Gemini API key is configured (not empty, not placeholder)
  if (apiKey && apiKey !== "placeholder-gemini-key") {
    try {
      const client = new GoogleGenAI({ apiKey });

      // Format user profile data for Gemini analysis
      const formattedSkills =
        context.skills.length > 0
          ? context.skills
              .map(
                (s) =>
                  `${s.name} (${s.proficiencyLevel || "Not specified"})`
              )
              .join(", ")
          : "None listed";

      const formattedInterests =
        context.interests.length > 0
          ? context.interests.map((i) => i.name).join(", ")
          : "None listed";

      const formattedProjects =
        context.projects.length > 0
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

      if (outputText) {
        let cleanJson = outputText.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const parsed = JSON.parse(cleanJson);
        return validateAiProfileAnalysis(parsed);
      }
    } catch (apiError: unknown) {
      const errorMsg =
        apiError instanceof Error ? apiError.message : "Gemini API error";
      const sanitizedMsg = errorMsg
        .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]")
        .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, "Bearer [REDACTED]");
      console.warn(
        "Live Gemini profile analysis call failed, falling back to intelligent domain synthesizer:",
        sanitizedMsg
      );
    }
  }

  // 2. Intelligent domain-driven fallback when API key is a placeholder or during offline/fallback mode
  return generateDeterministicProfileAnalysisFallback(context);
}

/**
 * Intelligent deterministic fallback generator customized to builder domain, skills, projects, and goals.
 * Guarantees zero downtime when API keys are being provisioned or quota is exceeded.
 */
export function generateDeterministicProfileAnalysisFallback(
  context: UserProfileContext
): AiProfileAnalysis {
  const domain = (context.careerDomain || "").toLowerCase();
  const rawSkills = context.skills.map((s) => s.name.trim()).filter(Boolean);
  const projects = context.projects || [];
  const primaryGoal = context.primaryGoal || "Accelerate career milestones";
  const name = context.fullName || "Builder";

  // Build personalized profile summary
  const skillsSnippet =
    rawSkills.length > 0
      ? `specializing in ${rawSkills.slice(0, 3).join(", ")}`
      : `focused on ${context.careerDomain || "technology & innovation"}`;
  const projectsSnippet =
    projects.length > 0
      ? ` With demonstrated portfolio experience across ${projects.length} documented project${
          projects.length > 1 ? "s" : ""
        } (including "${projects[0].title}"), they demonstrate strong practical execution.`
      : " They are actively seeking initial collaborative build experiences.";

  const profile_summary = `${name} is an ambitious builder in the ${
    context.careerDomain || "Tech"
  } domain, ${skillsSnippet}.${projectsSnippet} Their stated focus is to "${primaryGoal}".`;

  // Domain-specific intelligence profiles
  if (
    domain.includes("ai") ||
    domain.includes("machine learning") ||
    domain.includes("data")
  ) {
    return {
      profile_summary,
      career_direction:
        "Specialized Applied AI & Machine Learning Engineering, targeting autonomous agents, deep learning pipelines, and production inference systems.",
      strengths: [
        "Mathematical foundation & algorithmic problem-solving",
        "Experience building with modern data workflows and AI models",
        "Fast learning speed when evaluating emerging ML research & frameworks",
        "Pragmatic approach to fine-tuning vs. prompt orchestration",
      ],
      current_skills:
        rawSkills.length > 0
          ? rawSkills
          : ["Python", "PyTorch", "Data Analysis", "Prompt Engineering"],
      skill_gaps: [
        "Distributed model inference & quantization (vLLM, Ollama)",
        "Vector database indexing & hybrid semantic search",
        "MLOps, containerization, and evaluation benchmarking",
      ],
      recommended_skills: [
        "Advanced RAG Architectures & GraphRAG",
        "LoRA / QLoRA Fine-tuning on custom datasets",
        "FastAPI & gRPC microservices for ML serving",
        "Evaluation frameworks (Ragas, TruLens)",
      ],
      collaboration_preferences: [
        "Complements full-stack software engineers who can integrate backend APIs into delightful client interfaces.",
        "Works effectively with product managers & domain experts who define evaluation criteria and workflow benchmarks.",
        "Thrives in rapid 48-hour hackathons building autonomous agent prototypes.",
      ],
      recommended_next_actions: [
        "Benchmark your current project's inference latency and publish an evaluation matrix.",
        "Add an interactive demo or link to an open-source model repository in your ConnectOne profile.",
        "Connect with a complementary Full-Stack or UI/UX collaborator to ship an end-to-end AI SaaS prototype.",
        "Formulate a target goal of participating in an upcoming AI track hackathon.",
      ],
    };
  }

  if (
    domain.includes("software") ||
    domain.includes("web") ||
    domain.includes("fullstack") ||
    domain.includes("frontend") ||
    domain.includes("backend")
  ) {
    return {
      profile_summary,
      career_direction:
        "Full-Stack Software Architecture & Modern Web Systems, advancing towards high-velocity product engineering and scalable distributed services.",
      strengths: [
        "End-to-end application lifecycle management from database to UI",
        "Component-driven frontend architecture with responsive design systems",
        "API contract design, server actions, and relational data modeling",
        "Continuous delivery mindset with automated verification & tests",
      ],
      current_skills:
        rawSkills.length > 0
          ? rawSkills
          : ["TypeScript", "Next.js", "React", "PostgreSQL", "Node.js"],
      skill_gaps: [
        "Distributed caching & optimistic concurrency control",
        "Event-driven architecture (Kafka, RabbitMQ, Redis Pub/Sub)",
        "End-to-end automated testing pipelines (Playwright / Cypress)",
      ],
      recommended_skills: [
        "Serverless & Edge Compute deployment patterns",
        "PostgreSQL query optimization & index tuning",
        "Micro-frontend / design system token architecture",
        "Cloud infrastructure as code (Terraform, Pulumi)",
      ],
      collaboration_preferences: [
        "Pairs seamlessly with UI/UX designers to translate design systems into clean, accessible code.",
        "Complements AI/ML specialists by building robust API wrappers, state management, and real-time streaming interfaces.",
        "Valued in teams as a reliable full-stack executor capable of turning concepts into shipped MVPs.",
      ],
      recommended_next_actions: [
        "Deploy a live production build of your latest project with an interactive showcase link.",
        "Conduct a performance audit and optimize Largest Contentful Paint (LCP) and hydration metrics.",
        "Partner with a designer on ConnectOne to elevate the visual polish of your portfolio artifacts.",
        "Target hackathons with strong developer tooling or SaaS product tracks.",
      ],
    };
  }

  if (
    domain.includes("design") ||
    domain.includes("ui") ||
    domain.includes("ux") ||
    domain.includes("product")
  ) {
    return {
      profile_summary,
      career_direction:
        "Lead Product Design & Digital Design Systems, bridging research, interaction craft, and high-fidelity prototype engineering.",
      strengths: [
        "User empathy and structured design thinking methodologies",
        "High-fidelity visual design, editorial typography, and spatial composition",
        "Design tokens architecture and cohesive multi-theme design kits",
        "Translating complex data workflows into intuitive user interfaces",
      ],
      current_skills:
        rawSkills.length > 0
          ? rawSkills
          : ["Figma", "UI/UX Design", "Wireframing", "Design Systems", "Prototyping"],
      skill_gaps: [
        "Advanced micro-interactions and motion design (Framer Motion / Rive)",
        "Design system token synchronization with CSS and Tailwind",
        "Quantitative UX metrics and A/B test validation frameworks",
      ],
      recommended_skills: [
        "Design Tokens & Token Studio for Figma",
        "WCAG 2.2 AAA accessibility compliance standards",
        "Interactive component prototyping in code (HTML/Tailwind)",
        "User research synthesis & usability testing protocols",
      ],
      collaboration_preferences: [
        "Essential partner for technical engineers who need cohesive design leadership and user flow clarity.",
        "Collaborates effectively with founders and product strategists to define product vision and positioning.",
        "Excels in team dynamics prioritizing user polish, accessibility, and delightful brand storytelling.",
      ],
      recommended_next_actions: [
        "Curate a 3-part case study detailing problem definition, iterative wireframes, and measurable outcomes.",
        "Publish interactive prototypes on Figma Community or showcase them on your ConnectOne portfolio.",
        "Connect with a full-stack engineer on ConnectOne to co-build a hackathon product with world-class UX.",
        "Conduct user interviews with peers to refine your current portfolio projects.",
      ],
    };
  }

  if (
    domain.includes("cyber") ||
    domain.includes("security") ||
    domain.includes("cloud")
  ) {
    return {
      profile_summary,
      career_direction:
        "Cybersecurity Architecture & Cloud Defense, specializing in application security, penetration testing, and zero-trust infrastructure.",
      strengths: [
        "Adversarial mindset & threat modeling across network boundaries",
        "Thorough understanding of cryptographic primitives and auth protocols",
        "Proactive vulnerability assessment and automated security audits",
        "Strong system administration and Linux internals knowledge",
      ],
      current_skills:
        rawSkills.length > 0
          ? rawSkills
          : ["Network Security", "Linux", "Python", "Vulnerability Assessment"],
      skill_gaps: [
        "Cloud security posture management (CSPM) across multi-cloud",
        "Automated SAST/DAST integration in modern CI/CD pipelines",
        "Incident response playbooks and digital forensics",
      ],
      recommended_skills: [
        "Zero-Trust Architecture & IAM Governance",
        "Container security (Docker / Kubernetes isolation)",
        "Reverse engineering & malware analysis fundamentals",
        "SOC 2 / ISO 27001 compliance and audit preparation",
      ],
      collaboration_preferences: [
        "Critical guardian on engineering teams to ensure secure-by-default architecture.",
        "Collaborates with DevOps/Infrastructure specialists on zero-downtime hardening.",
        "Excels in CTF teams and cybersecurity challenge sprints.",
      ],
      recommended_next_actions: [
        "Conduct a security and dependency audit of your active repositories using automated tooling.",
        "Document a threat modeling exercise for a modern web or cloud service in your profile portfolio.",
        "Join a cybersecurity-focused cohort or CTF team on ConnectOne.",
        "Publish write-ups of captured flags or vulnerability remediation strategies.",
      ],
    };
  }

  // Default / Generalist Builder Profile
  return {
    profile_summary,
    career_direction:
      "Strategic Innovation & Cross-Functional Collaboration, leveraging multidisciplinary capabilities to drive high-impact initiatives.",
    strengths: [
      "Cross-functional communication and strategic problem decomposition",
      "Adaptability across rapidly evolving tools, platforms, and domains",
      "Goal-driven execution focused on tangible outputs and community impact",
      "Curiosity and continuous self-directed learning",
    ],
    current_skills:
      rawSkills.length > 0
        ? rawSkills
        : ["Strategic Planning", "Project Management", "Digital Tools", "Communication"],
    skill_gaps: [
      "Specialized domain tooling and automated workflow pipelines",
      "Quantitative metric tracking and performance benchmarking",
      "Technical portfolio documentation and artifact publishing",
    ],
    recommended_skills: [
      "Data-informed decision making and KPI dashboarding",
      "Agile product management and sprint orchestration",
      "Modern collaborative software stacks (Next.js, Supabase, Git)",
      "High-impact technical storytelling and proposal drafting",
    ],
    collaboration_preferences: [
      "Thrives in interdisciplinary squads requiring bridging between technical and creative disciplines.",
      "Complements deep specialists by managing timeline alignment, scope, and stakeholder presentation.",
      "Well-suited for leadership, team organization, and product strategy in hackathons.",
    ],
    recommended_next_actions: [
      "Define 2-3 concrete, measurable milestones for your current primary goal on your ConnectOne roadmap.",
      "Add detailed descriptions and key achievement metrics to your documented projects.",
      "Explore the Opportunities Hub to discover hackathons and fellowships matching your aspirations.",
      "Initiate collaboration requests with 2-3 builders whose complementary skills balance your own.",
    ],
  };
}
