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

    // 🔹 Remove bandeiras tipo ":flag_it:"
    const cleanText = (txt: string | undefined): string =>
      txt ? txt.replace(/:flag_[a-z_]+:/gi, "").trim() : "---";

    // Extrair dados
    const motoristaNome = embed.author?.name || "Desconhecido";
    const origem = cleanText(embed.fields?.find((f) => f.name.includes("A partir"))?.value);
    const destino = cleanText(embed.fields?.find((f) => f.name.includes("Para"))?.value);
// Tenta apanhar camião diretamente
let camiao = embed.fields?.find((f) =>
  f.name.toLowerCase().includes("caminhão") ||
  f.name.toLowerCase().includes("camiao") ||
  f.name.toLowerCase().includes("truck") ||
  f.name.toLowerCase().includes("veículo")
)?.value || "";

// Se não achou, tenta buscar dentro de "Detalhes"
if (!camiao) {
  const detalhes = embed.fields?.find((f) =>
    f.name.toLowerCase().includes("detalhes")
  )?.value;

  if (detalhes) {
    const match = detalhes.match(/Cami[aã]o?:\s*([^\|]+)/i); // pega até ao próximo |
    if (match) {
      camiao = match[1].trim();
    }
  }
}

// Distância: pode vir como "[Real] – 644 km" ou "[WoT] – 650 km"
const distanciaField = embed.fields?.find(
  (f) => f.value.toLowerCase().includes("km")
)?.value;

const distancia = distanciaField
  ? parseInt(distanciaField.replace(/\D/g, "")) || 0
  : 0;

    // Procurar motorista no DB
    const user = await prisma.user.findUnique({ where: { name: motoristaNome } });
    if (!user) {
      return NextResponse.json({ error: "Motorista não registado no site" }, { status: 404 });
    }

    // Gravar viagem
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

    // Reenviar para o Discord
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
