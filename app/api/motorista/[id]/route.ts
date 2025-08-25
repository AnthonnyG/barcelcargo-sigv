import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// ATENÇÃO: função SEM o segundo argumento! params vêm do URL diretamente.
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.pathname.split('/').pop()

  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 401 })
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!session) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 403 })
  }

  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) {
    return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
  }

  // ... (restante lógica intacta — estatísticas, prémios, viagens, etc.)

  const socials = user.socials || {}

  const [ets2, ats] = await Promise.all([
    prisma.viagem.aggregate({
      where: { motoristaId: id, game: 'ETS2' },
      _sum: { distancia: true },
      _count: { id: true }
    }),
    prisma.viagem.aggregate({
      where: { motoristaId: id, game: 'ATS' },
      _sum: { distancia: true },
      _count: { id: true }
    })
  ])

  const totalKm = (ets2._sum?.distancia ?? 0) + (ats._sum?.distancia ?? 0)
  const totalCargas = (ets2._count?.id ?? 0) + (ats._count?.id ?? 0)

  const hojeData = new Date()
  hojeData.setHours(0, 0, 0, 0)

  const hojeStats = await prisma.viagem.aggregate({
    where: {
      motoristaId: id,
      data: { gte: hojeData }
    },
    _sum: { distancia: true },
    _count: { id: true }
  })

  const rankingViagens = await prisma.viagem.groupBy({
    by: ['motoristaId'],
    _sum: { distancia: true },
    orderBy: {
      _sum: { distancia: 'desc' }
    }
  })

  const posicao = rankingViagens.findIndex(r => r.motoristaId === id) + 1

  const [trofeus, medalhas, tacas] = await Promise.all([
    prisma.trofeu.findMany({
      where: { userId: id },
      select: { id: true, titulo: true, imagem: true },
      orderBy: { titulo: 'asc' }
    }),
    prisma.medalha.findMany({
      where: { userId: id },
      select: { id: true, titulo: true },
      orderBy: { titulo: 'asc' }
    }),
    prisma.taca.findMany({
      where: { userId: id },
      select: { id: true, titulo: true },
      orderBy: { titulo: 'asc' }
    })
  ])

  const ultimas = await prisma.viagem.findMany({
    where: { motoristaId: id },
    orderBy: { data: 'desc' },
    take: 10,
    select: {
      id: true,
      camiao: true,
      origem: true,
      destino: true,
      distancia: true,
      dano: true,
      velocidadeMax: true,
      data: true
    }
  })

  return NextResponse.json({
    name: user.name,
    avatar: user.avatar ?? '',
    socials,
    estatisticas: {
      ets2: {
        km: ets2._sum?.distancia ?? 0,
        cargas: ets2._count?.id ?? 0
      },
      ats: {
        km: ats._sum?.distancia ?? 0,
        cargas: ats._count?.id ?? 0
      },
      total: {
        km: totalKm,
        cargas: totalCargas
      }
    },
    hoje: {
      km: hojeStats._sum?.distancia ?? 0,
      cargas: hojeStats._count?.id ?? 0
    },
    ranking: { posicao },
    trofeus,
    medalhas,
    tacas,
    ultimas
  })
}