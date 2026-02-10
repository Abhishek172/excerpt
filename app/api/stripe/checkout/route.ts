import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
  const { uploadId } = await req.json();

  console.log("BASE URL:", process.env.NEXT_PUBLIC_BASE_URL);


  if (!uploadId) {
    return NextResponse.json(
      { error: "Missing uploadId" },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Unlock conversation search",
            description:
              "Unlimited search and filters for this uploaded conversation.",
          },
          unit_amount: 900, // $9.00
        },
        quantity: 1,
      },
    ],
    metadata: {
      uploadId,
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/analyze?uploadId=${uploadId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/analyze?uploadId=${uploadId}`,
  });

  return NextResponse.json({ url: session.url });
  console.log("BASE URL:", process.env.NEXT_PUBLIC_BASE_URL);

}
