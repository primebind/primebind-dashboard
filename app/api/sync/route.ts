import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const KEY = "pb_dashboard_sync";

export async function GET() {
  try {
    const data = await kv.get<Record<string, string>>(KEY);
    return NextResponse.json(data ?? {});
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.UPDATES_API_KEY || auth !== `Bearer ${process.env.UPDATES_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await kv.set(KEY, body);

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}
