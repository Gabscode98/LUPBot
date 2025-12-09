import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("renombrar")
    .setDescription("Cambia el tag de un meme")
    .addStringOption(o =>
      o.setName("id")
        .setDescription("ID del meme")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("tag")
        .setDescription("Nuevo tag")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const nuevoTag = interaction.options.getString("tag");

    const data = JSON.parse(fs.readFileSync("./data/memes.json"));
    const meme = data.find(m => m.id === id);

    if (!meme)
      return interaction.reply({ content: "❌ Ese meme no existe.", ephemeral: true });

    meme.tag = nuevoTag;

    fs.writeFileSync("./data/memes.json", JSON.stringify(data, null, 2));

    await interaction.reply(`✅ Meme **${id}** ahora es tag **${nuevoTag}**`);
  }
};
