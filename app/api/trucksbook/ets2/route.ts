// app/api/trucksbook/ets2/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface EmbedField { name: string; value: string; }
interface Embed { author?: { name?: string }; fields?: EmbedField[]; }
interface WebhookBody { embeds?: Embed[]; }

export async function POST(req: Request) {
  try {
    const body: WebhookBody = await req.json();
    const embed = body.embeds?.[0];

    if (!embed) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const cleanText = (txt: string | undefined): string =>
      txt ? txt.replace(/:flag_[a-z_]+:/gi, "").trim() : "---";

    const motoristaNome = embed.author?.name || "Desconhecido";
    const origem = cleanText(embed.fields?.find((f) => f.name.includes("A partir"))?.value);
    const destino = cleanText(embed.fields?.find((f) => f.name.includes("Para"))?.value);
    const camiao = embed.fields?.find((f) => f.name.includes("Camin"))?.value || "";
    const distancia = parseInt(
      embed.fields?.find((f) => f.name.includes("Distância"))?.value.replace(/\D/g, "") || "0"
    );

    const user = await prisma.user.findUnique({ where: { name: motoristaNome } });
    if (!user) {
      return NextResponse.json({ error: "Motorista não registado no site" }, { status: 404 });
    }

    const viagem = await prisma.viagem.create({
      data: { motoristaId: user.id, camiao, origem, destino, distancia, game: "ETS2" },
    });

    return NextResponse.json(viagem);
  } catch (err) {
    console.error("Erro ETS2:", err);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
