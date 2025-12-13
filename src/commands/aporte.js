import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

const CDN_CHANNEL_ID = "1449247346075631666";
const DB_PATH = "./data/memes.json";

// 🆔 Genera ID reutilizando huecos
function generarID(data) {
  const usados = data
    .map(m => Number(m.id))
    .filter(Number.isInteger)
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
    .setDescription("Sube un meme al bot")
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen del meme")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("tag")
        .setDescription("Ej: rod, selvin, yayo")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const img = interaction.options.getAttachment("imagen");
    const tag = interaction.options.getString("tag").toLowerCase().trim();

    if (!img.contentType?.startsWith("image")) {
      return interaction.editReply("❌ Solo se permiten imágenes.");
    }

    const db = fs.existsSync(DB_PATH)
      ? JSON.parse(fs.readFileSync(DB_PATH))
      : [];

    const id = generarID(db);

    // 📢 Enviar al canal CDN
    const canal = interaction.client.channels.cache.get(CDN_CHANNEL_ID);
    if (!canal) {
      return interaction.editReply("❌ Canal CDN no encontrado.");
    }

    const msg = await canal.send({
      content:
`🆕 **Nuevo meme**
🆔 ID: **${id}**
🏷 Tag: **${tag}**
👤 Autor: <@${interaction.user.id}>`,
      files: [img.url]
    });

    // 🔗 URL PERMANENTE DEL CDN
    const url = msg.attachments.first().url;

    // 💾 Guardar en JSON
    db.push({
      id,
      tag,
      url,
      autor: interaction.user.id,
      fecha: new Date().toISOString()
    });

    db.sort((a, b) => Number(a.id) - Number(b.id));
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    // ✅ Respuesta final
    const embed = createEmbed({
      title: "📥 Meme agregado",
      description: `🆔 ID: **${id}**\n🏷 Tag: **${tag}**`,
      image: url,
      color: "#4CAF50"
    });

    return interaction.editReply({ embeds: [embed] });
  }
};
