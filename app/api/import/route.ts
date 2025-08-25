import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse";
import prisma from "@/lib/db";
import { Game } from "@prisma/client";

// 🔹 Função para normalizar nomes (remove acentos e espaços duplicados)
function normalizeName(name: string): string {
  return name
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ") // colapsa espaços
    .trim();
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Ficheiro CSV não fornecido." }, { status: 400 });
    }

    const text = await file.text();
    const delimiter = text.includes(";") ? ";" : ",";

    const records: {
      motoristaNome: string;
      game: Game;
      origem: string;
      destino: string;
      distancia: number;
      dano: number;
      camiao: string;
      velocidadeMax: number;
      data: Date;
    }[] = [];

    await new Promise((resolve, reject) => {
      parse(text, {
        columns: true,
        skip_empty_lines: true,
        delimiter,
        trim: true,
      })
        .on("data", (row) => {
          try {
            records.push({
              motoristaNome: normalizeName(row.Name), // 🔹 normaliza o nome
              game: row.Game.toUpperCase() as Game,
              origem: row.From,
              destino: row.To,
              distancia: parseInt(row["Accepted distance"].replace(/\D/g, "")),
              dano: parseInt(row.Damage || "0"),
              camiao: row.Truck,
              velocidadeMax: parseInt(row["Maximal reached speed"].replace(/\D/g, "")),
              data: new Date(row.Date),
            });
          } catch (err) {
            // Ignora linha mal formatada
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    let importados = 0;

    for (const r of records) {
      const user = await prisma.user.upsert({
        where: { name: r.motoristaNome },
        update: {},
        create: {
          name: r.motoristaNome,
          email: `${r.motoristaNome.toLowerCase().replace(/\s/g, "")}@sigv.local`,
          password: "imported",
          isApproved: true,
        },
      });

      await prisma.viagem.create({
        data: {
          motoristaId: user.id,
          camiao: r.camiao,
          origem: r.origem,
          destino: r.destino,
          distancia: r.distancia,
          dano: r.dano,
          velocidadeMax: r.velocidadeMax,
          data: r.data,
          hora: r.data,
          game: r.game,
        },
      });

      importados++;
    }

    return NextResponse.json({
      message: `✅ Importados ${importados} registos com sucesso.`,
    });
  } catch (error) {
    console.error("🔥 Erro inesperado:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}