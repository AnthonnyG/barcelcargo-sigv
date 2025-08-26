// app/api/trucky/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Game } from "@prisma/client";
import { enviarViagemDiscord } from "@/lib/discord";

const TRUCKY_API_URL = "https://api.truckyapp.com/v2/jobs/";
const API_TOKEN = process.env.TRUCKY_API_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1️⃣ Extrair jobId e motorista
    const jobId = body?.jobId || body?.job?.id;
    const motoristaNome = body?.user || "Desconhecido";

    if (!jobId) {
      return NextResponse.json({ error: "jobId não fornecido" }, { status: 400 });
    }

    // 2️⃣ Buscar detalhes completos do job na API do Trucky
    const res = await fetch(`${TRUCKY_API_URL}${jobId}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Falha a buscar job no Trucky" }, { status: res.status });
    }

    const { data: job } = await res.json();

    // 3️⃣ Garantir motorista no DB
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

    // 4️⃣ Normalizar dados
    const viagemData = {
      motoristaId: motorista.id,
      camiao: job.truck?.model || "Desconhecido",
      origem: job.sourceCity || "---",
      destino: job.destinationCity || "---",
      distancia: job.distance || 0,
      dano: job.damage || 0,
      velocidadeMax: job.maxSpeed || 0,
      hora: new Date(job.date || Date.now()),
      game: job.game === "ATS" ? Game.ATS : Game.ETS2,
    };

    // 5️⃣ Gravar na DB
    const viagem = await prisma.viagem.create({ data: viagemData });

    // 6️⃣ Enviar para Discord
    await enviarViagemDiscord({
      motorista: motorista.name,
      camiao: viagemData.camiao,
      origem: viagemData.origem,
      destino: viagemData.destino,
      distancia: viagemData.distancia,
      dano: viagemData.dano,
      velocidadeMax: viagemData.velocidadeMax,
      data: viagemData.hora,
      game: viagemData.game,
    });

    return NextResponse.json(viagem);
  } catch (err) {
    console.error("Erro no webhook Trucky:", err);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}