import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processCompanionChat } from "@/lib/companion/service";
import type { CompanionChatRequest } from "@/types/companion";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user with Supabase SSR
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to access ConnectOne AI Companion." },
        { status: 401 }
      );
    }

    // 2. Parse & validate request body
    let body: CompanionChatRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { message, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Message exceeds maximum allowed length of 1,000 characters." },
        { status: 400 }
      );
    }

    // 3. Process chat with Companion service
    const response = await processCompanionChat({
      userId: user.id,
      message,
      history: Array.isArray(history) ? history : [],
    });

    if (!response.success && response.error === "Rate limit exceeded.") {
      return NextResponse.json(response, { status: 429 });
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    // Sanitize any potential API keys in the error log
    const sanitizedMsg = errorMsg
      .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]")
      .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, "Bearer [REDACTED]");

    console.error("Companion Chat API Route Error:", sanitizedMsg);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while communicating with ConnectOne AI Companion.",
      },
      { status: 500 }
    );
  }
}
