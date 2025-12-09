import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Muestra estadísticas de memes"),

  async execute(interaction) {
    const data = JSON.parse(fs.readFileSync("./data/memes.json"));

    await interaction.reply(`📊 Total de memes: **${data.length}**`);
  }
};
