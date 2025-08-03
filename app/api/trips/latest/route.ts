import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const trips = await prisma.viagem.findMany({
    orderBy: { data: 'desc' },
    take: 20,
    include: { motorista: true },
  })

  return NextResponse.json(trips.map(t => ({
    id: t.id,
    motorista: t.motorista.name,
    data: t.data,
    origem: t.origem,
    destino: t.destino,
    km: t.distancia
  })))
}