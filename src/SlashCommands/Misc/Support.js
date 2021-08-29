const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Join Rada support, we\'d love to help'),
    category: 'Misc',
    description: 'Join Rada support, we\'d love to help',
    async execute(interaction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Rada Support')
                .setStyle('LINK')
                .setURL('https://discord.gg/4yKZVQ2cQh')
            )
        await interaction.reply({
            content: 'Click the button below to join the Rada support server',
            components: [row]
        });
    },
};