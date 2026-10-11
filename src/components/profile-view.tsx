"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Globe,
  ExternalLink,
  Edit3,
  Check,
  X,
  Target,
  Sparkles,
  Layers,
  Rocket,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ProfileViewProps {
  initialProfile: any;
  skills: any[];
  interests: any[];
  projects: any[];
  aiSummary?: string | null;
}

export function ProfileView({
  initialProfile,
  skills,
  interests,
  projects,
  aiSummary,
}: ProfileViewProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [careerDomain, setCareerDomain] = useState(profile.career_domain || "");
  const [education, setEducation] = useState(profile.education || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [primaryGoal, setPrimaryGoal] = useState(profile.primary_goal || "");
  const [secondaryGoal, setSecondaryGoal] = useState(profile.secondary_goal || "");
  const [tertiaryGoal, setTertiaryGoal] = useState(profile.tertiary_goal || "");
  const [githubUrl, setGithubUrl] = useState(profile.github_url || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedin_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolio_url || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          career_domain: careerDomain,
          education,
          bio,
          primary_goal: primaryGoal,
          secondary_goal: secondaryGoal,
          tertiary_goal: tertiaryGoal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setProfile(data.profile);
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/25 px-4 py-3 text-xs text-emerald-200 backdrop-blur-xl shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/25 px-4 py-3 text-xs text-rose-200 backdrop-blur-xl shadow-lg">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="glass-panel relative overflow-hidden rounded-3xl border border-[#DBD3C1]/15 bg-[#192024]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Subtle radial ambient glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#4E1F1A]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#9E532D]/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9E532D]/40 via-[#4E1F1A]/40 to-[#D5B38B]/20 text-xl font-serif font-bold text-[#D5B38B] shadow-lg shadow-[#9E532D]/20 ring-1 ring-[#DBD3C1]/20">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-2xl font-normal tracking-tight text-[#DBD3C1] sm:text-3xl">{profile.full_name}</h1>
                <span className="glass-pill px-3 py-0.5 text-[11px] font-semibold text-[#D5B38B]">
                  {profile.career_domain || "Member"}
                </span>
              </div>
              {profile.headline && (
                <p className="mt-1 text-xs sm:text-sm text-[#DBD3C1]/80">{profile.headline}</p>
              )}
              {profile.email && (
                <p className="mt-1 text-xs text-[#8FAAB5]">{profile.email}</p>
              )}

              {/* Meta pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-[#DBD3C1]/80">
                {profile.education && (
                  <span className="glass-pill flex items-center gap-1.5 px-3 py-1 text-[11px]">
                    <GraduationCap className="h-3.5 w-3.5 text-[#D5B38B]" />
                    {profile.education}
                  </span>
                )}
                {profile.date_of_birth && (
                  <span className="glass-pill flex items-center gap-1.5 px-3 py-1 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-[#9E532D]" />
                    {profile.date_of_birth}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="glass-button-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[#DBD3C1]"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#D5B38B]" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="glass-button-secondary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[#DBD3C1]/70"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            )}
            <Link
              href="/intelligence"
              className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#9E532D]/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#D5B38B]" />
              <span>AI Analysis</span>
            </Link>
          </div>
        </div>

        {/* Links row */}
        {(profile.github_url || profile.linkedin_url || profile.portfolio_url) && (
          <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-[#DBD3C1]/10 pt-4 text-xs">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer"
                className="glass-pill flex items-center gap-1.5 px-3 py-1 text-[#DBD3C1]/80 hover:text-[#D5B38B] transition"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#D5B38B]" />
                <span>GitHub</span>
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="glass-pill flex items-center gap-1.5 px-3 py-1 text-[#DBD3C1]/80 hover:text-[#D5B38B] transition"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#D5B38B]" />
                <span>LinkedIn</span>
              </a>
            )}
            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noreferrer"
                className="glass-pill flex items-center gap-1.5 px-3 py-1 text-[#DBD3C1]/80 hover:text-[#D5B38B] transition"
              >
                <Globe className="h-3.5 w-3.5 text-[#D5B38B]" />
                <span>Portfolio</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Edit Form Modal/Drawer if editing */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="glass-card rounded-3xl border border-[#DBD3C1]/15 bg-[#192024]/95 p-6 sm:p-8 space-y-6 backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-4">
            <div>
              <span className="editorial-kicker text-[#D5B38B]">Settings</span>
              <h2 className="font-serif text-xl font-normal text-[#DBD3C1]">Edit Profile Details</h2>
            </div>
            <span className="text-xs text-[#8FAAB5]">Save changes to your ConnectOne profile</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="glass-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/30 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">Career Domain</label>
              <input
                type="text"
                value={careerDomain}
                onChange={(e) => setCareerDomain(e.target.value)}
                required
                className="glass-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/30 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">Education</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Degree or current school"
                className="glass-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/30 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">About Me / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="glass-input mt-1.5 w-full rounded-xl p-3.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/30 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">Primary Goal</label>
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="Target milestone"
                className="glass-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/30 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">Secondary Goal</label>
              <input
                type="text"
                value={secondaryGoal}
                onChange={(e) => setSecondaryGoal(e.target.value)}
                placeholder="Secondary focus"
                className="glass-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/30 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5B38B]">Tertiary Goal</label>
              <input
                type="text"
                value={tertiaryGoal}
                onChange={(e) => setTertiaryGoal(e.target.value)}
                placeholder="Tertiary objective"
                className="glass-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-xs text-[#DBD3C1] placeholder-[#DBD3C1]/30 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DBD3C1]/10">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="glass-button-secondary rounded-xl px-4 py-2 text-xs font-semibold text-[#DBD3C1]/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#9E532D]/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D5B38B]" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Bio & AI Profile Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bio */}
        <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 backdrop-blur-xl">
          <span className="editorial-kicker text-[#D5B38B]">
            About Me
          </span>
          <p className="mt-3 text-xs sm:text-sm text-[#DBD3C1]/90 leading-relaxed whitespace-pre-line">
            {profile.bio || "No bio entered yet. Click Edit Profile to add a summary of your background."}
          </p>
        </div>

        {/* AI Profile Summary */}
        <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#D5B38B]" />
              <span className="editorial-kicker text-[#D5B38B]">AI Profile Synthesis</span>
            </div>
            <Link href="/intelligence" className="text-xs font-semibold text-[#D5B38B] hover:underline">
              Analyze
            </Link>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-[#DBD3C1]/90 leading-relaxed">
            {aiSummary ||
              `${profile.full_name} is advancing in ${profile.career_domain || "their specialty"} with an emphasis on ${profile.primary_goal || "collaboration"}.`}
          </p>
        </div>
      </div>

      {/* Goals Hierarchy */}
      <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[#8FAAB5]">
          <Target className="h-4 w-4 text-[#D5B38B]" />
          <span className="editorial-kicker text-[#D5B38B]">Aspirational Goals</span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-4 backdrop-blur-md">
            <span className="editorial-kicker text-[#D5B38B]">
              Primary Goal
            </span>
            <p className="mt-2 font-medium text-[#DBD3C1]">
              {profile.primary_goal || "Not set yet"}
            </p>
          </div>

          <div className="rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-4 backdrop-blur-md">
            <span className="editorial-kicker text-[#B86539]">
              Secondary Goal
            </span>
            <p className="mt-2 font-medium text-[#DBD3C1]/90">
              {profile.secondary_goal || "Not set yet"}
            </p>
          </div>

          <div className="rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-4 backdrop-blur-md">
            <span className="editorial-kicker text-[#8FAAB5]">
              Tertiary Goal
            </span>
            <p className="mt-2 font-medium text-[#DBD3C1]/80">
              {profile.tertiary_goal || "Not set yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Skills & Interests */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills */}
        <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 backdrop-blur-xl">
          <span className="editorial-kicker text-[#D5B38B]">
            Skills Inventory ({skills.length})
          </span>
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((us: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DBD3C1]/15 bg-[#192024]/60 px-3 py-1.5 text-xs text-[#DBD3C1] backdrop-blur-md"
                >
                  <span>{us.skills?.name}</span>
                  {us.proficiency_level && (
                    <span className="rounded bg-[#DBD3C1]/10 px-1.5 py-0.5 text-[10px] text-[#D5B38B]">
                      {us.proficiency_level}
                    </span>
                  )}
                </span>
              ))
            ) : (
              <p className="text-xs text-[#8FAAB5]">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 backdrop-blur-xl">
          <span className="editorial-kicker text-[#B86539]">
            Interests &amp; Domains ({interests.length})
          </span>
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.length > 0 ? (
              interests.map((ui: any, i: number) => (
                <span
                  key={i}
                  className="rounded-lg border border-[#DBD3C1]/15 bg-[#192024]/60 px-3 py-1.5 text-xs text-[#DBD3C1]/90 backdrop-blur-md"
                >
                  {ui.interests?.name}
                </span>
              ))
            ) : (
              <p className="text-xs text-[#8FAAB5]">No interests added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="glass-card rounded-2xl border border-[#DBD3C1]/10 bg-[#20282D]/70 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-[#D5B38B]" />
            <span className="editorial-kicker text-[#D5B38B]">
              Projects &amp; Portfolio Artifacts ({projects.length})
            </span>
          </div>
          <Link href="/onboarding" className="text-xs font-semibold text-[#D5B38B] hover:underline">
            Manage Works
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {projects.length > 0 ? (
            projects.map((proj: any) => (
              <div
                key={proj.id}
                className="rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/50 p-4 backdrop-blur-md transition hover:border-[#DBD3C1]/20"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#DBD3C1] text-sm">{proj.title}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8FAAB5] hover:text-[#DBD3C1] transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                {proj.description && (
                  <p className="mt-1.5 text-xs text-[#DBD3C1]/75 leading-relaxed">{proj.description}</p>
                )}
                {(proj.technologies || proj.tags) && (proj.technologies || proj.tags).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(proj.technologies || proj.tags).map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-md border border-[#DBD3C1]/10 bg-[#DBD3C1]/5 px-2 py-0.5 text-[10px] text-[#8FAAB5]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-[#8FAAB5] py-4 text-center">
              No projects added yet. Showcase your past hacks and builds.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
