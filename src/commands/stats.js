import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";
const DB_PATH = "./data/memes.json";

export default {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Muestra estadísticas de los memes"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!fs.existsSync(DB_PATH)) {
      return interaction.editReply("❌ No hay memes registrados.");
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH));

    if (!data.length) {
      return interaction.editReply("❌ No hay memes disponibles.");
    }

    const total = data.length;

    // Conteo por tag
    const conteo = {};
    for (const meme of data) {
      conteo[meme.tag] = (conteo[meme.tag] || 0) + 1;
    }

    const fields = Object.entries(conteo).map(([tag, cantidad]) => ({
      name: `🏷 ${tag}`,
      value: `${cantidad} meme(s)`,
      inline: true
    }));

    const embed = createEmbed({
      title: "📊 Estadísticas de memes",
      description: `📦 Total de memes: **${total}**`,
      fields,
      color: "#1E90FF"
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
