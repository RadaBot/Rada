const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Uptime of the bot'),
    category: 'Misc',
    description: 'Uptime of the bot',
    async execute(interaction, client) {
        const embed = client.util.embed()
            .setTitle(`${client.user.username} uptime`)
            .setColor(client.misc.color)
            .setDescription(`I have been online for:\n${client.convertMs(client.uptime)}`)
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp()
        await interaction.reply({
            embeds: [embed]
        });
    },
};