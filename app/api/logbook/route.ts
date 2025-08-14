import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const motoristaId = searchParams.get('motoristaId');
    const game = searchParams.get('game');
    const ano = searchParams.get('ano');
    const mes = searchParams.get('mes');

    if (!motoristaId) {
      return NextResponse.json({ error: 'Motorista não informado.' }, { status: 400 });
    }

    // Filtros dinâmicos
    const filtros: any = {
      motoristaId,
      ...(game ? { game: game as any } : {})
    };

    if (ano) {
      const anoNum = Number(ano);
      const mesNum = mes ? Number(mes) - 1 : 0; // Mês começa em 0 no JS
      const inicio = new Date(anoNum, mesNum, 1);
      const fim = mes ? new Date(anoNum, mesNum + 1, 0, 23, 59, 59) : new Date(anoNum, 11, 31, 23, 59, 59);

      filtros.data = {
        gte: inicio,
        lte: fim
      };
    }

    const viagens = await prisma.viagem.findMany({
      where: filtros,
      orderBy: { data: 'desc' },
      take: 10,
      include: {
        motorista: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(viagens);
  } catch (error) {
    console.error('Erro ao buscar logbook:', error);
    return NextResponse.json({ error: 'Erro ao buscar logbook.' }, { status: 500 });
  }
}
