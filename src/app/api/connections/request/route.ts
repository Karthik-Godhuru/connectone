import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Enforce authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json(
        { success: false, error: "Target user ID is required." },
        { status: 400 }
      );
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot connect with yourself." },
        { status: 400 }
      );
    }

    // 2. Check if a connection already exists (column is sender_id)
    const { data: existingConnection } = await supabase
      .from("connections")
      .select("id, status")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existingConnection) {
      return NextResponse.json({
        success: true,
        status: existingConnection.status,
        message: `Connection already exists with status: ${existingConnection.status}`,
      });
    }

    // 3. Insert connection request into connections table
    const { error: insertError } = await supabase.from("connections").insert({
      sender_id: user.id,
      receiver_id: targetUserId,
      status: "pending",
    });

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "pending",
      message: "Connection request sent successfully.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process connection request";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
