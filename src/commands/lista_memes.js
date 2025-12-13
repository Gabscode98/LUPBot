import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import fs from "fs";
import { createEmbed } from "../embeds.js";

const DB_PATH = "./data/memes.json";
const POR_PAGINA = 10;

export default {
  data: new SlashCommandBuilder()
    .setName("lista_memes")
    .setDescription("Lista los memes almacenados con paginación"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!fs.existsSync(DB_PATH)) {
      return interaction.editReply("❌ No hay memes.");
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH));
    if (!data.length) {
      return interaction.editReply("❌ El almacén está vacío.");
    }

    let pagina = 0;
    const totalPaginas = Math.ceil(data.length / POR_PAGINA);

    const generarEmbed = () => {
      const inicio = pagina * POR_PAGINA;
      const actual = data.slice(inicio, inicio + POR_PAGINA);

      return createEmbed({
        title: `📂 Memes almacenados`,
        description:
          actual
            .map(m => `🆔 **${m.id}** | 🏷 ${m.tag} | 👤 <@${m.autor}>`)
            .join("\n"),
        color: "#8A2BE2"
      }).setFooter({
        text: `Página ${pagina + 1} / ${totalPaginas}`
      });
    };

    const botones = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("⬅️ Anterior")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pagina === 0),

        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("➡️ Siguiente")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pagina === totalPaginas - 1)
      );

    const mensaje = await interaction.editReply({
      embeds: [generarEmbed()],
      components: [botones()]
    });

    const collector = mensaje.createMessageComponentCollector({
      time: 60_000
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ Solo quien ejecutó el comando puede usar los botones.",
          ephemeral: true
        });
      }

      if (i.customId === "prev") pagina--;
      if (i.customId === "next") pagina++;

      await i.update({
        embeds: [generarEmbed()],
        components: [botones()]
      });
    });
  }
};
