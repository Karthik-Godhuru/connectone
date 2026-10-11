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
    <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[#4E1F1A]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#9E532D]/15 blur-3xl" />

      {/* Step Indicator Header */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="editorial-kicker text-[#D5B38B]">
              Profile Setup · Step {currentStep} of {totalSteps}
            </span>
            <h1 className="font-serif mt-1 text-2xl font-normal tracking-tight text-[#DBD3C1] sm:text-3xl">
              {currentStep === 1 && "Identity & Career Domain"}
              {currentStep === 2 && "Skills & Interests"}
              {currentStep === 3 && "Projects & Works"}
              {currentStep === 4 && "Goals & Vision"}
              {currentStep === 5 && "Review & AI Readiness"}
            </h1>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 === currentStep
                    ? "w-8 bg-gradient-to-r from-[#9E532D] to-[#D5B38B] shadow-sm shadow-[#9E532D]/40"
                    : i + 1 < currentStep
                    ? "w-2 bg-[#D5B38B]"
                    : "w-2 bg-[#DBD3C1]/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#DBD3C1]/10 sm:hidden">
          <div
            className="h-full bg-gradient-to-r from-[#9E532D] to-[#D5B38B] transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="relative mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/25 p-4 text-xs text-rose-200 backdrop-blur-md shadow-lg">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Content Box */}
      <div className="glass-panel relative rounded-3xl border border-[#DBD3C1]/15 bg-[#192024]/85 p-6 sm:p-9 shadow-2xl backdrop-blur-2xl">
        {/* ================= STEP 1: Personal & Career ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">
                Full Name *
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">
                  Date of Birth
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">
                  Education / University
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science / Self-Taught"
                    className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">
                Primary Career Domain * (Not limited to tech)
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#DBD3C1]/50">
                  <Briefcase className="h-4 w-4" />
                </div>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-[#DBD3C1] focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
                >
                  {CAREER_DOMAINS.map((domain) => (
                    <option key={domain} value={domain} className="bg-[#192024] text-[#DBD3C1]">
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
                    className="glass-input block w-full rounded-xl p-3 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">
                Bio / About Me
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short summary of who you are, what drives you, and what kind of projects you love to build..."
                className="glass-input mt-2 block w-full rounded-xl p-3 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] transition"
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
                  <h3 className="text-sm font-bold text-[#DBD3C1]">Your Skills &amp; Proficiencies</h3>
                  <p className="text-xs text-[#8FAAB5]">Add technical or creative talents</p>
                </div>
                <span className="glass-pill px-2.5 py-0.5 text-xs text-[#D5B38B] font-semibold">{skills.length} added</span>
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
                  className="glass-input flex-1 rounded-xl px-3.5 py-2.5 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) =>
                    setNewSkillLevel(e.target.value as SkillItem["proficiencyLevel"])
                  }
                  className="glass-input rounded-xl px-3.5 py-2.5 text-sm text-[#DBD3C1] focus:border-[#D5B38B] focus:outline-none"
                >
                  <option value="Beginner" className="bg-[#192024]">Beginner</option>
                  <option value="Intermediate" className="bg-[#192024]">Intermediate</option>
                  <option value="Advanced" className="bg-[#192024]">Advanced</option>
                  <option value="Expert" className="bg-[#192024]">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="glass-button-primary inline-flex items-center justify-center gap-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#9E532D]/20"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[#8FAAB5] text-[11px]">Suggestions:</span>
                {SUGGESTED_SKILLS.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddSkill(item)}
                    className="glass-pill rounded-lg px-2.5 py-1 text-[11px] text-[#8FAAB5] transition hover:text-[#DBD3C1]"
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
                    className="inline-flex items-center gap-2 rounded-xl border border-[#DBD3C1]/15 bg-[#192024]/60 px-3 py-1.5 text-xs text-[#DBD3C1] backdrop-blur-md"
                  >
                    <span className="font-medium">{skill.name}</span>
                    <span className="rounded bg-[#DBD3C1]/10 px-1.5 py-0.5 text-[10px] text-[#D5B38B]">
                      {skill.proficiencyLevel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-[#8FAAB5] hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="border-t border-[#DBD3C1]/10 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#DBD3C1]">Domains of Interest</h3>
                  <p className="text-xs text-[#8FAAB5]">Topics you are excited to explore</p>
                </div>
                <span className="glass-pill px-2.5 py-0.5 text-xs text-[#B86539] font-semibold">{interests.length} added</span>
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
                  className="glass-input flex-1 rounded-xl px-3.5 py-2.5 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddInterest()}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#9E532D] to-[#B86539] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#9E532D]/20 transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Suggestions */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[#8FAAB5] text-[11px]">Suggestions:</span>
                {SUGGESTED_INTERESTS.slice(0, 6).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddInterest(item)}
                    className="glass-pill rounded-lg px-2.5 py-1 text-[11px] text-[#8FAAB5] transition hover:text-[#DBD3C1]"
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
                    className="inline-flex items-center gap-2 rounded-xl border border-[#DBD3C1]/15 bg-[#192024]/60 px-3 py-1.5 text-xs text-[#DBD3C1] backdrop-blur-md"
                  >
                    <span>{int}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(idx)}
                      className="text-[#8FAAB5] hover:text-rose-400 transition"
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
                  <h3 className="text-sm font-bold text-[#DBD3C1]">Showcase Your Projects</h3>
                  <p className="text-xs text-[#8FAAB5]">
                    Add prior builds, prototypes, or hackathon concepts (Optional)
                  </p>
                </div>
                <span className="glass-pill px-2.5 py-0.5 text-xs text-[#D5B38B] font-semibold">{projects.length} added</span>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#DBD3C1]/10 bg-[#192024]/40 p-4 sm:p-5 backdrop-blur-md">
              <input
                type="text"
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                placeholder="Project Title (e.g. DevConnect AI)"
                className="glass-input block w-full rounded-xl p-3 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
              />
              <textarea
                rows={2}
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                placeholder="Brief description of the problem solved and core features..."
                className="glass-input block w-full rounded-xl p-3 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="url"
                  value={projRepo}
                  onChange={(e) => setProjRepo(e.target.value)}
                  placeholder="GitHub Repository URL (Optional)"
                  className="glass-input block w-full rounded-xl p-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
                />
                <input
                  type="url"
                  value={projDemo}
                  onChange={(e) => setProjDemo(e.target.value)}
                  placeholder="Live Demo / Website URL (Optional)"
                  className="glass-input block w-full rounded-xl p-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
                />
              </div>
              <input
                type="text"
                value={projTags}
                onChange={(e) => setProjTags(e.target.value)}
                placeholder="Tags separated by commas (e.g. Next.js, Supabase, Tailwind)"
                className="glass-input block w-full rounded-xl p-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddProject}
                  disabled={!projTitle.trim()}
                  className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#9E532D]/20 disabled:opacity-40"
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
                    className="flex items-start justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/50 p-4 text-xs backdrop-blur-md"
                  >
                    <div>
                      <h4 className="font-bold text-[#DBD3C1] text-sm">{proj.title}</h4>
                      {proj.description && (
                        <p className="mt-1 text-[#DBD3C1]/75">{proj.description}</p>
                      )}
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {proj.tags.map((t, i) => (
                            <span
                              key={i}
                              className="rounded-md border border-[#DBD3C1]/10 bg-[#DBD3C1]/5 px-2 py-0.5 text-[10px] text-[#8FAAB5]"
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
                      className="text-[#8FAAB5] hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#DBD3C1]/15 p-6 text-center text-xs text-[#8FAAB5]">
                No projects added yet. You can add projects later anytime from your dashboard.
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: Goals ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#DBD3C1]">Your Growth Aspirations</h3>
              <p className="text-xs text-[#8FAAB5]">
                These goals guide AI matchmaking and personalized career roadmap milestones.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">
                <Target className="h-3.5 w-3.5 text-[#D5B38B]" />
                Primary Goal *
              </label>
              <input
                type="text"
                required
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="e.g. Find complementary teammates to win upcoming AI hackathon"
                className="glass-input mt-2 block w-full rounded-xl p-3 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#D5B38B] focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B86539]">
                <Target className="h-3.5 w-3.5 text-[#B86539]" />
                Secondary Goal
              </label>
              <input
                type="text"
                value={secondaryGoal}
                onChange={(e) => setSecondaryGoal(e.target.value)}
                placeholder="e.g. Master fullstack AI development &amp; vector databases"
                className="glass-input mt-2 block w-full rounded-xl p-3 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#B86539] focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8FAAB5]">
                <Target className="h-3.5 w-3.5 text-[#8FAAB5]" />
                Tertiary Goal
              </label>
              <input
                type="text"
                value={tertiaryGoal}
                onChange={(e) => setTertiaryGoal(e.target.value)}
                placeholder="e.g. Launch a public venture or secure internship in 2026"
                className="glass-input mt-2 block w-full rounded-xl p-3 text-sm text-[#DBD3C1] placeholder-[#DBD3C1]/35 focus:border-[#8FAAB5] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 5: Review & AI Hook ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#9E532D]/30 bg-[#9E532D]/10 p-5 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 shrink-0 text-[#D5B38B] mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#DBD3C1]">AI Profile Architecture Ready</h3>
                  <p className="mt-1 text-xs text-[#DBD3C1]/80 leading-relaxed">
                    Your skills, interests, and aspirations are structured to feed directly into the
                    ConnectOne AI Matchmaking &amp; Roadmap Engine once activated.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-5 space-y-4 text-xs backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-3">
                <span className="text-[#8FAAB5]">Full Name</span>
                <span className="font-semibold text-[#DBD3C1]">{fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-3">
                <span className="text-[#8FAAB5]">Career Domain</span>
                <span className="font-semibold text-[#D5B38B]">{effectiveDomain}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-3">
                <span className="text-[#8FAAB5]">Education</span>
                <span className="text-[#DBD3C1]">{education || "Not specified"}</span>
              </div>
              <div className="border-b border-[#DBD3C1]/10 pb-3">
                <span className="text-[#8FAAB5] block mb-1">Skills ({skills.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-[#DBD3C1]/15 bg-[#192024]/60 px-2.5 py-1 text-[11px] text-[#DBD3C1]"
                    >
                      {s.name} ({s.proficiencyLevel})
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-b border-[#DBD3C1]/10 pb-3">
                <span className="text-[#8FAAB5] block mb-1">Interests ({interests.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((it, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-[#DBD3C1]/15 bg-[#192024]/60 px-2.5 py-1 text-[11px] text-[#DBD3C1]"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#8FAAB5] block mb-1">Primary Goal</span>
                <p className="text-[#DBD3C1]">{primaryGoal}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/40 p-4 text-[11px] text-[#8FAAB5]">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-[#D5B38B]" />
                <span>Saving into tables: profiles, skills, user_skills, interests, user_interests, projects.</span>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-[#DBD3C1]/10 pt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              disabled={isSubmitting}
              className="glass-button-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#DBD3C1]/70"
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
              className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#9E532D]/20"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="glass-button-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold text-white shadow-xl shadow-[#9E532D]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#D5B38B]" />
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
