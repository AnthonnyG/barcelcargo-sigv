// lib/discord.ts
function parseFlags(text: string): string {
  if (!text) return "---";
  return text.replace(/:flag_([a-z]{2}):/gi, (_, code) => {
    const base = code.toUpperCase();
    return String.fromCodePoint(...[...base].map(c => 0x1f1e6 - 65 + c.charCodeAt(0)));
  }).trim();
}

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
      { name: "👨 Motorista", value: viagem.motorista, inline: true },
      { name: "🚚 Camião", value: viagem.camiao || "—", inline: true },

      // Origem e destino com bandeiras reais
      { name: "🏁 Origem", value: parseFlags(viagem.origem), inline: false },
      { name: "🎯 Destino", value: parseFlags(viagem.destino), inline: true },

      { name: "📏 Distância", value: `${viagem.distancia} km`, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "BarcelCargo | Sistema Automático",
      icon_url: "https://barcelcargo.pt/logo.jpg",
    },
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
}
