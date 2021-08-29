const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
        data: new SlashCommandBuilder()
            .setName('emotes')
            .setDescription('Display all server emotes'),
        category: 'Misc',
        description: 'Display all server emotes',
        async execute(interaction, client) {
            let emojiList = interaction.guild.emojis.cache.map(e => `${e} - **${e.name}**, created **${client.daysBetween(new Date(e.createdTimestamp), new Date()) === 0 ? 'today' : `${client.daysBetween(new Date(e.createdTimestamp), new Date())} days ago`}**`);
        if (emojiList.length < 1) {
            return interaction.reply({
                content: 'This server has no emotes to display.',
                emepheral: true
            });
        }
        const pages = client.buttonPaginator.chunk(emojiList, 20);
        let embeds = [];
        if (pages.length < 2) {
            let embed = client.util.embed()
                .setTitle(`**${interaction.guild.name}** emotes`)
                .setColor(client.misc.color)
                .setDescription(emojiList.join('\n'))
                .setFooter(`Requested by ${interaction.user.username}`)
                .setTimestamp()
            return interaction.reply({
                embeds: [embed]
            })
        }
        for (let i = 0; i < pages.length; i++) {
            embeds.push(
                client.util.embed()
                .setTitle(`**${interaction.guild.name}** emotes`)
                .setColor(client.misc.color)
                .setDescription(pages[i].join('\n'))
                .setTimestamp()
            );
        }
        await client.buttonPaginator.start(embeds, interaction);
    },
};