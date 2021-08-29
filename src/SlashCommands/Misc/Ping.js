const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Get the bots response time'),
    category: 'Misc',
    description: 'Get the bots response time',
    async execute(interaction, client) {
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .addField(`${client.user.username} ping`, `:heart_decoration: **Heartbeat**: ${client.ws.ping} ms`)
        await interaction.reply({ embeds: [embed] });
    },
};