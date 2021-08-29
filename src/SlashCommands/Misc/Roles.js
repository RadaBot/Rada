const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Display all server roles'),
    category: 'Misc',
    description: 'Display all server roles',
    async execute(interaction, client) {
        let roleList = interaction.guild.roles.cache.map(r => `${r} - created **${client.daysBetween(new Date(r.createdTimestamp), new Date()) === 0 ? 'today' : `${client.daysBetween(new Date(r.createdTimestamp), new Date())} days ago`}**`);
        if (roleList.length < 1) {
            return interaction.reply({
                content: 'This server has no roles to display.',
                emepheral: true
            });
        }
        const pages = client.buttonPaginator.chunk(roleList, 20);
        let embeds = [];
        if (pages.length < 2) {
            let embed = client.util.embed()
                .setTitle(`**${interaction.guild.name}** roles`)
                .setColor(client.misc.color)
                .setDescription(roleList.join('\n'))
                .setFooter(`Requested by ${interaction.user.username}`)
                .setTimestamp()
            return interaction.reply({
                embeds: [embed]
            })
        }
        for (let i = 0; i < pages.length; i++) {
            embeds.push(
                client.util.embed()
                .setTitle(`**${interaction.guild.name}** roles`)
                .setColor(client.misc.color)
                .setDescription(pages[i].join('\n'))
                .setTimestamp()
            );
        }
        await client.buttonPaginator.start(embeds, interaction);
    },
};