import { prisma } from '@/lib/db'

async function checkIntegrity() {
  const users = await prisma.user.findMany({ select: { id: true } })
  const validUserIds = users.map(u => u.id)

  const orphanedViagens = await prisma.viagem.findMany({
    where: {
      motoristaId: {
        notIn: validUserIds
      }
    }
  })

  if (orphanedViagens.length > 0) {
    console.log(`❌ Encontradas ${orphanedViagens.length} viagens com motoristaId inválido:`)
    orphanedViagens.forEach(v => {
      console.log(`- Viagem ID: ${v.id}, motoristaId inválido: ${v.motoristaId}`)
    })
  } else {
    console.log('✅ Nenhuma viagem órfã encontrada. DB íntegra!')
  }
}

checkIntegrity()
  .catch((err) => {
    console.error('🔥 Erro ao verificar integridade:', err)
  })
  .finally(() => process.exit())