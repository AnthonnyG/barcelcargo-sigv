import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  const [admins, managers, drivers, total] = await Promise.all([
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'MANAGER' } }),
    prisma.user.count({ where: { role: 'DRIVER' } }),
    prisma.user.count(),
  ])

  return NextResponse.json({ admins, managers, drivers, total })
}