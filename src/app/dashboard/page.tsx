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
} from "lucide-react";

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar with Profile Overview & CTAs */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg font-bold text-white border border-slate-700">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  {profile.full_name}
                </h1>
                <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                  {profile.career_domain || "Member"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Primary Goal:{" "}
                <span className="text-slate-200 font-medium">
                  {profile.primary_goal || "Not specified"}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Navigation CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Discover People</span>
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <Compass className="h-3.5 w-3.5 text-slate-400" />
              <span>Career Roadmap</span>
            </Link>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <Award className="h-3.5 w-3.5 text-slate-400" />
              <span>Opportunities</span>
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Edit Profile</span>
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-rose-950/30 hover:border-rose-800/50 hover:text-rose-300"
                title="Sign out of ConnectOne"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Profile Progress:</span>
            <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-950 border border-slate-800">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <span className="font-semibold text-white">{profileCompletion}%</span>
          </div>

          {profileCompletion < 100 && (
            <Link href="/profile" className="text-xs text-blue-400 hover:underline">
              Complete your profile for higher matching accuracy →
            </Link>
          )}
        </div>
      </div>

      {/* Immediate Next Action Tactical Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
              <span>Next Recommended Action</span>
            </div>
            <p className="text-sm font-semibold text-white sm:text-base">
              {nextRecommendedAction}
            </p>
          </div>
          <Link
            href="/roadmap"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <span>View Roadmap</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 3-Column Information Row: AI Profile Summary, Top Strengths, Goals */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* AI Profile Summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                AI Profile Summary
              </span>
              <Link href="/intelligence" className="text-xs text-blue-400 hover:underline">
                Deep Analysis
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              {profile.bio ||
                `${profile.full_name} is advancing in ${profile.career_domain || "their specialty"} with an active focus on ${profile.primary_goal || "collaboration"}.`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Domain: {profile.career_domain || "General"}</span>
            <span className="text-slate-200">Active</span>
          </div>
        </div>

        {/* Top Strengths & Current Skills */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Top Strengths & Skills
            </span>
            <p className="mt-1 text-xs text-slate-400">Verified competencies</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topStrengths.length > 0 ? (
                topStrengths.map((s, i) => (
                  <span
                    key={i}
                    className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500">No skills added yet.</p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link href="/profile" className="text-xs text-slate-400 hover:text-white">
              Manage Skills ({userSkills?.length || 0}) →
            </Link>
          </div>
        </div>

        {/* Primary Goals */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Primary Aspirations
            </span>
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                <span className="text-[10px] font-bold uppercase text-blue-400">Primary</span>
                <p className="mt-0.5 text-white font-medium">
                  {profile.primary_goal || "Not set yet"}
                </p>
              </div>
              {profile.secondary_goal && (
                <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Secondary</span>
                  <p className="mt-0.5 text-slate-300">{profile.secondary_goal}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link href="/profile" className="text-xs text-slate-400 hover:text-white">
              Edit Aspirations →
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Roadmap Preview & Opportunities Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Career Roadmap Preview */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-white">Career Roadmap</h2>
              </div>
              <Link href="/roadmap" className="text-xs text-blue-400 hover:underline">
                View Full Roadmap
              </Link>
            </div>

            {roadmapRecord ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Target Role</span>
                    <h3 className="font-semibold text-white">{roadmapRecord.target_career || "Career Specialist"}</h3>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                    {roadmapRecord.current_stage || "In Progress"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Next Milestones ({completedMilestones}/{totalMilestones})
                  </span>
                  {milestonesList.slice(0, 2).map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950 p-2.5 text-xs"
                    >
                      <Clock className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={m.completed ? "line-through text-slate-500" : "font-medium text-white"}>
                            {m.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{m.estimated_time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-dashed border-slate-800 p-6 text-center">
                <p className="text-xs text-slate-400">No active roadmap generated yet.</p>
                <Link
                  href="/roadmap"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Generate Roadmap
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link
              href="/roadmap"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <span>Explore Milestones</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Opportunity Recommendations Preview */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-white">Recommended Opportunities</h2>
              </div>
              <Link href="/opportunities" className="text-xs text-blue-400 hover:underline">
                Explore All
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {topOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-3 transition hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-800">
                        {opp.category}
                      </span>
                      <h3 className="mt-1 text-xs font-bold text-white">{opp.title}</h3>
                      <p className="text-[11px] text-slate-400">{opp.organization}</p>
                    </div>
                    <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                      {opp.matchScore}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link
              href="/opportunities"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
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
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-white">Recommended Collaborators</h2>
            </div>
            <Link href="/discover" className="text-xs text-blue-400 hover:underline">
              View All Matches
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recommendedPeople.length > 0 ? (
              recommendedPeople.map((match) => (
                <div
                  key={match.candidate.userId}
                  className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-white border border-slate-700">
                          {match.candidate.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-xs">
                            {match.candidate.fullName}
                          </h3>
                          <p className="text-[11px] text-slate-400">{match.candidate.careerDomain}</p>
                        </div>
                      </div>
                      <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {match.score}%
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {match.explanation}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">
                      {match.candidate.skills.slice(0, 2).map((s: any) => s.name).join(", ")}
                    </span>
                    <Link
                      href="/discover"
                      className="text-xs font-semibold text-blue-400 hover:underline"
                    >
                      Connect
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 col-span-2 py-4 text-center">
                No additional candidates in your network currently. Check Discover as new members join.
              </p>
            )}
          </div>
        </div>

        {/* Recent Connections (1 column) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-white">Recent Connections</h2>
              </div>
              <Link href="/connections" className="text-xs text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {recentConnections.length > 0 ? (
                recentConnections.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs"
                  >
                    <div>
                      <h3 className="font-semibold text-white">{c.partner.full_name}</h3>
                      <p className="text-[10px] text-slate-400">
                        {c.isOutgoing ? "Sent request" : "Received request"}
                      </p>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                        c.status === "accepted"
                          ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400"
                          : "border-slate-700 bg-slate-800 text-slate-300"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No active connections yet. Explore candidates in Discover.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link
              href="/connections"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
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
