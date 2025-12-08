import { EmbedBuilder } from "discord.js";

export function createEmbed({
    title = null,
    description = null,
    color = "#1E90FF",
    image = null
} = {}) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setFooter({ text: "🤖LUPBot • GabsKamitani" })
        .setTimestamp();

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (image) embed.setImage(image);

    return embed;
}
