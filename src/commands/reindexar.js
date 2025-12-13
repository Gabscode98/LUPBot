import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";
import { createEmbed } from "../embeds.js";

const DB_PATH = "./data/memes.json";
const MEMES_DIR = "./memes";

export default {
  data: new SlashCommandBuilder()
    .setName("reindexar")
    .setDescription("Reorganiza todos los IDs de memes desde 001 (ADMIN)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // 🛡 Seguridad extra
      if (
        !interaction.member ||
        !interaction.member.permissions?.has(PermissionFlagsBits.Administrator)
      ) {
        return interaction.editReply("❌ Solo administradores pueden usar este comando.");
      }

      if (!fs.existsSync(DB_PATH)) {
        return interaction.editReply("❌ No existe la base de memes.");
      }

      if (!fs.existsSync(MEMES_DIR)) {
        fs.mkdirSync(MEMES_DIR, { recursive: true });
      }

      let data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

      if (!Array.isArray(data) || !data.length) {
        return interaction.editReply("❌ No hay memes para reindexar.");
      }

      // 1️⃣ Ordenar por ID numérico actual
      data.sort((a, b) => Number(a.id) - Number(b.id));

      // 2️⃣ Reindexar
      const cambios = [];
      const omitidos = [];

      data.forEach((meme, index) => {
        const nuevoID = (index + 1).toString().padStart(3, "0");

        // 🛡 Meme roto → no tocar archivo
        if (!meme.archivo || typeof meme.archivo !== "string") {
          omitidos.push(meme.id);
          meme.id = nuevoID;
          return;
        }

        if (meme.id !== nuevoID) {
          const viejoArchivo = path.join(MEMES_DIR, meme.archivo);
          const nuevoArchivo = path.join(MEMES_DIR, `meme-${nuevoID}.png`);

          if (fs.existsSync(viejoArchivo)) {
            fs.renameSync(viejoArchivo, nuevoArchivo);
          }

          cambios.push(`${meme.id} → ${nuevoID}`);

          meme.id = nuevoID;
          meme.archivo = `meme-${nuevoID}.png`;
        }
      });

      // 3️⃣ Guardar JSON limpio y ordenado
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

      // 4️⃣ Embed final
      const embed = createEmbed({
        title: "🔁 Reindexación completada",
        description:
          `📦 Memes procesados: **${data.length}**\n` +
          `🔄 Cambios realizados: **${cambios.length}**\n` +
          `⚠️ Omitidos (sin archivo): **${omitidos.length}**\n\n` +
          (cambios.length
            ? `Primeros cambios:\n${cambios.slice(0, 10).join("\n")}` +
              (cambios.length > 10 ? "\n..." : "")
            : "No fue necesario cambiar IDs."),
        color: "#9C27B0",
      });

      return interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error("❌ Error en /reindexar:", err);
      return interaction.editReply("❌ Ocurrió un error interno al reindexar.");
    }
  },
};

