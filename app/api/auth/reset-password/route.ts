import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 })
  }

  const reset = await prisma.resetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!reset || reset.expires < new Date()) {
    return NextResponse.json({ success: false, error: 'Token inválido ou expirado' }, { status: 400 })
  }

  const hashed = await hash(password, 10)

  await prisma.user.update({
    where: { id: reset.userId },
    data: { password: hashed },
  })

  await prisma.resetToken.delete({ where: { token } })

  return NextResponse.json({ success: true })
}