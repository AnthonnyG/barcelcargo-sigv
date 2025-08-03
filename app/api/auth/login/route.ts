import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { compare } from 'bcryptjs'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { name, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { name } })
  if (!user) {
    return NextResponse.json({ success: false, error: 'Utilizador não encontrado' }, { status: 401 })
  }

  const valid = await compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ success: false, error: 'Palavra-passe inválida' }, { status: 401 })
  }

  if (!user.isApproved) {
    return NextResponse.json(
      { success: false, error: 'A tua conta ainda não foi aprovada.' },
      { status: 403 }
    )
  }

  const token = randomUUID()
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h

  const existing = await prisma.session.findFirst({
    where: { userId: user.id }
  })

  if (existing) {
    await prisma.session.update({
      where: { id: existing.id },
      data: { token, expires }
    })
  } else {
    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expires
      }
    })
  }

  return NextResponse.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, role: user.role }
  })
}