// lib/discord.ts
export async function enviarViagemDiscord(viagem: {
  motorista: string;
  camiao: string;
  origem: string;
  destino: string;
  distancia: number;
  game: "ETS2" | "ATS";
}) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    console.warn("DISCORD_WEBHOOK_URL não configurado.");
    return;
  }

  // 🎨 Config ETS2 / ATS
  const gameConfig = viagem.game === "ETS2"
    ? {
        color: 0x2ecc71,
        icon: "🚛",
        title: "Euro Truck Simulator 2",
        thumbnail: "https://i.imgur.com/vmZ9p6Y.png", // logo ETS2
      }
    : {
        color: 0xe67e22,
        icon: "🚚",
        title: "American Truck Simulator",
        thumbnail: "https://i.imgur.com/Qu1jM4K.png", // logo ATS
      };

  const embed = {
    title: `${gameConfig.icon} ${gameConfig.title}`,
    description: `📦 Nova viagem registada no sistema`,
    color: gameConfig.color,
    thumbnail: {
      url: gameConfig.thumbnail,
    },
    fields: [
      { name: "👨 Motorista", value: viagem.motorista, inline: true },
      { name: "🚚 Camião", value: viagem.camiao, inline: true },
      { name: "🏁 Origem", value: viagem.origem, inline: true },
      { name: "🎯 Destino", value: viagem.destino, inline: true },
      { name: "📏 Distância", value: `${viagem.distancia} km`, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "BarcelCargo | Sistema Automático",
      icon_url: "https://i.imgur.com/ZU7gYvj.png", // logo da empresa se quiseres
    },
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
}
