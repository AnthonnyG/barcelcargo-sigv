import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET → Lista todas as viagens (já implementado)
export async function GET() {
  try {
    const viagens = await prisma.viagem.findMany({
      orderBy: { data: 'desc' },
      include: {
        motorista: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(viagens)
  } catch (error) {
    console.error('Erro ao buscar viagens:', error)
    return NextResponse.json({ error: 'Erro ao buscar viagens' }, { status: 500 })
  }
}

// POST → Recebe dados da app e grava no banco
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      motoristaId,
      camiao,
      origem,
      destino,
      distancia,
      dano,
      velocidadeMax,
      hora,
      game // <-- Novo campo
    } = body

    if (
      !motoristaId ||
      !camiao ||
      !origem ||
      !destino ||
      !distancia ||
      !hora ||
      !game // <-- Validação do novo campo
    ) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    const novaViagem = await prisma.viagem.create({
      data: {
        motoristaId,
        camiao,
        origem,
        destino,
        distancia,
        dano: typeof dano === 'number' ? dano : Number(dano) || 0,
        velocidadeMax: typeof velocidadeMax === 'number' ? velocidadeMax : Number(velocidadeMax) || 0,
        hora: new Date(hora),
        game // <-- Inserção do campo
      }
    })

    return NextResponse.json(novaViagem)
  } catch (error) {
    console.error('Erro ao registar nova viagem:', error)
    return NextResponse.json({ error: 'Erro ao registar viagem' }, { status: 500 })
  }
}