import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import { Client, GatewayIntentBits, Collection } from "discord.js";

// =======================
// Servidor Express (Render)
// =======================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("LUPBot funcionando correctamente 🚀");
});

app.listen(PORT, () => {
  console.log("Puerto activo:", PORT);
});

// =======================
// Cliente Discord
// =======================
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// ===============================
// 📦 CARGAR COMANDOS (VERSIÓN SEGURA)
// ===============================
const commandsPath = path.join(process.cwd(), "src/commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  try {
    const command = await import(`./src/commands/${file}`);

    // ✅ Protección total contra archivos rotos
    if (
      !command.default ||
      !command.default.data ||
      !command.default.execute
    ) {
      console.error(`❌ ARCHIVO DE COMANDO INVÁLIDO: ${file}`);
      continue;
    }

    client.commands.set(
      command.default.data.name,
      command.default
    );

    console.log(`✅ Comando cargado: ${file}`);
  } catch (err) {
    console.error(`🔥 ERROR AL CARGAR: ${file}`);
    console.error(err);
  }
}

// =======================
// ✅ BOT LISTO
// =======================
client.once("ready", () => {
  console.log(`✅ LUPBot listo como ${client.user.tag}`);
});

// =======================
// ⚡ SLASH COMMANDS HANDLER (ANTI 40060)
// =======================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error("❌ Error ejecutando comando:", err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Hubo un error al ejecutar este comando.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
