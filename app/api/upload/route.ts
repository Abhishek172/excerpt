import { NextRequest, NextResponse } from "next/server";
import { extractTags } from "@/lib/nlp/rules";

/**
 * Parsed WhatsApp message shape
 */
interface ParsedMessage {
  sender: string;
  text: string;
  timestamp: string;
}

/**
 * Parse a single WhatsApp chat line
 * Supports formats like:
 * 14/01/24, 6:20 PM - Alex: hello
 * [10/01/2024, 10:30] Alex: I'm sorry
 */
function parseWhatsAppLine(line: string): ParsedMessage | null {
  // Format 1: 14/01/24, 6:20 PM - Alex: text
  const formatA =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}\s?(?:AM|PM))\s-\s([^:]+):\s(.+)$/i;

  // Format 2: [10/01/2024, 10:30] Alex: text
  const formatB =
    /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{1,2}:\d{2})\]\s([^:]+):\s(.+)$/;

  let match = line.match(formatA);
  if (match) {
    const [, date, time, sender, text] = match;
    const ts = new Date(`${date} ${time}`);
    if (isNaN(ts.getTime())) return null;

    return {
      sender: sender.trim(),
      text: text.trim(),
      timestamp: ts.toISOString(),
    };
  }

  match = line.match(formatB);
  if (match) {
    const [, date, time, sender, text] = match;
    const ts = new Date(`${date} ${time}`);
    if (isNaN(ts.getTime())) return null;

    return {
      sender: sender.trim(),
      text: text.trim(),
      timestamp: ts.toISOString(),
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    const parsedMessages: ParsedMessage[] = lines
      .map(parseWhatsAppLine)
      .filter(Boolean) as ParsedMessage[];

    if (parsedMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages found" },
        { status: 400 }
      );
    }

    // IMPORTANT: lazy import to avoid build-time env crash
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const supabase = getSupabaseAdmin();

    const uploadId = crypto.randomUUID();

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    // 🔑 INSERT INTO uploads (ALL NOT NULL FIELDS)
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

    // 🔑 INSERT messages
    const messagesToInsert = parsedMessages.map((msg) => ({
      upload_id: uploadId,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
      tags: extractTags(msg.text), // TEXT[]
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
