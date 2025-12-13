import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import { createEmbed } from "../embeds.js";

const CDN_CHANNEL_ID = "1449247346075631666";

// 🆔 Genera ID reutilizando huecos
function generarID(data) {
  const usados = data
    .map(m => Number(m.id))
    .filter(n => Number.isInteger(n))
    .sort((a, b) => a - b);

  let esperado = 1;
  for (const n of usados) {
    if (n !== esperado) break;
    esperado++;
  }

  return esperado.toString().padStart(3, "0");
}

export default {
  data: new SlashCommandBuilder()
    .setName("aporte")
    .setDescription("Sube un meme al bot con un tag personalizado")
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen del meme")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("tag")
        .setDescription("Escribe el tag del meme (ej: rod, selvin, yayo)")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const img = interaction.options.getAttachment("imagen");
    const tag = interaction.options.getString("tag").toLowerCase().trim();

    if (!img.contentType || !img.contentType.startsWith("image")) {
      return interaction.editReply("❌ Solo se permiten imágenes.");
    }

    const dbPath = "./data/memes.json";
    const db = fs.existsSync(dbPath)
      ? JSON.parse(fs.readFileSync(dbPath))
      : [];

    const id = generarID(db);
    const filename = `meme-${id}.png`;

    // 📁 Render-safe
    const MEMES_DIR = path.join(process.cwd(), "memes");
    if (!fs.existsSync(MEMES_DIR)) {
      fs.mkdirSync(MEMES_DIR, { recursive: true });
    }

    const filepath = path.join(MEMES_DIR, filename);

    const res = await fetch(img.url);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filepath, buf);

    db.push({
      id,
      autor: interaction.user.id,
      archivo: filename,
      tag,
      fecha: new Date().toISOString()
    });

    db.sort((a, b) => Number(a.id) - Number(b.id));
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

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

    const embed = createEmbed({
      title: "📥 Meme agregado correctamente",
      description:
        `🆔 ID: **${id}**\n🏷 Tag: **${tag}**`,
      color: "#4CAF50"
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
