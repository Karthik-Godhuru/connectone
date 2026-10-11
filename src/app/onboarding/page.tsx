"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  submitOnboardingAction,
  type OnboardingPayload,
  type SkillItem,
  type ProjectItem,
} from "./actions";
import {
  User,
  Calendar,
  GraduationCap,
  Briefcase,
  Sparkles,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FolderPlus,
  Target,
  Cpu,
  Layers,
  AlertCircle,
} from "lucide-react";

const CAREER_DOMAINS = [
  "AI / Machine Learning",
  "Software Development",
  "Data Science",
  "Cybersecurity",
  "Research",
  "Entrepreneurship",
  "Design / UI UX",
  "Art",
  "Dance",
  "Singing / Music",
  "Content Creation",
  "Marketing",
  "Other",
];

const SUGGESTED_INTERESTS = [
  "Hackathons",
  "Generative AI",
  "Open Source",
  "Product Design",
  "Creative Tech",
  "EdTech",
  "FinTech",
  "Music Production",
  "Motion Graphics",
  "Startup Growth",
  "Sustainability",
  "Robotics",
];

const SUGGESTED_SKILLS = [
  "React",
  "TypeScript",
  "Python",
  "Node.js",
  "UI/UX Design",
  "Figma",
  "SQL",
  "Machine Learning",
  "Video Editing",
  "Creative Writing",
  "Public Speaking",
  "Product Strategy",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form states
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [education, setEducation] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("Software Development");
  const [customDomain, setCustomDomain] = useState("");
  const [bio, setBio] = useState("");

  // Skills state
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: "React", proficiencyLevel: "Intermediate" },
    { name: "TypeScript", proficiencyLevel: "Intermediate" },
  ]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillItem["proficiencyLevel"]>("Intermediate");

  // Interests state
  const [interests, setInterests] = useState<string[]>([
    "Hackathons",
    "Generative AI",
    "Product Design",
  ]);
  const [newInterestName, setNewInterestName] = useState("");

  // Projects state
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projRepo, setProjRepo] = useState("");
  const [projDemo, setProjDemo] = useState("");
  const [projTags, setProjTags] = useState("");

  // Goals state
  const [primaryGoal, setPrimaryGoal] = useState("Find teammates for upcoming hackathon");
  const [secondaryGoal, setSecondaryGoal] = useState("Improve technical & collaborative skills");
  const [tertiaryGoal, setTertiaryGoal] = useState("Build a production-grade portfolio project");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveDomain = selectedDomain === "Other" ? customDomain || "Other" : selectedDomain;

  const handleAddSkill = (name?: string) => {
    const skillToAdd = (name || newSkillName).trim();
    if (!skillToAdd) return;
    if (skills.some((s) => s.name.toLowerCase() === skillToAdd.toLowerCase())) return;

    setSkills([...skills, { name: skillToAdd, proficiencyLevel: newSkillLevel }]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddInterest = (name?: string) => {
    const intToAdd = (name || newInterestName).trim();
    if (!intToAdd) return;
    if (interests.some((i) => i.toLowerCase() === intToAdd.toLowerCase())) return;

    setInterests([...interests, intToAdd]);
    setNewInterestName("");
  };

  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    if (!projTitle.trim()) return;
    const newProj: ProjectItem = {
      title: projTitle.trim(),
      description: projDesc.trim(),
      repoUrl: projRepo.trim() || undefined,
      demoUrl: projDemo.trim() || undefined,
      tags: projTags
        ? projTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };
    setProjects([...projects, newProj]);
    setProjTitle("");
    setProjDesc("");
    setProjRepo("");
    setProjDemo("");
    setProjTags("");
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const validateStep = (step: number) => {
    setErrorMessage(null);
    if (step === 1) {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name.");
        return false;
      }
      if (selectedDomain === "Other" && !customDomain.trim()) {
        setErrorMessage("Please specify your career domain.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: OnboardingPayload = {
      fullName,
      dateOfBirth,
      education,
      careerDomain: effectiveDomain,
      bio,
      skills,
      interests: interests.map((i) => ({ name: i })),
      projects,
      primaryGoal,
      secondaryGoal,
      tertiaryGoal,
    };

    try {
      const result = await submitOnboardingAction(payload);
      if (result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Step Indicator Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Profile Setup · Step {currentStep} of {totalSteps}
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {currentStep === 1 && "Identity & Career Domain"}
              {currentStep === 2 && "Skills & Interests"}
              {currentStep === 3 && "Projects & Works"}
              {currentStep === 4 && "Goals & Vision"}
              {currentStep === 5 && "Review & AI Readiness"}
            </h1>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i + 1 === currentStep
                    ? "w-8 bg-blue-500"
                    : i + 1 < currentStep
                    ? "w-2.5 bg-emerald-500"
                    : "w-2.5 bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800 sm:hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Content Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        {/* ================= STEP 1: Personal & Career ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Full Name *
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Date of Birth
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Education / University
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science / Self-Taught"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Primary Career Domain * (Not limited to tech)
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Briefcase className="h-4 w-4" />
                </div>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CAREER_DOMAINS.map((domain) => (
                    <option key={domain} value={domain} className="bg-slate-950 text-white">
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDomain === "Other" && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="Specify your unique domain (e.g. Bioengineering, Film, Architecture)"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Bio / About Me
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short summary of who you are, what drives you, and what kind of projects you love to build..."
                className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2: Skills & Interests ================= */}
        {currentStep === 2 && (
          <div className="space-y-8">
            {/* Skills */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Your Skills & Proficiencies</h3>
                  <p className="text-xs text-slate-400">Add technical or creative talents</p>
                </div>
                <span className="text-xs text-blue-400">{skills.length} added</span>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Python, Figma, 3D Modeling"
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) =>
                    setNewSkillLevel(e.target.value as SkillItem["proficiencyLevel"])
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 text-[11px]">Suggestions:</span>
                {SUGGESTED_SKILLS.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddSkill(item)}
                    className="rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-0.5 text-[11px] text-slate-400 transition hover:border-slate-700 hover:text-white"
                  >
                    + {item}
                  </button>
                ))}
              </div>

              {/* Added skills pill list */}
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  >
                    <span className="font-medium">{skill.name}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-blue-400">
                      {skill.proficiencyLevel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="border-t border-slate-800/80 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Domains of Interest</h3>
                  <p className="text-xs text-slate-400">Topics you are excited to explore</p>
                </div>
                <span className="text-xs text-indigo-400">{interests.length} added</span>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newInterestName}
                  onChange={(e) => setNewInterestName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  placeholder="e.g. Hackathons, Sustainability, Generative AI"
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddInterest()}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Suggestions */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 text-[11px]">Suggestions:</span>
                {SUGGESTED_INTERESTS.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddInterest(item)}
                    className="rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-0.5 text-[11px] text-slate-400 transition hover:border-slate-700 hover:text-white"
                  >
                    + {item}
                  </button>
                ))}
              </div>

              {/* Added interests pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {interests.map((int, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-indigo-300"
                  >
                    <span>{int}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: Projects ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Showcase Your Projects</h3>
                  <p className="text-xs text-slate-400">
                    Add prior builds, prototypes, or hackathon concepts (Optional)
                  </p>
                </div>
                <span className="text-xs text-cyan-400">{projects.length} added</span>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
              <input
                type="text"
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                placeholder="Project Title (e.g. DevConnect AI)"
                className="block w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <textarea
                rows={2}
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                placeholder="Brief description of the problem solved and core features..."
                className="block w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="url"
                  value={projRepo}
                  onChange={(e) => setProjRepo(e.target.value)}
                  placeholder="GitHub Repository URL (Optional)"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  value={projDemo}
                  onChange={(e) => setProjDemo(e.target.value)}
                  placeholder="Live Demo / Website URL (Optional)"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <input
                type="text"
                value={projTags}
                onChange={(e) => setProjTags(e.target.value)}
                placeholder="Tags separated by commas (e.g. Next.js, Supabase, Tailwind)"
                className="block w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddProject}
                  disabled={!projTitle.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  Add Project
                </button>
              </div>
            </div>

            {/* List of added projects */}
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                      {proj.description && (
                        <p className="mt-1 text-slate-400">{proj.description}</p>
                      )}
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                No projects added yet. You can add projects later anytime from your dashboard.
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: Goals ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Your Growth Aspirations</h3>
              <p className="text-xs text-slate-400">
                These goals guide AI matchmaking and personalized career roadmap milestones.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Target className="h-3.5 w-3.5 text-blue-400" />
                Primary Goal *
              </label>
              <input
                type="text"
                required
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="e.g. Find complementary teammates to win upcoming AI hackathon"
                className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Target className="h-3.5 w-3.5 text-indigo-400" />
                Secondary Goal
              </label>
              <input
                type="text"
                value={secondaryGoal}
                onChange={(e) => setSecondaryGoal(e.target.value)}
                placeholder="e.g. Master fullstack AI development & vector databases"
                className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Target className="h-3.5 w-3.5 text-cyan-400" />
                Tertiary Goal
              </label>
              <input
                type="text"
                value={tertiaryGoal}
                onChange={(e) => setTertiaryGoal(e.target.value)}
                placeholder="e.g. Launch a public venture or secure internship in 2026"
                className="mt-2 block w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 5: Review & AI Hook ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">AI Profile Architecture Ready</h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Your skills, interests, and aspirations are structured to feed directly into the
                    ConnectOne AI Matchmaking & Roadmap Engine once activated.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-slate-400">Full Name</span>
                <span className="font-semibold text-white">{fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-slate-400">Career Domain</span>
                <span className="font-semibold text-blue-400">{effectiveDomain}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-slate-400">Education</span>
                <span className="text-white">{education || "Not specified"}</span>
              </div>
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-slate-400 block mb-1">Skills ({skills.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="rounded bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {s.name} ({s.proficiencyLevel})
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-slate-400 block mb-1">Interests ({interests.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((it, i) => (
                    <span
                      key={i}
                      className="rounded bg-slate-900 px-2 py-0.5 text-[11px] text-indigo-300"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Primary Goal</span>
                <p className="text-white">{primaryGoal}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-400" />
                <span>Saving into tables: profiles, skills, user_skills, interests, user_interests, projects.</span>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Profile to Supabase...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Complete Onboarding</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
