import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const DB = "./data/memes.json";

export default {
  data: new SlashCommandBuilder()
    .setName("eliminar")
    .setDescription("Elimina un meme por ID")
    .addStringOption(o =>
      o.setName("id").setDescription("ID del meme").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const id = interaction.options.getString("id");
    const data = JSON.parse(fs.readFileSync(DB));

    const index = data.findIndex(m => m.id === id);
    if (index === -1) {
      return interaction.editReply("❌ Ese ID no existe.");
    }

    data.splice(index, 1);
    fs.writeFileSync(DB, JSON.stringify(data, null, 2));

    return interaction.editReply(`🗑 Meme **${id}** eliminado correctamente.`);
  }
};
