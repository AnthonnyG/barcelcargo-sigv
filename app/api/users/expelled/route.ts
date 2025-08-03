import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  console.log('📦 API /api/users/expelled acionada')

  const expulsos = await prisma.user.findMany({
    where: {
      role: 'EXPULSO',
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  console.log(`👥 ${expulsos.length} utilizadores expulsos encontrados`)
  return NextResponse.json(expulsos)
}