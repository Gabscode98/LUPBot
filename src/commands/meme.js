import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

const DB_PATH = "./data/memes.json";

export default {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Envía un meme random")
    .addStringOption(o =>
      o.setName("tag")
        .setDescription("Ej: rod, selvin, yayo")
        .setAutocomplete(true) // 👈 ESTA ES LA CLAVE
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    if (!fs.existsSync(DB_PATH)) {
      return interaction.editReply("❌ No hay memes registrados.");
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH));

    if (!data.length) {
      return interaction.editReply("❌ No hay memes disponibles.");
    }

    const tag = interaction.options
      .getString("tag")
      ?.toLowerCase()
      ?.trim();

    const filtrados = tag
      ? data.filter(m => m.tag === tag)
      : data;

    if (!filtrados.length) {
      return interaction.editReply("❌ No hay memes con ese tag.");
    }

    const random = filtrados[Math.floor(Math.random() * filtrados.length)];

    const embed = createEmbed({
      title: `📸 Meme ${random.tag.toUpperCase()}`,
      description: `🆔 ID: **${random.id}**`,
      image: random.url
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
