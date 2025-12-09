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
  intents: [
    GatewayIntentBits.Guilds, // Requerido para slash commands
  ],
});

client.commands = new Collection();

// =======================
// Cargar Comandos
// =======================
const commandsPath = path.join(process.cwd(), "src/commands");
const commandFiles = fs.readdirSync(commandsPath);

for (const file of commandFiles) {
  const command = await import(`./src/commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

client.once("ready", () => {
  console.log(`✅ LUPBot listo como ${client.user.tag}`);
});

// =======================
// Slash Commands Handler
// =======================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error("❌ Error ejecutando comando:", err);

    // Evita "Interaction has already been acknowledged"
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Hubo un error al ejecutar este comando.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
