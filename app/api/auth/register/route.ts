import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { name } })
  if (exists) {
    return NextResponse.json({ success: false, error: 'Nome já em uso' }, { status: 409 })
  }

  const hashed = await hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      isApproved: false,
      role: 'DRIVER',
    }
  })

  return NextResponse.json({ success: true })
}