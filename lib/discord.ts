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
        thumbnail: "https://barcelcargo.pt/ETS2.png",
      }
    : {
        color: 0xe67e22,
        icon: "🚚",
        title: "American Truck Simulator",
        thumbnail: "https://barcelcargo.pt/ATS.png",
      };

  const embed = {
    title: `${gameConfig.icon} ${gameConfig.title}`,
    description: `📦 Nova viagem registada no sistema`,
    color: gameConfig.color,
    thumbnail: {
      url: gameConfig.thumbnail,
    },
    fields: [
      // 👨 Motorista e 🚚 Camião na mesma linha
      { name: "👨 Motorista", value: viagem.motorista, inline: true },
      { name: "🚚 Camião", value: viagem.camiao || "—", inline: true },

      // 🏁 Origem e 🎯 Destino na mesma linha
      { name: "🏁 Origem", value: viagem.origem, inline: true },
      { name: "🎯 Destino", value: viagem.destino, inline: true },

      // 📏 Distância sozinho em baixo
      { name: "📏 Distância", value: `${viagem.distancia} km`, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "BarcelCargo | Sistema Automático",
      icon_url: "https://i.imgur.com/ZU7gYvj.png",
    },
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
}
