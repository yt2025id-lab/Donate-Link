import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

// ────────────────────────────────────────────────────────────────
// GET /api/profile?wallet_address=0x...
// ────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet_address");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "wallet_address query parameter is required" },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (error && error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (error) {
      console.error("Profile fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────
// POST /api/profile
// ────────────────────────────────────────────────────────────────
type CreateProfileBody = {
  wallet_address: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const body = (await request.json()) as CreateProfileBody;

    // Validate required fields
    if (!body.wallet_address || !body.username) {
      return NextResponse.json(
        { error: "wallet_address and username are required" },
        { status: 400 }
      );
    }

    // Validate username format
    const username = body.username.toLowerCase();

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-30 characters and contain only lowercase letters, numbers, and underscores",
        },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const { data: existingUsername } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Check if wallet already has a profile
    const { data: existingWallet } = await supabase
      .from("profiles")
      .select("id")
      .eq("wallet_address", body.wallet_address.toLowerCase())
      .single();

    if (existingWallet) {
      return NextResponse.json(
        { error: "A profile already exists for this wallet address" },
        { status: 409 }
      );
    }

    // Insert the new profile
    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        wallet_address: body.wallet_address.toLowerCase(),
        username,
        display_name: body.display_name ?? username,
        avatar_url: body.avatar_url ?? "",
        bio: body.bio ?? "",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create profile:", insertError);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    console.error("Profile POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
