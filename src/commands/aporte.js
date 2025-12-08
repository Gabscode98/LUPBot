import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

const CDN_CHANNEL_ID = "1447678521215291525";

function generarAutoID(data) {
  const nums = data.map(m => parseInt(m.id)).filter(n => !isNaN(n)).sort((a,b)=>a-b);
  const next = nums.length ? nums[nums.length - 1] + 1 : 1;
  return next.toString().padStart(3, "0");
}

export default {
  data: new SlashCommandBuilder()
    .setName("aporte")
    .setDescription("Sube un meme al bot")
    .addAttachmentOption(o =>
      o.setName("imagen")
       .setDescription("Imagen del meme")
       .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("tag")
       .setDescription("Ej: rod, selvin, yayo (opcional)")
       .setRequired(false)
    ),

  async execute(interaction) {
    const img = interaction.options.getAttachment("imagen");
    const tag = interaction.options.getString("tag");

    if (!img.contentType || !img.contentType.startsWith("image"))
      return interaction.reply("❌ Solo se permiten imágenes.");

    const channel = await interaction.client.channels.fetch(CDN_CHANNEL_ID);
    if (!channel) return interaction.reply("❌ No encontré el canal de almacén.");

    // Enviar imagen al canal de almacén (Discord CDN)
    const sent = await channel.send({ files: [img.url] });
    const cdnURL = sent.attachments.first().url;

    // Leer base de memes
    const filePath = "./data/memes.json";
    const data = JSON.parse(fs.readFileSync(filePath));

    const id = generarAutoID(data);

    data.push({
      id,
      url: cdnURL,
      autor: interaction.user.id,
      fecha: new Date().toISOString(),
      tags: tag ? [tag.toLowerCase()] : []
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const embed = createEmbed({
      title: "✅ Meme agregado",
      description:
        `ID: **${id}**\n` +
        `Trigger: **${tag ? tag.toLowerCase() : "Sin tag"}**`,
      color: "#32CD32",
      image: cdnURL
    });

    await interaction.reply({ embeds: [embed] });
  }
};
