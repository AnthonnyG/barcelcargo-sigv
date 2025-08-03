// scripts/create-admin.ts
import { hash } from 'bcryptjs'
import prisma from '../lib/db'

async function main() {
  const name = 'Anthonny'
  const email = 'accpt1981@gmail.com'
  const password = '19Lst@7500?157'

  const existing = await prisma.user.findUnique({ where: { name } })
  if (existing) {
    console.log('❌ Admin já existe.')
    return
  }

  const hashedPassword = await hash(password, 10)

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN',
    }
  })

  console.log('✅ Admin criado com sucesso:', admin)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())