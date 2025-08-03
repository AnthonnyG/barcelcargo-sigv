import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const users = await prisma.user.findMany({
    where: { isApproved: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
    },
  })
  return NextResponse.json(users)
}

export async function PATCH(req: NextRequest) {
  const { id, role } = await req.json()

  // 🔁 Lê o token do header Authorization
  const auth = req.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || !session.user.isApproved) {
    return NextResponse.json({ error: 'Sessão inválida ou utilizador não aprovado' }, { status: 403 })
  }

  const requestingUser = session.user

  // ❌ Apenas ADMIN pode alterar cargos
  if (requestingUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas ADMIN pode alterar cargos' }, { status: 403 })
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { role: true, isApproved: true },
  })

  if (!targetUser) {
    return NextResponse.json({ error: 'Utilizador alvo não encontrado' }, { status: 404 })
  }

  // ✅ ADMIN pode mudar qualquer role, inclusive rebaixar/prometer ADMIN

  await prisma.user.update({
    where: { id },
    data: {
      role,
      isApproved: targetUser.isApproved,
    },
  })

  return NextResponse.json({ success: true })
}