const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reverse')
        .setDescription('Reverse a piece of text')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('The text you want to reverse')
            .setRequired(true)
        ),
    category: 'Text',
    description: 'Reverse a piece of text',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let reversed = client.Util.reverse(text);
        if (reversed.length > 1999) {
            return await interaction.reply({
                content: 'Please provide less text',
                ephemeral: true
            })
        }
        return await interaction.reply({
            content: reversed
        })
    }
};