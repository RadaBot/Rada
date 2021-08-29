const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('owofy')
        .setDescription('Send youw text owofied (｡♥‿♥｡)')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('The text you want to owofy')
            .setRequired(true)
        ),
    category: 'Text',
    description: 'Send youw text owofied (｡♥‿♥｡)',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let owofied = client.Util.owofy(text);
        if (owofied.length > 1999) {
            return await interaction.reply({
                content: 'Please provide less text',
                ephemeral: true
            })
        }
        return await interaction.reply({
            content: owofied
        })
    }
};