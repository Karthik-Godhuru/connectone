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
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold text-white border border-slate-700">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white sm:text-2xl">{profile.full_name}</h1>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                  {profile.career_domain || "Member"}
                </span>
              </div>
              {profile.headline && (
                <p className="mt-1 text-xs text-slate-300">{profile.headline}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">{profile.email}</p>

              {/* Meta pills */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {profile.education && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
                    {profile.education}
                  </span>
                )}
                {profile.date_of_birth && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {profile.date_of_birth}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            )}
            <Link
              href="/intelligence"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Analysis</span>
            </Link>
          </div>
        </div>

        {/* Links row */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-800/80 pt-4 text-xs">
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
          {profile.portfolio_url && (
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Portfolio</span>
            </a>
          )}
        </div>
      </div>

      {/* Edit Form Modal/Drawer if editing */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-700 bg-slate-900 p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white">Edit Profile Details</h2>
            <span className="text-xs text-slate-400">Save changes to your ConnectOne profile</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Career Domain</label>
              <input
                type="text"
                value={careerDomain}
                onChange={(e) => setCareerDomain(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Education</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Degree or current school"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">About Me / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Primary Goal</label>
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="Target milestone"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Secondary Goal</label>
              <input
                type="text"
                value={secondaryGoal}
                onChange={(e) => setSecondaryGoal(e.target.value)}
                placeholder="Secondary focus"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Tertiary Goal</label>
              <input
                type="text"
                value={tertiaryGoal}
                onChange={(e) => setTertiaryGoal(e.target.value)}
                placeholder="Tertiary objective"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Bio & AI Profile Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bio */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            About Me
          </h2>
          <p className="mt-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {profile.bio || "No bio entered yet. Click Edit Profile to add a summary of your background."}
          </p>
        </div>

        {/* AI Profile Summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>AI Profile Synthesis</span>
            </h2>
            <Link href="/intelligence" className="text-xs font-semibold text-blue-400 hover:underline">
              Analyze
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-300 leading-relaxed">
            {aiSummary ||
              `${profile.full_name} is advancing in ${profile.career_domain || "their specialty"} with an emphasis on ${profile.primary_goal || "collaboration"}.`}
          </p>
        </div>
      </div>

      {/* Goals Hierarchy */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 text-slate-300">
          <Target className="h-4 w-4 text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider">Aspirational Goals</h2>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Primary Goal
            </span>
            <p className="mt-1 font-medium text-white">
              {profile.primary_goal || "Not set yet"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Secondary Goal
            </span>
            <p className="mt-1 font-medium text-slate-200">
              {profile.secondary_goal || "Not set yet"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Tertiary Goal
            </span>
            <p className="mt-1 font-medium text-slate-300">
              {profile.tertiary_goal || "Not set yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Skills & Interests */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Skills Inventory ({skills.length})
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((us: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-white"
                >
                  <span>{us.skills?.name}</span>
                  {us.proficiency_level && (
                    <span className="rounded bg-slate-800 px-1 text-[10px] text-slate-400">
                      {us.proficiency_level}
                    </span>
                  )}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Interests & Domains ({interests.length})
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.length > 0 ? (
              interests.map((ui: any, i: number) => (
                <span
                  key={i}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300"
                >
                  {ui.interests?.name}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500">No interests added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Projects & Portfolio Artifacts ({projects.length})
            </h2>
          </div>
          <Link href="/onboarding" className="text-xs font-semibold text-blue-400 hover:underline">
            Manage Works
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {projects.length > 0 ? (
            projects.map((proj: any) => (
              <div
                key={proj.id}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">{proj.title}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                {proj.description && (
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                )}
                {(proj.technologies || proj.tags) && (proj.technologies || proj.tags).length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(proj.technologies || proj.tags).map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No projects added yet. Showcase your past hacks and builds.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
