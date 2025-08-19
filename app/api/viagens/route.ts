// app/api/trucksbook/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  author?: { name: string };
  fields?: DiscordEmbedField[];
}

interface DiscordWebhookPayload {
  embeds?: DiscordEmbed[];
}

export async function POST(req: Request) {
  try {
    const body: DiscordWebhookPayload = await req.json();

    const embed = body.embeds?.[0];
    if (!embed) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const fields = embed.fields ?? [];

    // 🔹 Helper para procurar field por nome
    const getFieldValue = (key: string): string =>
      fields.find((f) => f.name.includes(key))?.value || "";

    // Extrair dados
    const motorista = embed.author?.name || "Desconhecido";
    const origem = getFieldValue("A partir") || "---";
    const destino = getFieldValue("Para") || "---";
    const carga = getFieldValue("Carga");
    const distancia = parseInt(getFieldValue("Distância").replace(/\D/g, "")) || 0;
    const lucro = getFieldValue("Lucro");
    const camiao = getFieldValue("Caminhão");

    // Salvar no banco
    const viagem = await prisma.viagem.create({
      data: {
        motoristaId: motorista, // ⚠️ depois podes mapear para o ID real
        camiao,
        origem,
        destino,
        distancia,
        carga,
        lucro,
        dano: 0,
        velocidadeMax: 0,
        hora: new Date(),
        game: "ETS2",
      },
    });

    return NextResponse.json(viagem);
  } catch (err) {
    console.error("Erro no webhook:", err);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
