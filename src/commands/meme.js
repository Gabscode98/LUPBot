import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Envía un meme random")
    .addStringOption(o =>
      o.setName("tag")
        .setDescription("Ej: rod, selvin, yayo")
        .setRequired(false)
    ),

  async execute(interaction) {
    const tag = interaction.options.getString("tag");
    const data = JSON.parse(fs.readFileSync("./data/memes.json"));

    const filtrados = tag
      ? data.filter(m => m.tag === tag)
      : data;

    if (!filtrados.length)
      return interaction.reply({ content: "❌ No hay memes con ese tag.", ephemeral: true });

    const random = filtrados[Math.floor(Math.random() * filtrados.length)];

    const embed = createEmbed({
      title: `📸 Meme ${random.tag}`,
      description: `ID: **${random.id}**`,
      image: random.url
    });

    await interaction.reply({ embeds: [embed] });
  }
};
