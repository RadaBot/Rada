const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojimock')
        .setDescription('Emoji pasta and mock your text at the same time')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('The text you want to emoji mock')
            .setRequired(true)
        ),
    category: 'Text',
    description: 'Emoji pasta and mock your text at the same time',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let mocked = client.Util.mock(text);
        let emojipasta = client.Util.generateEmojipasta(mocked);
        if (emojipasta.length > 1999) {
            return await interaction.reply({
                content: 'Please provide less text',
                ephemeral: true
            })
        }
        return await interaction.reply({
            content: emojipasta
        })
    }
};