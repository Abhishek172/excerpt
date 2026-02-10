import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const supabaseAdmin = getSupabaseAdmin();

import { extractTags } from "@/lib/nlp/rules";

function toISODate(
  day: number,
  month: number,
  year: number,
  hour: number,
  minute: number
) {
  // JS months are 0-based
  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute
  ).toISOString();
}

function parseWhatsAppLine(line: string) {
  // FORMAT A:
  // 14/01/24, 6:20 PM - Alex: message
  const formatA = line.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s(\d{1,2}):(\d{2})\s?(AM|PM)\s-\s([^:]+):\s(.*)$/i
  );

  if (formatA) {
    const [
      ,
      day,
      month,
      yearRaw,
      hourRaw,
      minute,
      meridiem,
      sender,
      message,
    ] = formatA;

    let year = Number(yearRaw);
    if (year < 100) year += 2000;

    let hour = Number(hourRaw);
    if (meridiem.toUpperCase() === "PM" && hour < 12)
      hour += 12;
    if (meridiem.toUpperCase() === "AM" && hour === 12)
      hour = 0;

    return {
      timestamp: toISODate(
        Number(day),
        Number(month),
        year,
        hour,
        Number(minute)
      ),
      sender,
      message,
    };
  }

  // FORMAT B:
  // [10/01/2024, 10:30] Alex: message
  const formatB = line.match(
    /^\[(\d{1,2})\/(\d{1,2})\/(\d{4}),\s(\d{1,2}):(\d{2})\]\s([^:]+):\s(.*)$/
  );

  if (formatB) {
    const [
      ,
      day,
      month,
      year,
      hour,
      minute,
      sender,
      message,
    ] = formatB;

    return {
      timestamp: toISODate(
        Number(day),
        Number(month),
        Number(year),
        Number(hour),
        Number(minute)
      ),
      sender,
      message,
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
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n");

    const uploadId = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    const messages = lines
      .map((line) => {
        const parsed = parseWhatsAppLine(line.trim());
        if (!parsed) return null;

        return {
          upload_id: uploadId,
          sender: parsed.sender,
          text: parsed.message,
          timestamp: parsed.timestamp,
          tags: extractTags(parsed.message),
        };
      })
      .filter(
        (m): m is {
          upload_id: string;
          sender: string;
          text: string;
          timestamp: string;
          tags: string[];
        } => Boolean(m)
      );

    const { error: uploadError } = await supabaseAdmin
      .from("uploads")
      .insert({
        id: uploadId,
        paid: false,
        expires_at: expiresAt,
        total_messages: messages.length,
      });

    if (uploadError) {
      console.error("UPLOAD INSERT FAILED:", uploadError);
      return NextResponse.json(
        { error: "Failed to create upload record" },
        { status: 500 }
      );
    }

    if (messages.length > 0) {
      const { error: messageError } = await supabaseAdmin
        .from("messages")
        .insert(messages);

      if (messageError) {
        console.error(
          "MESSAGE INSERT FAILED:",
          messageError
        );
      }
    }

    return NextResponse.json({ uploadId });
  } catch (err) {
    console.error("UPLOAD ROUTE CRASH:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
