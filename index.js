import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from "express";
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { createEmbed } from './src/embeds.js';

// ===============================
// 🌐 SERVIDOR EXPRESS PARA RENDER
// ===============================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("LUPBot activo ✅");
});

app.listen(PORT, () => {
  console.log("Puerto activo:", PORT);
});

// ===============================
// 🤖 CLIENTE DE DISCORD
// ===============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// ===============================
// 📦 CARGAR COMANDOS
// ===============================
const commandsPath = path.join(process.cwd(), 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./src/commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// ===============================
// ✅ BOT LISTO
// ===============================
client.on('ready', () => {
  console.log(`✅ LUPBot listo como ${client.user.tag}`);
});

// ===============================
// 🔥 TRIGGERS POR PALABRA (CDN + JSON)
// ===============================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const palabra = message.content.toLowerCase().trim();
  const filePath = "./data/memes.json";

  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath));

  const filtrados = data.filter(m =>
    Array.isArray(m.tags) && m.tags.includes(palabra)
  );

  if (filtrados.length === 0) return;

  const random = filtrados[Math.floor(Math.random() * filtrados.length)];

  const embed = createEmbed({
    title: `📸 ${palabra.toUpperCase()}`,
    description: `ID: **${random.id}**`,
    color: "#FF4500",
    image: random.url
  });

  await message.reply({ embeds: [embed] });
});

// ===============================
// ⚡ SLASH COMMANDS (ANTI 40060)
// ===============================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    // ✅ Protección contra doble respuesta (40060)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Hubo un error al ejecutar el comando.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "❌ Hubo un error al ejecutar el comando.",
        ephemeral: true
      });
    }
  }
});

// ===============================
// 🔐 LOGIN
// ===============================
client.login(process.env.TOKEN);
