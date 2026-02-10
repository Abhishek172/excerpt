import { NextRequest, NextResponse } from "next/server";

/**
 * Parse a single WhatsApp chat line.
 * Supports:
 * 14/01/24, 6:20 PM - Alex: hello
 * [14/01/24, 18:20] Alex: hello
 */
function parseWhatsAppLine(line: string) {
  const formatA =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?:\s?[APMapm]{2})?)\s-\s([^:]+):\s(.+)$/;

  const formatB =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\]\s([^:]+):\s(.+)$/;

  const match = line.match(formatA) || line.match(formatB);
  if (!match) return null;

  const [, date, time, sender, message] = match;

  const [day, month, yearRaw] = date.split("/").map(Number);
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;

  const timestamp = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${time}`
  );

  if (isNaN(timestamp.getTime())) return null;

  return {
    sender: sender.trim(),
    text: message.trim(),
    timestamp: timestamp.toISOString(),
    tags: [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const rawText = await file.text();
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedMessages = lines
      .map(parseWhatsAppLine)
      .filter(Boolean) as {
      sender: string;
      text: string;
      timestamp: string;
      tags: string[];
    }[];

    if (parsedMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid WhatsApp messages found" },
        { status: 400 }
      );
    }

    // 🔐 Runtime-only Supabase import (CRITICAL FOR VERCEL)
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const supabase = getSupabaseAdmin();

    // ✅ No uuid dependency
    const uploadId = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: uploadError } = await supabase
      .from("uploads")
      .insert({
        id: uploadId,
        paid: false,
        expires_at: expiresAt,
        total_messages: parsedMessages.length,
      });

    if (uploadError) {
      console.error("UPLOAD INSERT FAILED:", uploadError);
      return NextResponse.json(
        { error: "Failed to create upload record" },
        { status: 500 }
      );
    }

    const messagesToInsert = parsedMessages.map((msg) => ({
      upload_id: uploadId,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
      tags: msg.tags,
    }));

    const { error: messageError } = await supabase
      .from("messages")
      .insert(messagesToInsert);

    if (messageError) {
      console.error("MESSAGE INSERT FAILED:", messageError);
      return NextResponse.json(
        { error: "Failed to save messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ uploadId });
  } catch (err) {
    console.error("UPLOAD ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
