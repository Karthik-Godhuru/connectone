import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile-view";
import { signOutAction } from "@/app/auth/actions";
import { ArrowLeft, User, LogOut } from "lucide-react";

export default async function ProfilePage() {
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

  // 2. Fetch user skills (column is 'level')
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select("level, skills(name, category)")
    .eq("user_id", user.id);

  // 3. Fetch user interests
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interests(name, category)")
    .eq("user_id", user.id);

  // 4. Fetch user projects (column is 'user_id')
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <User className="h-3 w-3" />
            {profile.full_name}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      <ProfileView
        initialProfile={{
          ...profile,
          email: user.email ?? null,
        }}
        skills={(userSkills || []).map((us: any) => ({
          ...us,
          proficiency_level: us.level,
        }))}
        interests={userInterests || []}
        projects={projects || []}
      />
    </div>
  );
}
