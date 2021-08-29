const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Statistics of the bot'),
    category: 'Misc',
    description: 'Statistics of the bot',
    async execute(interaction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Stats')
                .setStyle('LINK')
                .setURL('https://radabot.net/stats')
            )
        await interaction.reply({
            content: 'Click the button below to view the stats',
            components: [row]
        });
    },
};