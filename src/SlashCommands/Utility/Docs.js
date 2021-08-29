const { SlashCommandBuilder } = require('@discordjs/builders');
const Doc = require('discord.js-docs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('docs')
        .setDescription('Search the discord.js docs')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('What are you searching for?')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('branch')
            .setDescription('What branch do you want to search on? (Default: stable)')
            .addChoice('stable', 'stable')
            .addChoice('master', 'master')
            .addChoice('commando', 'commando')
            .addChoice('rpc', 'rpc')
            .addChoice('akairo', 'akairo')
            .addChoice('akairo-master', 'akairo-master')
        ),
    category: 'Utility',
    description: 'Search the discord.js docs',
    djsIcon: 'https://cdn.discordapp.com/avatars/348607796335607817/2d72562153c202e77c681f2a7efbe919.png?size=512',
    async execute(interaction, client) {
        let query = interaction.options.getString('query');
        let branch = interaction.options.getString('branch') ?? 'stable';
        let docFetch = await Doc.fetch(branch);
        let doc = docFetch.resolveEmbed(query);
        if (!doc) {
            return await interaction.reply({
                content: 'Unable to find your query',
                ephemeral: true
            });
        }
        if (doc.fields) {
            let fields = [];
            for (const field of doc.fields) {
                fields.push({
                    name: field.name,
                    value: client.Util.trimString(field.value, 1020)
                })
            }
            doc = { ...doc, fields: fields }
        }
        let embed = client.util.embed(doc).setAuthor(doc.author.name, this.djsIcon)
        return await interaction.reply({
            embeds: [embed]
        });
    }
};