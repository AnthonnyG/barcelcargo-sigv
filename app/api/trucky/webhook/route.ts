// app/api/trucky/webhook/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { event, jobId, user } = body;

  // Só reage a eventos relevantes
  if (!["job_completed", "job_canceled"].includes(event) || !jobId) {
    return NextResponse.json({ ok: true });
  }

  // Encaminha para o endpoint API
  await fetch(`${process.env.BASE_URL}/api/trucky/api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId, motoristaNome: user }),
  });

  return NextResponse.json({ ok: true });
}