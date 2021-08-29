const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mock')
        .setDescription('Mock your text like the spongebob meme')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('The text you want to mock')
            .setRequired(true)
        ),
    category: 'Text',
    description: 'Mock your text like the spongebob meme',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let mocked = client.Util.mock(text);
        if (mocked.length > 1999) {
            return await interaction.reply({
                content: 'Please provide less text',
                ephemeral: true
            })
        }
        return await interaction.reply({
            content: mocked
        })
    }
};