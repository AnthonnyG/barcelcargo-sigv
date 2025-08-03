// lib/getUserFromToken.ts
import prisma from './db'

export async function getUserFromToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!session || session.expires < new Date()) return null

  return session.user
}