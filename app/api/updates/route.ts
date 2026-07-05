import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const raw = await kv.lrange("pb_updates", 0, 49);
    const updates = raw.map((r: unknown) =>
      typeof r === "string" ? JSON.parse(r) : r
    );
    return NextResponse.json(updates);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.UPDATES_API_KEY || auth !== `Bearer ${process.env.UPDATES_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const update = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    source: body.source || "Manual",
    sections: body.sections || [],
    content: body.content || "",
  };

  await kv.lpush("pb_updates", JSON.stringify(update));
  await kv.ltrim("pb_updates", 0, 99);

  return NextResponse.json({ ok: true, id: update.id });
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.UPDATES_API_KEY || auth !== `Bearer ${process.env.UPDATES_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  const raw = await kv.lrange("pb_updates", 0, 199);
  const kept = raw.filter((r: unknown) => {
    const entry = typeof r === "string" ? JSON.parse(r) : r;
    return entry.id !== id;
  });

  await kv.del("pb_updates");
  if (kept.length > 0) {
    for (let i = kept.length - 1; i >= 0; i--) {
      await kv.lpush("pb_updates", typeof kept[i] === "string" ? kept[i] : JSON.stringify(kept[i]));
    }
  }

  return NextResponse.json({ ok: true, removed: id });
}
