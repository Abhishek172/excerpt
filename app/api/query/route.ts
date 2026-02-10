import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

interface Message {
  text: string;
  tags?: string[];
}

export async function POST(req: NextRequest) {
  const { uploadId, query } = await req.json();
  if (!uploadId || !query) {
    return NextResponse.json({ results: [] });
  }

  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("messages")
    .select("text, tags, sender, timestamp, id")
    .eq("upload_id", uploadId);

  const q = query.toLowerCase();

  const results = (data || []).filter((msg: Message) => {
    return (
      msg.text.toLowerCase().includes(q) ||
      (Array.isArray(msg.tags) && msg.tags.includes(q))
    );
  });

  return NextResponse.json({ results });
}
