import { NextResponse } from "next/server";

type KitSubscriber = {
  id: number;
  first_name: string | null;
  email_address: string;
  state: string;
  created_at: string;
};

export async function GET() {
  const secret = process.env.KIT_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "KIT_API_SECRET not set" }, { status: 503 });
  }

  const allSubscribers: KitSubscriber[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(
      `https://api.convertkit.com/v3/subscribers?api_secret=${secret}&page=${page}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Kit API error" }, { status: res.status });
    }
    const data = await res.json();
    allSubscribers.push(...(data.subscribers ?? []));
    totalPages = data.total_pages ?? 1;
    page++;
  } while (page <= totalPages && page <= 20); // cap at 1000 subscribers

  return NextResponse.json({
    total: allSubscribers.length,
    subscribers: allSubscribers.map((s) => ({
      id: s.id,
      email: s.email_address,
      name: s.first_name ?? "",
      state: s.state,
      subscribedAt: s.created_at,
    })),
  });
}
