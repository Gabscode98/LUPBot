import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

const DB_PATH = "./data/memes.json";

export default {
  data: new SlashCommandBuilder()
    .setName("meme_id")
    .setDescription("Muestra un meme por su ID")
    .addStringOption(o =>
      o.setName("id")
        .setDescription("ID del meme (ej: 001)")
        .setRequired(true)
        .setAutocomplete(true) // 👈 ESTA LÍNEA
    ),

  async execute(interaction) {
    await interaction.deferReply();

    if (!fs.existsSync(DB_PATH)) {
      return interaction.editReply("❌ No hay memes registrados.");
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH));
    const id = interaction.options.getString("id");

    const meme = data.find(m => m.id === id);

    if (!meme) {
      return interaction.editReply("❌ No existe un meme con ese ID.");
    }

    const embed = createEmbed({
      title: `📸 Meme ${meme.tag.toUpperCase()}`,
      description: `🆔 ID: **${meme.id}**`,
      image: meme.url,
      color: "#FF4500"
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
