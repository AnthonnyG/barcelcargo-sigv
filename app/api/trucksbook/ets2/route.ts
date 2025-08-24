import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enviarViagemDiscord } from "@/lib/discord";

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

    // 🔹 Remove bandeiras tipo ":flag_it:" ou espaços extras
    const cleanText = (txt: string | undefined): string =>
      txt ? txt.replace(/:flag_[a-z_]+:/gi, "").trim() : "---";

    // Extrair dados
    const motoristaNome = embed.author?.name || "Desconhecido";
    const origem = cleanText(embed.fields?.find((f) => f.name.includes("A partir"))?.value);
    const destino = cleanText(embed.fields?.find((f) => f.name.includes("Para"))?.value);

    // 🚚 Camião (procura em vários campos + fallback nos detalhes)
    let camiao = embed.fields?.find((f) =>
      f.name.toLowerCase().includes("caminhão") ||
      f.name.toLowerCase().includes("camiao") ||
      f.name.toLowerCase().includes("truck") ||
      f.name.toLowerCase().includes("veículo")
    )?.value || "";

    if (!camiao) {
      const detalhes = embed.fields?.find((f) =>
        f.name.toLowerCase().includes("detalhes")
      )?.value;

      if (detalhes) {
        const match = detalhes.match(/Cami[aã]o?:\s*([^\|]+)/i);
        if (match) {
          camiao = cleanText(match[1].trim());
        }
      }
    } else {
      camiao = cleanText(camiao);
    }

    // 📏 Distância (corrigido para pegar só números antes de "km")
    const distanciaField = embed.fields?.find((f) =>
      f.value.toLowerCase().includes("km")
    )?.value;

    let distancia = 0;
    if (distanciaField) {
      const match = distanciaField.match(/(\d+)\s*km/i);
      if (match) {
        distancia = parseInt(match[1], 10);
      }
    }

    // 🔍 Procurar motorista no DB
    const user = await prisma.user.findUnique({ where: { name: motoristaNome } });
    if (!user) {
      return NextResponse.json({ error: "Motorista não registado no site" }, { status: 404 });
    }

    // 💾 Gravar viagem
    const viagem = await prisma.viagem.create({
      data: {
        motoristaId: user.id,
        camiao,
        origem,
        destino,
        distancia,
        game: "ETS2",
      },
    });

    // 📡 Reenviar para o Discord
    await enviarViagemDiscord({
      motorista: user.name,
      camiao,
      origem,
      destino,
      distancia,
      game: "ETS2",
    });

    return NextResponse.json(viagem);
  } catch (err) {
    console.error("Erro ETS2:", err);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
