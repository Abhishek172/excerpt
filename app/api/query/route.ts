import { NextRequest, NextResponse } from "next/server";
//import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase";


export async function POST(req: NextRequest) {
  const { uploadId, query } = (await req.json()) as {
    uploadId?: string;
    query?: string;
  };

  if (!uploadId || !query) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  const keywords: string[] = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("upload_id", uploadId);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Query failed" },
      { status: 500 }
    );
  }

  const results = data.filter((msg) => {
    const text = msg.text.toLowerCase();
    const tags: string[] = Array.isArray(msg.tags)
      ? msg.tags
      : [];

    const keywordMatch = keywords.some(
      (k: string) => text.includes(k)
    );

    const tagMatch = keywords.some(
      (k: string) => tags.includes(k)
    );

    return keywordMatch || tagMatch;
  });

  return NextResponse.json({ results });
}
