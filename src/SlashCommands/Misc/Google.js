const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('google')
        .setDescription('Search google for something')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('What do you want to google?')
            .setRequired(true)
        )
        .addIntegerOption((option) => option
            .setName('results')
            .setDescription('How many results do you want to display?')
            .addChoices(
                { name: '1', value: 1 },
                { name: '2', value: 2 },
                { name: '3', value: 3 },
                { name: '4', value: 4 },
                { name: '5', value: 5 },
                { name: '6', value: 6 },
                { name: '7', value: 7 },
                { name: '8', value: 8 },
                { name: '9', value: 9 },
                { name: '10', value: 10 },
            )
            .setRequired(true)
        ),
    category: 'Misc',
    description: 'Search google for something',
    async execute(interaction, client) {
        let embed = client.util.embed()
            .setTitle('Google search')
            .setColor(client.misc.color)
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp()
        let query = interaction.options.getString('query');
        let results = interaction.options.getInteger('results');
        await interaction.deferReply();
        let search = query.split(" ").join("+");
        try {
            let res = await client.search(search, results);
            if (results.length < 1) {
                embed.setDescription('No results were found for your query... Please try again.')
                return await interaction.editReply({
                    embeds: [embed]
                });
            }
            embed.setTitle(`Google search - **${query}** ${results === 1 ? '\`(Top result)\`' : `\`(Top ${results} results)\``}`);
            embed.setURL(`https://www.google.co.uk/search?q=${search}`)
            for (const result of res) {
                embed.addField(`**${result.title}**`,result.snippet.length > 0 ? `${client.Util.trimString(result.snippet, 250)} __[view here](${result.link})__` : result.link)
            }
            await interaction.editReply({
                embeds: [embed]
            });
        } catch (e) {
            embed.setDescription(e.message)
            await interaction.editReply({
                embeds: [embed],
                emepheral: true
            });
        }
    }
};