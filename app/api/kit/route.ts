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
  let totalSubscribers = 0;

  do {
    const res = await fetch(
      `https://api.convertkit.com/v3/subscribers?api_secret=${secret}&subscriber_state=active&page=${page}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Kit API error" }, { status: res.status });
    }
    const data = await res.json();
    if (page === 1) totalSubscribers = data.total_subscribers ?? 0;
    allSubscribers.push(...(data.subscribers ?? []));
    totalPages = data.total_pages ?? 1;
    page++;
  } while (page <= totalPages && page <= 20);

  return NextResponse.json({
    total: totalSubscribers,
    subscribers: allSubscribers.map((s) => ({
      id: s.id,
      email: s.email_address,
      subscribedAt: s.created_at,
    })),
  });
}
