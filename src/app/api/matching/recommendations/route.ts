import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMatchRecommendations } from "@/lib/matching/service";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Enforce authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. You must be signed in to view match recommendations.",
        },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get("domain") || undefined;
    const minScore = searchParams.get("minScore")
      ? parseInt(searchParams.get("minScore")!, 10)
      : undefined;
    const searchQuery = searchParams.get("q") || undefined;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 20;

    // 3. Compute and retrieve recommendations
    const results = await getMatchRecommendations(user.id, {
      careerDomain: domain,
      minScore,
      searchQuery,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve match recommendations";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
