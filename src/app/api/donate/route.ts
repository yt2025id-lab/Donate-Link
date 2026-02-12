import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DonateRequestBody = {
  streamer_address: string;
  donor_address: string;
  donor_name: string;
  message: string;
  amount_usd: number;
  amount_token: number;
  token_symbol: string;
  token_address: string;
  source_chain: string;
  tx_hash: string;
  ccip_message_id?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DonateRequestBody;

    // Validate required fields
    const requiredFields: (keyof DonateRequestBody)[] = [
      "streamer_address",
      "donor_address",
      "donor_name",
      "message",
      "amount_usd",
      "amount_token",
      "token_symbol",
      "token_address",
      "source_chain",
      "tx_hash",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (body.amount_usd <= 0) {
      return NextResponse.json(
        { error: "amount_usd must be greater than 0" },
        { status: 400 }
      );
    }

    // Look up streamer profile by wallet address
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("wallet_address", body.streamer_address.toLowerCase())
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Streamer profile not found" },
        { status: 404 }
      );
    }

    // Insert the donation
    const { data: donation, error: insertError } = await supabase
      .from("donations")
      .insert({
        streamer_id: profile.id,
        streamer_address: body.streamer_address.toLowerCase(),
        donor_address: body.donor_address.toLowerCase(),
        donor_name: body.donor_name,
        message: body.message,
        amount_usd: body.amount_usd,
        amount_token: body.amount_token,
        token_symbol: body.token_symbol,
        token_address: body.token_address.toLowerCase(),
        source_chain: body.source_chain,
        tx_hash: body.tx_hash.toLowerCase(),
        ccip_message_id: body.ccip_message_id ?? null,
        status: "confirmed",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert donation:", insertError);
      return NextResponse.json(
        { error: "Failed to record donation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ donation }, { status: 201 });
  } catch (err) {
    console.error("Donate API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
