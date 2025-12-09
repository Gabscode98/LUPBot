import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import fetch from "node-fetch";
import { createEmbed } from "../embeds.js";

// Canal donde se publicará el meme subido
const CDN_CHANNEL_ID = "1447678521215291525";

// Tags válidas
const TAGS_VALIDAS = ["rod", "selvin", "gabs", "yayo", "otros"];

// Genera IDs tipo 001, 002, 003...
function generarID(data) {
  const nums = data.map(m => parseInt(m.id)).filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return next.toString().padStart(3, "0");
}

export default {
  data: new SlashCommandBuilder()
    .setName("aporte")
    .setDescription("Sube un meme al bot con un tag/categoría")
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen del meme")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("tag")
        .setDescription("Tag o categoría del meme")
        .setRequired(true)
        .addChoices(
          { name: "Rod", value: "rod" },
          { name: "Selvin", value: "selvin" },
          { name: "Gabs", value: "gabs" },
          { name: "Yayo", value: "yayo" },
          { name: "Otros", value: "otros" }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const img = interaction.options.getAttachment("imagen");
    const tag = interaction.options.getString("tag");

    if (!img.contentType.startsWith("image")) {
      return interaction.editReply("❌ Solo se permiten imágenes.");
    }

    // Ruta al JSON principal de memes
    const dbPath = "./data/memes.json";
    const db = fs.existsSync(dbPath)
      ? JSON.parse(fs.readFileSync(dbPath))
      : [];

    // Crear ID tipo 001, 002, 003...
    const id = generarID(db);
    const filename = `meme-${id}.png`;
    const filepath = `./memes/${filename}`;

    // Descargar imagen y guardarla en /memes
    const res = await fetch(img.url);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filepath, buf);

    // Registrar en el JSON principal
    db.push({
      id,
      autor: interaction.user.id,
      archivo: filename,
      tag,
      fecha: new Date().toISOString()
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    // Enviar al canal alimentador
    const canal = interaction.client.channels.cache.get(CDN_CHANNEL_ID);

    if (canal) {
      await canal.send({
        content:
`🆕 **Nuevo meme agregado**
🆔 **ID:** ${id}
🏷 **Tag:** ${tag}
👤 Autor: <@${interaction.user.id}>`,
        files: [filepath]
      });
    }

    // Respuesta final al usuario
    const embed = createEmbed({
      title: "📥 Meme agregado correctamente",
      description:
        `Tu meme fue guardado con éxito.\n\n` +
        `🆔 ID: **${id}**\n` +
        `🏷 Tag: **${tag}**`,
      color: "#4CAF50",
      image: filepath
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
