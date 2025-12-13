import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import { Client, GatewayIntentBits, Collection } from "discord.js";

// =======================
// 🌐 Servidor Express (Render / Uptime)
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
// 🤖 Cliente Discord
// =======================
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// =======================
// 📦 Cargar comandos (seguro)
// =======================
const commandsPath = path.join(process.cwd(), "src/commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  try {
    const command = await import(`./src/commands/${file}`);

    if (
      !command.default ||
      !command.default.data ||
      !command.default.execute
    ) {
      console.error(`❌ COMANDO INVÁLIDO: ${file}`);
      continue;
    }

    client.commands.set(command.default.data.name, command.default);
    console.log(`✅ Comando cargado: ${command.default.data.name}`);
  } catch (err) {
    console.error(`🔥 Error cargando ${file}`);
    console.error(err);
  }
}

// =======================
// ✅ Bot listo
// =======================
client.once("ready", () => {
  console.log(`✅ LUPBot listo como ${client.user.tag}`);
});

// =======================
// ⚡ Slash Commands Handler
// =======================
client.on("interactionCreate", async interaction => {
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

// =======================
// 🧠 AUTOCOMPLETE GLOBAL
// =======================
client.on("interactionCreate", async interaction => {
  if (!interaction.isAutocomplete()) return;

  const focusedValue = interaction.options.getFocused().toLowerCase();
  const DB_PATH = "./data/memes.json";

  if (!fs.existsSync(DB_PATH)) {
    return interaction.respond([]);
  }

  const data = JSON.parse(fs.readFileSync(DB_PATH));

  // 🔹 AUTOCOMPLETE PARA /meme (tags)
  if (interaction.commandName === "meme") {
    const tags = [...new Set(data.map(m => m.tag))];

    const filtrados = tags
      .filter(tag => tag.includes(focusedValue))
      .slice(0, 25);

    return interaction.respond(
      filtrados.map(tag => ({
        name: tag,
        value: tag
      }))
    );
  }

  // 🔹 AUTOCOMPLETE PARA /meme_id (IDs)
  if (interaction.commandName === "meme_id") {
    const ids = data.map(m => m.id);

    const filtrados = ids
      .filter(id => id.includes(focusedValue))
      .slice(0, 25);

    return interaction.respond(
      filtrados.map(id => ({
        name: id,
        value: id
      }))
    );
  }

  return interaction.respond([]);
});

// =======================
// 🔑 Login
// =======================
client.login(process.env.TOKEN);
