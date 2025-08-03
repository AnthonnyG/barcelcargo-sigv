import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const now = new Date()
  const currentYear = now.getFullYear()

  const raw = await prisma.viagem.findMany({
    select: { data: true, distancia: true },
    where: {
      data: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`)
      }
    }
  })

  const meses: string[] = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ]

  const grouped = raw.reduce((acc, { data, distancia }) => {
    const mesIndex = new Date(data).getMonth()
    acc[mesIndex] = (acc[mesIndex] || 0) + distancia
    return acc
  }, {} as Record<number, number>)

  const final = meses.map((mes, index) => ({
    mes,
    km: grouped[index] || 0
  }))

  return NextResponse.json(final)
}