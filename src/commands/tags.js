import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tags")
    .setDescription("Muestra los tags disponibles"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const data = JSON.parse(fs.readFileSync("./data/memes.json"));
    const tags = [...new Set(data.map(m => m.tag))];

    const embed = createEmbed({
      title: "🏷 Tags disponibles",
      description: tags.map(t => `• ${t}`).join("\n"),
      color: "#00CED1"
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
