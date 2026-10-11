import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    // Fetch connections where current user is either sender or receiver
    const { data: rawConnections, error: connErr } = await supabase
      .from("connections")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (connErr) {
      console.error("Error fetching connections:", connErr);
      return NextResponse.json({ success: false, error: "Failed to fetch connections." }, { status: 500 });
    }

    // Collect other user IDs
    const otherUserIds = Array.from(
      new Set(
        (rawConnections || []).map((c) =>
          c.sender_id === user.id ? c.receiver_id : c.sender_id
        )
      )
    );

    let profilesMap: Record<string, any> = {};
    if (otherUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, career_domain, bio, avatar_url")
        .in("id", otherUserIds);

      if (profiles) {
        profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
      }
    }

    const connections = (rawConnections || []).map((c) => {
      const isOutgoing = c.sender_id === user.id;
      const otherId = isOutgoing ? c.receiver_id : c.sender_id;
      const otherProfile = profilesMap[otherId] || {
        id: otherId,
        full_name: "ConnectOne Member",
        career_domain: "Collaborator",
      };

      return {
        id: c.id,
        isOutgoing,
        status: c.status,
        createdAt: c.created_at,
        partner: otherProfile,
      };
    });

    return NextResponse.json({
      success: true,
      connections,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, status } = body;

    if (!connectionId || !["accepted", "declined"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid connectionId or status ('accepted' | 'declined')." },
        { status: 400 }
      );
    }

    // Verify current user is receiver
    const { data: conn, error: fetchErr } = await supabase
      .from("connections")
      .select("*")
      .eq("id", connectionId)
      .eq("receiver_id", user.id)
      .maybeSingle();

    if (fetchErr || !conn) {
      return NextResponse.json(
        { success: false, error: "Connection request not found or not authorized to update." },
        { status: 404 }
      );
    }

    const { error: updateErr } = await supabase
      .from("connections")
      .update({
        status,
      })
      .eq("id", connectionId);

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: "Failed to update connection status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
