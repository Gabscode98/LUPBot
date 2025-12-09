import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tags")
    .setDescription("Muestra las categorías de memes disponibles"),

  async execute(interaction) {
    const filePath = "./data/memes.json";

    if (!fs.existsSync(filePath)) {
      return interaction.reply({ content: "❌ Aún no hay memes.", ephemeral: true });
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    const tags = [...new Set(data.map(m => m.tag))];

    const embed = createEmbed({
      title: "🏷 Categorías disponibles",
      description: tags.map(t => `• ${t}`).join("\n"),
      color: "#00BFFF"
    });

    await interaction.reply({ embeds: [embed] });
  }
};
