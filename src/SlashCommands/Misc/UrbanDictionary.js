const { SlashCommandBuilder } = require('@discordjs/builders');
const req = require('@aero/centra');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urbandictionary')
        .setDescription('Search urban dictionary')
        .addStringOption((option) => option
            .setName('phrase')
            .setDescription('The word or phrase you want the urban definition for')
            .setRequired(true)
        ),
    category: 'Misc',
    description: 'Search urban dictionary',
    async execute(interaction, client) {
        let query = interaction.options.getString('phrase');
        let search = query.split(" ").join("+");
        const data = await req(`https://api.urbandictionary.com/v0/define?term=${search}`).json();
        let result = data.list;
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp()
        const pages = client.buttonPaginator.chunk(result, 1);
        if (result[0]) {
            if (result.length < 2) {
                embed.setTitle(`**${data.list[0].word}** by ${data.list[0].author}`)
                    .setDescription(`${this.trim(data.list[0].definition, 1950, data.list[0].permalink) || 'No definition'}`)
                    .addField('Example', `${this.trim(data.list[0].example, 950, data.list[0].permalink) || 'No example'}`)
                    .addField('Votes', `:thumbsup: ${data.list[0].thumbs_up} upvotes\n:thumbsdown: ${data.list[0].thumbs_down} downvotes`)
                    .addField('Link', `**${data.list[0].permalink}**`, true)
                    .addField('Mug', `**[Buy a __${data.list[0].word}__ mug here](https://urbandictionary.store/products/mug?defid=${data.list[0].defid})**`, true)
                return await interaction.reply({
                    embeds: [embed]
                })
            }
            let embeds = [];
            for (let i = 0; i < pages.length; i++) {
                let embed = client.util.embed()
                    .setTitle(`**${pages[i][0].word}** by ${pages[i][0].author}`)
                    .setColor(client.misc.color)
                    .setDescription(`${this.trim(pages[i][0].definition, 1950, pages[i][0].permalink) || 'No definition'}`)
                    .addField('Example', `${this.trim(pages[i][0].example, 950, pages[i][0].permalink) || 'No example'}`)
                    .addField('Votes', `:thumbsup: ${pages[i][0].thumbs_up.toLocaleString()} upvotes\n:thumbsdown: ${pages[i][0].thumbs_down.toLocaleString()} downvotes`)
                    .addField('Link', `**${pages[i][0].permalink}**`, true)
                    .addField('Mug', `**[Buy a __${pages[i][0].word}__ mug here](https://urbandictionary.store/products/mug?defid=${pages[i][0].defid})**`, true)
                    .setTimestamp()
                embeds.push(embed);
            }
            await client.buttonPaginator.start(embeds, interaction)
        } else {
            embed.setTitle('Urban dictionary search')
                .setDescription(`No results on urban dictionary have been found for \`${query}\``)
            return await interaction.reply({
                embeds: [embed]
            })
        }
    },
    trim(str, max = 30, link) {
        if (str.length > max) return `${str.substr(0, max)}**[...view the rest here](${link})**`;
        return str;
    }
};