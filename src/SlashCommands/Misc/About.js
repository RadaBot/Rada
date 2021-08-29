const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Displays information about Rada'),
    category: 'Misc',
    description: 'Displays information about Rada',
    async execute(interaction, client) {
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setTitle(`${client.user.username} information`)
            .setThumbnail(client.user.avatarURL({ format: 'png', size: 512 }))
            .addField('Created by', `\`${client.users.cache.get(client.ownerID[0]).tag} (${client.ownerID[0]})\``)
            .addField('Language', '[NodeJS](https://nodejs.org/en/) ([discord.js](https://discord.js.org/#/))')
            .addField('Framework', '[discord-akairo](https://discord-akairo.github.io/#/)')
            .addField('What does \'Rada\' mean', 'Rada originates in Slavic languages and means "filled with care".')
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp()
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('GitHub')
                .setStyle('LINK')
                .setURL('https://github.com/RadaBot/Rada'),
                new MessageButton()
                .setLabel('Dashboard')
                .setStyle('LINK')
                .setURL('https://radabot.net')
            )
        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    },
};