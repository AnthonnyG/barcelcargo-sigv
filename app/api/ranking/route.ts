import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type RankingResult = {
  id: string
  name: string
  avatar: string
  isApproved: boolean
  role: string
  totalKm: number
  kmYear: number
  kmMonth: number
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const type = searchParams.get('type') || 'general'
  const game = searchParams.get('game') || 'TOTAL'

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const year = parseInt(searchParams.get('year') || `${currentYear}`)
  const month = parseInt(searchParams.get('month') || `${currentMonth}`)

  const users = await prisma.user.findMany({
    include: {
      viagens: true
    }
  })

  const results: RankingResult[] = users.map(user => {
    const viagens = game === 'TOTAL'
      ? user.viagens
      : user.viagens.filter(v => v.game === game)

    const totalKm = viagens.reduce((sum, v) => sum + v.distancia, 0)

    const kmYear = viagens
      .filter(v => new Date(v.data).getFullYear() === year)
      .reduce((sum, v) => sum + v.distancia, 0)

    const kmMonth = viagens
      .filter(v => {
        const d = new Date(v.data)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
      .reduce((sum, v) => sum + v.distancia, 0)

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar || '/logo.jpg',
      isApproved: user.isApproved,
      role: user.role,
      totalKm,
      kmYear,
      kmMonth,
    }
  })

  let final: RankingResult[] = []

  if (type === 'general') {
    final = results
      .filter(u => u.isApproved && u.role !== 'EXPULSO')
      .sort((a, b) => b.totalKm - a.totalKm)
  } else if (type === 'yearly') {
    final = results
      .filter(u => u.kmYear > 0)
      .sort((a, b) => b.kmYear - a.kmYear)
  } else if (type === 'monthly') {
    final = results
      .filter(u => u.kmMonth > 0)
      .sort((a, b) => b.kmMonth - a.kmMonth)
  }

  const response = final.map(({ isApproved, role, ...rest }) => rest)

  return NextResponse.json(response)
}