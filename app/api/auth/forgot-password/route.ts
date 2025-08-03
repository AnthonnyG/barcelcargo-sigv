import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { email }: { email: string } = await req.json()

  if (!email) {
    return NextResponse.json({ success: false, error: 'Email obrigatório' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json({ success: false, error: 'Nenhum utilizador com este email' }, { status: 404 })
  }

  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

  await prisma.resetToken.deleteMany({ where: { userId: user.id } })

  await prisma.resetToken.create({
    data: {
      token,
      userId: user.id,
      expires
    }
  })

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return NextResponse.json({ success: false, error: 'Email não configurado corretamente' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const resetLink = `${process.env.BASE_URL || 'https://barcelcargo.pt'}/reset-password?token=${token}`

  try {
    await transporter.sendMail({
      from: `"SIGV" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperação de Palavra-passe',
      html: `
        <h2>Recuperação de acesso</h2>
        <p>Clique no link abaixo para definir uma nova palavra-passe:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este link expira em 1 hora.</p>
      `
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao enviar email:', err)
    return NextResponse.json({ success: false, error: 'Erro ao enviar email' }, { status: 500 })
  }
}