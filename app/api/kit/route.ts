import { NextResponse } from "next/server";

export async function GET() {
  const secret = process.env.KIT_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "KIT_API_SECRET not set" }, { status: 503 });
  }

  const res = await fetch(
    `https://api.convertkit.com/v3/subscribers?api_secret=${secret}`,
    { next: { revalidate: 0 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Kit API error" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ total: data.total_subscribers ?? 0 });
}
