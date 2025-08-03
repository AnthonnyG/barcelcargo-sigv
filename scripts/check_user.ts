import { prisma } from '@/lib/db'

async function main() {
  const userId = 'COLOCA_AQUI_O_ID_DO_UTILIZADOR'

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (user) {
    console.log('✅ Encontrado:', user)
  } else {
    console.log('❌ Não encontrado')
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())