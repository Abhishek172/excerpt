import { NextResponse } from "next/server";
import { cleanupExpiredUploads } from "@/lib/cleanup";

export async function POST() {
  await cleanupExpiredUploads();
  return NextResponse.json({ status: "ok" });
}
