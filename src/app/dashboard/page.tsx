import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import { getMatchRecommendations } from "@/lib/matching/service";
import { getRecommendedOpportunities } from "@/lib/opportunities/engine";
import {
  User,
  Users,
  Compass,
  Award,
  UserCheck,
  TrendingUp,
  Target,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  LogOut,
  FolderGit2,
  Bot,
  Zap,
} from "lucide-react";
import { CompanionDashboardSection } from "@/components/companion/companion-dashboard-section";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.full_name) {
    redirect("/onboarding");
  }

  // 2. Fetch user skills
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select("level, skills(name, category)")
    .eq("user_id", user.id);

  // 3. Fetch user interests
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interests(name, category)")
    .eq("user_id", user.id);

  // 4. Fetch user projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 5. Fetch Career Roadmap
  const { data: roadmapRecord } = await supabase
    .from("career_roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let rawNextAction = roadmapRecord?.next_action || "";
  let milestonesList: any[] = [];
  if (rawNextAction.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(rawNextAction);
      if (parsed.action) rawNextAction = parsed.action;
      if (Array.isArray(parsed.milestones)) milestonesList = parsed.milestones;
    } catch (e) {}
  }
  const completedMilestones = milestonesList.filter((m: any) => m.completed).length;
  const totalMilestones = milestonesList.length;
  const roadmapProgressPercent =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // 6. Fetch Recommended People
  let recommendedPeople: any[] = [];
  try {
    const { matches } = await getMatchRecommendations(user.id, { limit: 2 });
    recommendedPeople = matches || [];
  } catch (err) {
    console.error("Dashboard matching fetch error:", err);
  }

  // 7. Fetch Opportunities
  const userContext = {
    careerDomain: profile.career_domain || "General Innovation",
    primaryGoal: profile.primary_goal,
    skills: (userSkills || []).map((us: any) => ({
      name: us.skills?.name ?? "Skill",
      proficiencyLevel: us.level,
    })),
    interests: (userInterests || []).map((ui: any) => ({
      name: ui.interests?.name ?? "Interest",
    })),
    currentStage: roadmapRecord?.current_stage || "Emerging Practitioner",
  };
  const topOpportunities = getRecommendedOpportunities(userContext).slice(0, 2);

  // 8. Fetch Recent Connections
  const { data: recentConnsData } = await supabase
    .from("connections")
    .select("*")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(3);

  const otherIds = Array.from(
    new Set(
      (recentConnsData || []).map((c) =>
        c.sender_id === user.id ? c.receiver_id : c.sender_id
      )
    )
  );

  let partnersMap: Record<string, any> = {};
  if (otherIds.length > 0) {
    const { data: partnerProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, career_domain")
      .in("id", otherIds);
    if (partnerProfiles) {
      partnersMap = Object.fromEntries(partnerProfiles.map((p) => [p.id, p]));
    }
  }

  const recentConnections = (recentConnsData || []).map((c) => {
    const isOut = c.sender_id === user.id;
    const otherId = isOut ? c.receiver_id : c.sender_id;
    return {
      id: c.id,
      status: c.status,
      isOutgoing: isOut,
      partner: partnersMap[otherId] || { full_name: "ConnectOne Member" },
    };
  });

  // Calculate Profile Completion Score
  let profileCompletion = 0;
  if (profile.full_name) profileCompletion += 20;
  if (profile.career_domain) profileCompletion += 15;
  if (profile.bio) profileCompletion += 15;
  if (profile.education) profileCompletion += 10;
  if (profile.primary_goal) profileCompletion += 15;
  if (userSkills && userSkills.length > 0) profileCompletion += 15;
  if (projects && projects.length > 0) profileCompletion += 10;

  // Next action
  const nextRecommendedAction =
    rawNextAction ||
    `Review your primary goal "${profile.primary_goal || "Career Growth"}" and generate your personalized Career Roadmap.`;

  // Top strengths (extracted from skills and projects)
  const topStrengths = (userSkills || [])
    .slice(0, 4)
    .map((us: any) => us.skills?.name)
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-7">
      {/* Top Header with Profile Overview & CTAs */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle radial glow illumination */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-[#4E1F1A]/22 via-[#9E532D]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9E532D]/25 via-[#4E1F1A]/20 to-[#D5B38B]/20 border border-[#DBD3C1]/12 shadow-[0_0_24px_rgba(158,83,45,0.2)]">
              <span className="text-xl font-black bg-gradient-to-br from-[#F4EFE6] to-[#D5B38B] bg-clip-text text-transparent">
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl font-medium tracking-tight text-[#DBD3C1] sm:text-3xl">
                  {profile.full_name}
                </h1>
                <span className="glass-pill rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-[#D5B38B] uppercase tracking-wider">
                  {profile.career_domain || "Member"}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8FAAB5]">
                Primary Goal:{" "}
                <span className="text-[#DBD3C1] font-medium">
                  {profile.primary_goal || "Not specified"}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Navigation CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/discover"
              className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-lg shadow-[#9E532D]/20"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Discover People</span>
            </Link>
            <Link
              href="/roadmap"
              className="glass-button-secondary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium"
            >
              <Compass className="h-3.5 w-3.5 text-[#D5B38B]" />
              <span>Career Roadmap</span>
            </Link>
            <Link
              href="/opportunities"
              className="glass-button-secondary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium"
            >
              <Award className="h-3.5 w-3.5 text-[#D5B38B]" />
              <span>Opportunities</span>
            </Link>
            <Link
              href="/profile"
              className="glass-button-secondary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium"
            >
              <User className="h-3.5 w-3.5 text-[#8FAAB5]" />
              <span>Profile</span>
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DBD3C1]/10 bg-[#252E33]/30 px-3 py-2 text-xs font-medium text-[#8FAAB5] transition hover:border-rose-500/40 hover:bg-rose-950/20 hover:text-rose-300"
                title="Sign out of ConnectOne"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 border-t border-[#DBD3C1]/10 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-[#8FAAB5] text-xs">Profile Calibration:</span>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-[#192024] border border-[#DBD3C1]/10 p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-[#9E532D] to-[#D5B38B] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(213,179,139,0.3)]"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <span className="font-bold text-[#DBD3C1] tabular-nums">{profileCompletion}%</span>
          </div>

          {profileCompletion < 100 && (
            <Link href="/profile" className="text-xs text-[#D5B38B] hover:text-[#E4C8A6] flex items-center gap-1">
              <span>Complete profile for higher matching accuracy</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Immediate Next Action Tactical Card */}
      <div className="glass-card rounded-2xl p-5 border border-[#DBD3C1]/12 bg-gradient-to-r from-[#252E33]/90 via-[#252E33]/70 to-[#9E532D]/12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D5B38B]">
              <TrendingUp className="h-3.5 w-3.5 text-[#D5B38B]" />
              <span>Next Recommended Milestone Action</span>
            </div>
            <p className="font-serif text-sm font-medium text-[#DBD3C1] sm:text-base leading-relaxed">
              {nextRecommendedAction}
            </p>
          </div>
          <Link
            href="/roadmap"
            className="glass-button-primary inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
          >
            <span>View Roadmap</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ConnectOne AI Companion Interactive Agent Section */}
      <CompanionDashboardSection
        userName={profile.full_name}
        careerDomain={profile.career_domain || "Innovation"}
      />

      {/* 3-Column Information Row: AI Profile Summary, Top Strengths, Goals */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* AI Profile Summary */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DBD3C1]/08 pb-2.5">
              <span className="editorial-kicker text-[10px] text-[#8FAAB5]">
                AI Profile Summary
              </span>
              <Link href="/intelligence" className="text-xs font-medium text-[#D5B38B] hover:underline">
                Deep Analysis →
              </Link>
            </div>
            <p className="mt-3 text-xs text-[#DBD3C1]/90 leading-relaxed">
              {profile.bio ||
                `${profile.full_name} is advancing in ${profile.career_domain || "their specialty"} with an active focus on ${profile.primary_goal || "collaboration"}.`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DBD3C1]/08 text-[11px] text-[#8FAAB5] flex justify-between">
            <span>Domain: {profile.career_domain || "General"}</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Active</span>
            </span>
          </div>
        </div>

        {/* Top Strengths & Current Skills */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#DBD3C1]/08 pb-2.5">
              <span className="editorial-kicker text-[10px] text-[#8FAAB5]">
                Verified Competencies
              </span>
              <p className="text-[11px] text-[#8FAAB5]/70 mt-0.5">Top verified technical & craft skills</p>
            </div>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {topStrengths.length > 0 ? (
                topStrengths.map((s, i) => (
                  <span
                    key={i}
                    className="glass-pill rounded-lg px-2.5 py-1 text-xs text-[#DBD3C1] font-medium"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-xs text-[#8FAAB5]/60 italic py-2">No skills registered yet.</p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DBD3C1]/08">
            <Link href="/profile" className="text-xs text-[#D5B38B] hover:text-[#E4C8A6] transition flex items-center justify-between">
              <span>Manage Skills ({userSkills?.length || 0})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Primary Goals */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#DBD3C1]/08 pb-2.5">
              <span className="editorial-kicker text-[10px] text-[#8FAAB5]">
                Strategic Aspirations
              </span>
              <p className="text-[11px] text-[#8FAAB5]/70 mt-0.5">Focus areas & vision</p>
            </div>
            <div className="mt-3.5 space-y-2 text-xs">
              <div className="rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5B38B]">Primary Goal</span>
                <p className="mt-1 text-[#DBD3C1] font-medium text-xs">
                  {profile.primary_goal || "Not configured yet"}
                </p>
              </div>
              {profile.secondary_goal && (
                <div className="rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/40 p-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8FAAB5]">Secondary</span>
                  <p className="mt-0.5 text-[#DBD3C1]/80 text-[11px]">{profile.secondary_goal}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DBD3C1]/08">
            <Link href="/profile" className="text-xs text-[#D5B38B] hover:text-[#E4C8A6] transition flex items-center justify-between">
              <span>Edit Aspirations</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Roadmap Preview & Opportunities Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Career Roadmap Preview */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9E532D]/20 text-[#D5B38B]">
                  <Compass className="h-4 w-4" />
                </div>
                <h2 className="font-serif text-base font-medium text-[#DBD3C1]">Career Progression Roadmap</h2>
              </div>
              <Link href="/roadmap" className="text-xs text-[#D5B38B] hover:underline">
                Full Roadmap →
              </Link>
            </div>

            {roadmapRecord ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/10 bg-[#192024]/60 p-3.5 text-xs">
                  <div>
                    <span className="editorial-kicker text-[9px] text-[#8FAAB5]">Target Role</span>
                    <h3 className="font-semibold text-[#DBD3C1] text-xs">{roadmapRecord.target_career || "Career Specialist"}</h3>
                  </div>
                  <span className="glass-pill rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-[#D5B38B]">
                    {roadmapRecord.current_stage || "In Progress"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#8FAAB5]">
                    <span className="font-semibold">Next Milestones</span>
                    <span className="tabular-nums">{completedMilestones} of {totalMilestones} Completed</span>
                  </div>
                  {milestonesList.slice(0, 2).map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/50 p-3 text-xs"
                    >
                      <Clock className="h-3.5 w-3.5 text-[#D5B38B] mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={m.completed ? "line-through text-[#8FAAB5]/60" : "font-medium text-[#DBD3C1]"}>
                            {m.title}
                          </span>
                          <span className="text-[10px] text-[#8FAAB5] tabular-nums">{m.estimated_time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-[#DBD3C1]/15 p-6 text-center">
                <p className="text-xs text-[#8FAAB5]">No active career roadmap generated yet.</p>
                <Link
                  href="/roadmap"
                  className="mt-3.5 glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  Generate Personalized Roadmap
                </Link>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#DBD3C1]/08">
            <Link
              href="/roadmap"
              className="glass-button-secondary inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium"
            >
              <span>Explore All Milestones</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Opportunity Recommendations Preview */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9E532D]/20 text-[#D5B38B]">
                  <Award className="h-4 w-4" />
                </div>
                <h2 className="font-serif text-base font-medium text-[#DBD3C1]">Recommended Opportunities</h2>
              </div>
              <Link href="/opportunities" className="text-xs text-[#D5B38B] hover:underline">
                Explore All →
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {topOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-3.5 transition hover:border-[#D5B38B]/30 hover:bg-[#192024]/80"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <span className="glass-pill rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#8FAAB5]">
                        {opp.category}
                      </span>
                      <h3 className="mt-1.5 text-xs font-bold text-[#DBD3C1]">{opp.title}</h3>
                      <p className="text-[11px] text-[#8FAAB5]">{opp.organization}</p>
                    </div>
                    <span className="rounded-full border border-[#D5B38B]/30 bg-[#D5B38B]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#D5B38B] shrink-0 tabular-nums">
                      {opp.matchScore}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#DBD3C1]/08">
            <Link
              href="/opportunities"
              className="glass-button-secondary inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium"
            >
              <span>Browse All Opportunities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended People & Recent Connections Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended People (2 columns) */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9E532D]/20 text-[#D5B38B]">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="font-serif text-base font-medium text-[#DBD3C1]">Recommended Collaborators</h2>
            </div>
            <Link href="/discover" className="text-xs text-[#D5B38B] hover:underline">
              View All Matches →
            </Link>
          </div>

          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            {recommendedPeople.length > 0 ? (
              recommendedPeople.map((match) => (
                <div
                  key={match.candidate.userId}
                  className="flex flex-col justify-between rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-4 transition hover:border-[#D5B38B]/30 hover:bg-[#192024]/80"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E532D]/25 to-[#D5B38B]/20 border border-[#DBD3C1]/10 text-xs font-bold text-[#D5B38B]">
                          {match.candidate.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#DBD3C1] text-xs">
                            {match.candidate.fullName}
                          </h3>
                          <p className="text-[11px] text-[#8FAAB5]">{match.candidate.careerDomain}</p>
                        </div>
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 tabular-nums">
                        {match.score}%
                      </span>
                    </div>

                    <p className="mt-2.5 text-[11px] text-[#8FAAB5] line-clamp-2 leading-relaxed italic">
                      &ldquo;{match.explanation}&rdquo;
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#DBD3C1]/08 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#8FAAB5]/70">
                      {match.candidate.skills.slice(0, 2).map((s: any) => s.name).join(", ")}
                    </span>
                    <Link
                      href="/discover"
                      className="text-xs font-semibold text-[#D5B38B] hover:text-[#E4C8A6] hover:underline"
                    >
                      Connect
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8FAAB5]/70 col-span-2 py-6 text-center">
                No additional candidates in your network currently. Check Discover as new builders join.
              </p>
            )}
          </div>
        </div>

        {/* Recent Connections (1 column) */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#9E532D]/20 text-[#D5B38B]">
                  <UserCheck className="h-4 w-4" />
                </div>
                <h2 className="font-serif text-base font-medium text-[#DBD3C1]">Network Activity</h2>
              </div>
              <Link href="/connections" className="text-xs text-[#D5B38B] hover:underline">
                View All →
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {recentConnections.length > 0 ? (
                recentConnections.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-[#DBD3C1]/08 bg-[#192024]/60 p-3 text-xs"
                  >
                    <div>
                      <h3 className="font-semibold text-[#DBD3C1] text-xs">{c.partner.full_name}</h3>
                      <p className="text-[10px] text-[#8FAAB5]">
                        {c.isOutgoing ? "Sent invitation" : "Received invite"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                        c.status === "accepted"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-[#DBD3C1]/10 bg-[#252E33]/40 text-[#8FAAB5]"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8FAAB5]/70 py-6 text-center">
                  No active connections yet. Explore candidates in Discover.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#DBD3C1]/08">
            <Link
              href="/connections"
              className="glass-button-secondary inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium"
            >
              <span>Manage Network</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
