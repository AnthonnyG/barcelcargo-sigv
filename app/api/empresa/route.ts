import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const fimMes = new Date(inicioMes);
    fimMes.setMonth(fimMes.getMonth() + 1);
    fimMes.setDate(0);
    fimMes.setHours(23, 59, 59, 999);

    // Total da empresa no mês
    const totalEmpresa = await prisma.viagem.aggregate({
      _sum: { distancia: true },
      _count: { id: true },
      where: { hora: { gte: inicioMes, lte: fimMes } },
    });

    // Top 3 motoristas (relacionando com User)
    const topMotoristas = await prisma.viagem.groupBy({
      by: ['motoristaId'],
      _sum: { distancia: true },
      where: { hora: { gte: inicioMes, lte: fimMes } },
      orderBy: { _sum: { distancia: 'desc' } },
      take: 3,
    });

    // Buscar nomes do User
    const topMotoristasDetalhes = await Promise.all(
      topMotoristas.map(async (m) => {
        const user = await prisma.user.findUnique({
          where: { id: m.motoristaId },
          select: { name: true },
        });
        return {
          nome: user?.name || 'Desconhecido',
          distancia: m._sum.distancia || 0,
        };
      })
    );

    return NextResponse.json({
      totalEmpresa: {
        kms: totalEmpresa._sum.distancia || 0,
        viagens: totalEmpresa._count.id || 0,
      },
      topMotoristas: topMotoristasDetalhes,
    });
  } catch (error) {
    console.error('Erro ao buscar dados da empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
