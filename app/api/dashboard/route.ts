import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 401 })
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!session || session.expires < new Date()) {
    return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 })
  }

  const user = session.user

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const viagensPessoais = await prisma.viagem.findMany({
    where: { motoristaId: user.id }
  })

  const viagensDoMes = viagensPessoais.filter(v => {
    const d = new Date(v.data)
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
  })

  const kmMes = viagensDoMes.reduce((acc, v) => acc + v.distancia, 0)
  const cargas = viagensDoMes.length
  const limiteKm = 1500

  const viagensTotais = await prisma.viagem.findMany()

  const total = { km: 0, cargas: 0 }
  const ETS2 = { km: 0, cargas: 0 }
  const ATS = { km: 0, cargas: 0 }

  for (const v of viagensTotais) {
    total.km += v.distancia
    total.cargas += 1

    if (v.game === 'ETS2') {
      ETS2.km += v.distancia
      ETS2.cargas += 1
    } else if (v.game === 'ATS') {
      ATS.km += v.distancia
      ATS.cargas += 1
    }
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const viagensHoje = await prisma.viagem.findMany({
    where: {
      data: { gte: hoje }
    },
    include: { motorista: true },
    orderBy: { hora: 'desc' }
  })

  const viagensFormatadas = viagensHoje.map(v => ({
    motorista: v.motorista?.name || 'Desconhecido',
    camiao: v.camiao,
    origem: v.origem,
    destino: v.destino,
    distancia: v.distancia,
    dano: v.dano,
    velocidadeMax: v.velocidadeMax,
    hora: new Date(v.hora).toLocaleTimeString('pt-PT')
  }))

  return NextResponse.json({
    user: { name: user.name },
    resumoPessoal: { kmMes, cargas, limiteKm },
    resumoEmpresa: {
      total,
      ETS2,
      ATS
    },
    viagensHoje: viagensFormatadas
  })
}