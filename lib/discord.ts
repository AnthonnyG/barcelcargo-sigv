// lib/discord.ts
import axios from 'axios';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

if (!DISCORD_WEBHOOK_URL) {
  console.error('⚠️ Variável DISCORD_WEBHOOK_URL não configurada!');
}

function getTruckImage(camiao: string): string {
  const map: Record<string, string> = {
    'Scania R': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Scania_R500.jpg',
    'Volvo FH': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Volvo_FH16.jpg',
    'Mercedes Actros': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Mercedes_Actros.jpg',
  };

  return map[camiao] || 'https://i.imgur.com/Yf1VxS2.jpeg'; // imagem genérica
}

export async function enviarViagemDiscord(viagem: {
  motorista: { name: string };
  camiao: string;
  origem: string;
  destino: string;
  distancia: number;
  dano: number;
  velocidadeMax: number;
  hora: Date;
  game: string;
}) {
  if (!DISCORD_WEBHOOK_URL) return;

  const mensagem = {
    content: '@everyone 🚚 **Nova Viagem Registrada!**',
    embeds: [
      {
        title: `🚚 Nova Viagem (${viagem.game})`,
        color: 0x2ecc71,
        thumbnail: { url: getTruckImage(viagem.camiao) },
        fields: [
          { name: '👤 Motorista', value: viagem.motorista.name, inline: true },
          { name: '🚛 Caminhão', value: viagem.camiao, inline: true },
          { name: '📍 Origem', value: viagem.origem, inline: true },
          { name: '🏁 Destino', value: viagem.destino, inline: true },
          { name: '📏 Distância', value: `${viagem.distancia} km`, inline: true },
          { name: '💥 Dano', value: `${viagem.dano}%`, inline: true },
          { name: '⚡ Velocidade Máx.', value: `${viagem.velocidadeMax} km/h`, inline: true },
          { name: '🕒 Hora', value: viagem.hora.toLocaleString('pt-PT'), inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, mensagem);
    console.log(`✅ Webhook enviado para Discord (${viagem.motorista.name})`);
  } catch (err) {
    console.error('❌ Erro ao enviar webhook para Discord:', err);
  }
}
