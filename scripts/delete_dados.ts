import { prisma } from '@/lib/db'

async function deleteUserCascade(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      console.log(`⚠️ Utilizador com ID ${userId} não existe.`)
      return
    }

    console.log(`🔍 A apagar dados associados a: ${user.name}`)

    await prisma.viagem.deleteMany({ where: { motoristaId: userId } })
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.resetToken.deleteMany({ where: { userId } })

    await prisma.user.delete({ where: { id: userId } })

    console.log(`✅ Utilizador ${user.name} removido com sucesso.`)
  } catch (error) {
    console.error(`❌ Erro ao apagar utilizador:`, error)
  } finally {
    await prisma.$disconnect()
  }
}

// ⛳ Substituir pelo ID real
deleteUserCascade('antonio')