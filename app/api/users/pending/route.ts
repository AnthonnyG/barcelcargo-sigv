import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const users = await prisma.user.findMany({ where: { isApproved: false } })
  return NextResponse.json(users)
}

export async function PATCH(req: Request) {
  const { id } = await req.json()
  await prisma.user.update({ where: { id }, data: { isApproved: true } })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}