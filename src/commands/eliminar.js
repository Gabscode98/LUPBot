import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("eliminar")
    .setDescription("Elimina un meme por ID")
    .addStringOption(o =>
      o.setName("id")
        .setDescription("ID del meme")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const filePath = "./data/memes.json";

    if (!fs.existsSync(filePath)) {
      return interaction.reply({ content: "❌ No existe la base de datos.", ephemeral: true });
    }

    const data = JSON.parse(fs.readFileSync(filePath));
    const index = data.findIndex(m => m.id === id);

    if (index === -1) {
      return interaction.reply({ content: "❌ ID no encontrado.", ephemeral: true });
    }

    const eliminado = data.splice(index, 1)[0];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const embed = createEmbed({
      title: "🗑 Meme eliminado",
      description: `ID: **${eliminado.id}**\nTag: **${eliminado.tag}**`,
      color: "#FF0000"
    });

    await interaction.reply({ embeds: [embed] });
  }
};
