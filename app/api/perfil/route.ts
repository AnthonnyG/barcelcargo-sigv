import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 401 })
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  })

  const user = session?.user
  if (!user) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 403 })
  }

  const socials = user.socials || {}

  // Estatísticas ETS2 & ATS
  const [ets2, ats] = await Promise.all([
    prisma.viagem.aggregate({
      where: { motoristaId: user.id, game: 'ETS2' },
      _sum: { distancia: true },
      _count: { id: true }
    }),
    prisma.viagem.aggregate({
      where: { motoristaId: user.id, game: 'ATS' },
      _sum: { distancia: true },
      _count: { id: true }
    })
  ])

  const totalKm = (ets2._sum?.distancia ?? 0) + (ats._sum?.distancia ?? 0)
  const totalCargas = (ets2._count?.id ?? 0) + (ats._count?.id ?? 0)

  // Estatísticas de hoje
  const hojeData = new Date()
  hojeData.setHours(0, 0, 0, 0)

  const hojeStats = await prisma.viagem.aggregate({
    where: {
      motoristaId: user.id,
      data: { gte: hojeData }
    },
    _sum: { distancia: true },
    _count: { id: true }
  })

  // Ranking
  const rankingViagens = await prisma.viagem.groupBy({
    by: ['motoristaId'],
    _sum: { distancia: true },
    orderBy: {
      _sum: { distancia: 'desc' }
    },
    take: 10
  })

  const ids = rankingViagens.map(r => r.motoristaId)

  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, avatar: true }
  })

  const ranking = rankingViagens.map((r, i) => {
    const u = users.find(u => u.id === r.motoristaId)
    return {
      posicao: i + 1,
      nome: u?.name ?? '',
      avatar: u?.avatar ?? '',
      userId: u?.id ?? ''
    }
  })

  const posicao = ranking.find(r => r.userId === user.id)?.posicao || 0

  // Prémios
  const [trofeus, medalhas, tacas] = await Promise.all([
    prisma.trofeu.findMany({
      where: { userId: user.id },
      select: { id: true, titulo: true, imagem: true },
      orderBy: { titulo: 'asc' }
    }),
    prisma.medalha.findMany({
      where: { userId: user.id },
      select: { id: true, titulo: true },
      orderBy: { titulo: 'asc' }
    }),
    prisma.taca.findMany({
      where: { userId: user.id },
      select: { id: true, titulo: true },
      orderBy: { titulo: 'asc' }
    })
  ])

  // Últimas 10 viagens
  const ultimas = await prisma.viagem.findMany({
    where: { motoristaId: user.id },
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
    ranking: {
      posicao,
      top10: ranking
    },
    trofeus,
    medalhas,
    tacas,
    ultimas
  })
}