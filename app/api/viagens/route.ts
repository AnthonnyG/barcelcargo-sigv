// app/api/trucksbook/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const embed = body.embeds?.[0];
    if (!embed) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    // Extrair dados do embed do TrucksBook
    const motoristaNome = embed.author?.name || "Desconhecido";
    const origem =
      embed.fields?.find((f: { name: string }) => f.name.includes("A partir"))
        ?.value || "---";
    const destino =
      embed.fields?.find((f: { name: string }) => f.name.includes("Para"))
        ?.value || "---";
    const carga =
      embed.fields?.find((f: { name: string }) => f.name.includes("Carga"))
        ?.value || "";
    const distancia = parseInt(
      embed.fields
        ?.find((f: { name: string }) => f.name.includes("Distância"))
        ?.value.replace(/\D/g, "") || "0"
    );
    const lucro =
      embed.fields?.find((f: { name: string }) => f.name.includes("Lucro"))
        ?.value || "";
    const camiao =
      embed.fields?.find((f: { name: string }) => f.name.includes("Caminhão"))
        ?.value || "";

    // Procurar motorista real no DB
    const user = await prisma.user.findUnique({
      where: { name: motoristaNome },
    });

    if (!user) {
      console.warn(
        `Motorista "${motoristaNome}" não encontrado no site, ignorando viagem.`
      );
      return NextResponse.json(
        { error: "Motorista não registado no site" },
        { status: 404 }
      );
    }

    // Salvar viagem associada ao motorista real
    const viagem = await prisma.viagem.create({
      data: {
        motoristaId: user.id,
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
