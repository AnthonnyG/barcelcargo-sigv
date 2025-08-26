import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { event, jobId, user: motoristaNome } = body;

  if (!["job_completed", "job_canceled"].includes(event) || !jobId) {
    return NextResponse.json({ ok: true });
  }

  const API_TOKEN = process.env.TRUCKY_API_TOKEN;
  const COMPANY_ID = process.env.TRUCKY_COMPANY_ID;
  if (!API_TOKEN || !COMPANY_ID) {
    return NextResponse.json({ error: "Configurações faltando" }, { status: 500 });
  }

  const res = await fetch(
    `https://e.truckyapp.com/api/v1/company/${COMPANY_ID}/jobs/${jobId}`,
    {
      headers: {
        "x-access-token": API_TOKEN,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Trucky VTC",
      },
    }
  );
  if (!res.ok) return NextResponse.json({ error: "Erro API Trucky" }, { status: 500 });

  const job = await res.json();

  const user = await prisma.user.upsert({
    where: { name: motoristaNome },
    update: {},
    create: {
      name: motoristaNome,
      email: `${motoristaNome.toLowerCase().replace(/\s/g, "")}@sigv.local`,
      password: "imported",
      isApproved: true,
    },
  });

  await prisma.viagem.create({
    data: {
      motoristaId: user.id,
      camiao: job.truck || "",
      origem: job.sourceCity || "",
      destino: job.destinationCity || "",
      distancia: job.distance || 0,
      dano: job.damage || 0,
      velocidadeMax: job.maxSpeed || 0,
      hora: new Date(job.date),
      data: new Date(job.date),
      game: job.game === "ATS" ? "ATS" : "ETS2",
    },
  });

  return NextResponse.json({ message: "Viagem gravada" });
}