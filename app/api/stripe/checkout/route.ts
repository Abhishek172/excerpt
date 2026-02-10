import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
  try {
    const { uploadId } = await req.json();

    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing uploadId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Excerpt — Full Search Unlock",
            },
            unit_amount: 900,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/analyze?uploadId=${uploadId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/analyze?uploadId=${uploadId}`,
      metadata: { uploadId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("STRIPE CHECKOUT ERROR:", err);
    return NextResponse.json(
      { error: "Stripe checkout failed" },
      { status: 500 }
    );
  }
}
