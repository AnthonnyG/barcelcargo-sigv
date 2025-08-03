import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 401 })
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  const user = session?.user
  if (!user) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 403 })
  }

  return NextResponse.json({
    name: user.name ?? '',
    email: user.email ?? '',
    avatar: user.avatar ?? '',
    socials: user.socials ?? {
      youtube: '',
      twitch: '',
      tiktok: '',
      facebook: '',
      instagram: '',
      twitter: '',
    },
  })
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Token ausente' }, { status: 401 })
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  const user = session?.user
  if (!user) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 403 })
  }

  const formData = await req.formData()

  const name = formData.get('name')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const avatar = formData.get('avatar') as File | null

  const socials: Prisma.InputJsonValue = {
    youtube: formData.get('youtube')?.toString() ?? '',
    twitch: formData.get('twitch')?.toString() ?? '',
    tiktok: formData.get('tiktok')?.toString() ?? '',
    facebook: formData.get('facebook')?.toString() ?? '',
    instagram: formData.get('instagram')?.toString() ?? '',
    twitter: formData.get('twitter')?.toString() ?? '',
  }

  const updateData: {
    name?: string
    email?: string
    avatar?: string
    socials: Prisma.InputJsonValue
  } = { socials }

  if (name) updateData.name = name
  if (email) updateData.email = email

  if (avatar && avatar.size > 0) {
    const bytes = await avatar.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `${user.id}.jpg`
    const filepath = path.join(process.cwd(), 'public', 'avatars', filename)
    await writeFile(filepath, buffer)
    updateData.avatar = `/avatars/${filename}`
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  })

  return NextResponse.json({ success: true })
}