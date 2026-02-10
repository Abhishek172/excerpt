import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
// //import { supabase } from "@/lib/supabase";

import { getSupabaseAdmin } from "@/lib/supabase";

const supabaseAdmin = getSupabaseAdmin();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.");
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // 🔒 ONLY this event unlocks access
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const uploadId = session.metadata?.uploadId;

    if (!uploadId) {
      console.error("No uploadId in metadata");
      return NextResponse.json({ received: true });
    }

    await supabaseAdmin
      .from("uploads")
      .update({ paid: true }as any)
      .eq("id", uploadId);
  }

  return NextResponse.json({ received: true });
}
