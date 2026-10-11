import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OpportunitiesView } from "@/components/opportunities-view";
import { ArrowLeft, User } from "lucide-react";

export default async function OpportunitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, career_domain")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.full_name) {
    redirect("/onboarding");
  }

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
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <User className="h-3 w-3" />
          {profile.full_name}
        </span>
      </div>

      <OpportunitiesView />
    </div>
  );
}
