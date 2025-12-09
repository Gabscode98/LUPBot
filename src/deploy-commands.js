import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

const commands = [];
const commandsPath = path.join(process.cwd(), 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const command = await import(`./commands/${file}`);

    if (!command.default || !command.default.data) {
      console.error(`❌ ERROR EN ESTE ARCHIVO: ${file}`);
      continue;
    }

    commands.push(command.default.data.toJSON());
    console.log(`✅ Cargado: ${file}`);

  } catch (err) {
    console.error(`🔥 FALLÓ ESTE ARCHIVO: ${file}`);
    console.error(err);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🚀 Actualizando comandos...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comandos listos correctamente");
  } catch (error) {
    console.error("❌ ERROR EN DISCORD API:");
    console.error(error);
  }
})();
