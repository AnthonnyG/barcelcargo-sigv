import { prisma } from '@/lib/db'

async function deleteUserByName(name: string) {
  const users = await prisma.user.findMany({ where: { name } })

  if (!users.length) {
    console.log(`❌ Nenhum utilizador com nome "${name}" encontrado.`)
    return
  }

  for (const user of users) {
    console.log(`✅ Encontrado: ${user.name} (${user.id})`)

    // Apagar sessões associadas
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    // Apagar viagens associadas (caso não tenhas cascade)
    await prisma.viagem.deleteMany({
      where: { motoristaId: user.id },
    })

    // Finalmente, apagar o utilizador
    await prisma.user.delete({
      where: { id: user.id },
    })

    console.log(`🗑️ Utilizador eliminado: ${user.name}`)
  }
}

deleteUserByName('antonio').finally(() => process.exit())