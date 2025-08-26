// app/api/trucky/api/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Game } from "@prisma/client";
import { enviarViagemDiscord } from "@/lib/discord";

const COMPANY_ID = process.env.TRUCKY_COMPANY_ID!;
const API_TOKEN = process.env.TRUCKY_API_TOKEN!;

export async function POST(req: Request) {
  try {
    const { jobId, motoristaNome } = await req.json();

    if (!jobId || !motoristaNome) {
      return NextResponse.json({ error: "Faltam parâmetros" }, { status: 400 });
    }

    // Vai buscar os detalhes completos à API do Trucky
    const res = await fetch(
      `https://e.truckyapp.com/api/v1/company/${COMPANY_ID}/jobs/${jobId}`,
      {
        headers: {
          "x-access-token": API_TOKEN,
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "BarcelCargo VTC",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Erro na API do Trucky" }, { status: res.status });
    }

    const job = await res.json();

    // Garante que o motorista existe
    const motorista = await prisma.user.upsert({
      where: { name: motoristaNome },
      update: {},
      create: {
        name: motoristaNome,
        email: `${motoristaNome.toLowerCase().replace(/\s/g, "")}@sigv.local`,
        password: "imported",
        isApproved: true,
      },
    });

    // Prepara os dados normalizados
    const viagemData = {
      motoristaId: motorista.id,
      camiao: job.truck || "—",
      origem: job.sourceCity || "---",
      destino: job.destinationCity || "---",
      distancia: job.distance || 0,
      dano: job.damage || 0,
      velocidadeMax: job.maxSpeed || 0,
      hora: new Date(job.date || Date.now()),
      data: new Date(job.date || Date.now()),
      game: job.game === "ATS" ? Game.ATS : Game.ETS2,
    };

    // Grava na DB
    const viagem = await prisma.viagem.create({ data: viagemData });

    // Envia para Discord
    await enviarViagemDiscord({
      motorista: motorista.name,
      camiao: viagemData.camiao,
      origem: viagemData.origem,
      destino: viagemData.destino,
      distancia: viagemData.distancia,
      dano: viagemData.dano,
      velocidadeMax: viagemData.velocidadeMax,
      data: viagemData.hora,
      game: 
    });

    return NextResponse.json(viagem);
  } catch (err) {
    console.error("Erro Trucky API:", err);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}