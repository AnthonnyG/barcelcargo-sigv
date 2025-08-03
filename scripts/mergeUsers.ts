// scripts/mergeUsers.ts
import prisma from '@/lib/db'

async function mergeUsers(oldName: string, newName: string) {
  const oldUser = await prisma.user.findUnique({ where: { name: oldName } })
  const newUser = await prisma.user.findUnique({ where: { name: newName } })

  if (!oldUser || !newUser) {
    console.error('❌ Utilizador antigo ou novo não encontrado.')
    return
  }

  if (oldUser.id === newUser.id) {
    console.log('⚠️ Ambos os nomes pertencem ao mesmo utilizador. Nada a fundir.')
    return
  }

  // Transferir viagens
  const viagensAtualizadas = await prisma.viagem.updateMany({
    where: { motoristaId: oldUser.id },
    data: { motoristaId: newUser.id }
  })

  // Apagar utilizador antigo
  await prisma.user.delete({ where: { id: oldUser.id } })

  console.log(`✅ Fundidos com sucesso: ${viagensAtualizadas.count} viagens transferidas de "${oldName}" para "${newName}".`)
}

// EXEMPLO de uso
mergeUsers('Anthonny Gamer', 'Anthonny')
  .catch(e => {
    console.error('🔥 Erro:', e)
  })
  .finally(() => process.exit())