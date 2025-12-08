import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

// Guarda el último ID enviado (en memoria)
let ultimoID = null;

export default {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Envía un meme random"),

  async execute(interaction) {
    const data = JSON.parse(fs.readFileSync("./data/memes.json"));

    if (data.length === 0)
      return interaction.reply("⚠️ No hay memes todavía.");

    if (data.length === 1) {
      const unico = data[0];
      const embed = createEmbed({
        title: "Meme Random",
        description: `ID: **${unico.id}**`,
        color: "#1E90FF",
        image: unico.url
      });

      ultimoID = unico.id;
      return interaction.reply({ embeds: [embed] });
    }

    // Buscar uno distinto al último
    let random;
    do {
      random = data[Math.floor(Math.random() * data.length)];
    } while (random.id === ultimoID);

    ultimoID = random.id;

    const embed = createEmbed({
      title: "Meme Random",
      description: `ID: **${random.id}**`,
      color: "#1E90FF",
      image: random.url
    });

    await interaction.reply({ embeds: [embed] });
  }
};
