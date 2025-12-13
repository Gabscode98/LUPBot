import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const DB = "./data/memes.json";

export default {
  data: new SlashCommandBuilder()
    .setName("renombrar")
    .setDescription("Cambia el tag de un meme")
    .addStringOption(o =>
      o.setName("id").setDescription("ID del meme").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("tag").setDescription("Nuevo tag").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const id = interaction.options.getString("id");
    const tag = interaction.options.getString("tag");

    const data = JSON.parse(fs.readFileSync(DB));
    const meme = data.find(m => m.id === id);

    if (!meme) {
      return interaction.editReply("❌ Meme no encontrado.");
    }

    meme.tag = tag;
    fs.writeFileSync(DB, JSON.stringify(data, null, 2));

    return interaction.editReply(`✏️ Meme **${id}** actualizado a tag **${tag}**`);
  }
};
