import { NextRequest, NextResponse } from "next/server";
import { extractTags } from "@/lib/nlp/rules";

interface Message {
  id: string;
  upload_id: string;
  sender: string;
  text: string;
  timestamp: string;
  tags: string[] | null;
}

export async function POST(req: NextRequest) {
  try {
    const { uploadId, query } = await req.json();
    if (!uploadId || !query) {
      return NextResponse.json({ results: [] });
    }

    const q = query.toLowerCase();

    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const supabase = getSupabaseAdmin();

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("upload_id", uploadId);

    if (!messages) {
      return NextResponse.json({ results: [] });
    }

    const results = (messages as Message[]).filter((msg) => {
      const text = msg.text.toLowerCase();
      const tags = msg.tags ?? [];

      // 1️⃣ Semantic tag match (emotion search)
      if (tags.includes(q)) {
        return true;
      }

      // 2️⃣ Fallback: literal keyword match
      return text.includes(q);
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error("QUERY ERROR:", err);
    return NextResponse.json({ results: [] });
  }
}
