import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';
import { writeFile } from 'fs/promises';
type InputJsonValue = { [key: string]: any };

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function PUT(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Token ausente' }, { status: 401 });

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session?.user) return NextResponse.json({ error: 'Sessão inválida' }, { status: 403 });

  const formData = await req.formData();

  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const avatarFile = formData.get('avatar') as File | null;

  const socials: InputJsonValue = {
    youtube: formData.get('youtube')?.toString() ?? '',
    twitch: formData.get('twitch')?.toString() ?? '',
    tiktok: formData.get('tiktok')?.toString() ?? '',
    facebook: formData.get('facebook')?.toString() ?? '',
    instagram: formData.get('instagram')?.toString() ?? '',
    twitter: formData.get('twitter')?.toString() ?? '',
  };

  const updateData: {
    name?: string;
    email?: string;
    avatar?: string;
    socials: InputJsonValue;
  } = { socials };

  if (name) updateData.name = name;
  if (email) updateData.email = email;

  if (avatarFile && avatarFile.size > 0) {
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const ext = path.extname(avatarFile.name) || '.jpg';
    const fileName = `${session.user.id}${ext}`;
    const filePath = path.join(process.cwd(), 'public', 'avatars', fileName);

    await writeFile(filePath, buffer);
    updateData.avatar = `/avatars/${fileName}`;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData
  });

  return NextResponse.json({ success: true });
}