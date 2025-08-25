import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enviarViagemDiscord } from "@/lib/discord";
import { Game } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 🔎 Logger temporário (ver JSON cru que chega do Trucky)
    console.log("Webhook Trucky recebido:", body);

    // Mapear dados (ajustar aos nomes reais do JSON do Trucky)
    const motoristaNome: string = body.driver?.name || "Desconhecido";
    const camiao: string = body.truck?.name || "—";
    const origem: string = body.sourceCity || "---";
    const destino: string = body.destinationCity || "---";
    const distancia: number = body.distance || 0;
    const dano: number = body.damage || 0;
    const velocidadeMax: number = body.speedMax || 0;
    const data: Date = body.date ? new Date(body.date) : new Date();

    const game: Game =
      body.game?.toUpperCase() === "ATS" ? "ATS" : "ETS2";

    // Verificar motorista no DB
    const user = await prisma.user.findUnique({
      where: { name: motoristaNome },
    });
    if (!user) {
      return NextResponse.json(
        { error: `Motorista ${motoristaNome} não registado no site` },
        { status: 404 }
      );
    }

    // Guardar no DB
    const viagem = await prisma.viagem.create({
      data: {
        motoristaId: user.id,
        camiao,
        origem,
        destino,
        distancia,
        dano,
        velocidadeMax,
        hora: data,
        game,
      },
    });

    // Reenviar para Discord
    await enviarViagemDiscord({
      motorista: user.name,
      camiao,
      origem,
      destino,
      distancia,
      game,
    });

    return NextResponse.json(viagem);
  } catch (error) {
    console.error("❌ Erro no webhook do Trucky:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}