const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojipasta')
        .setDescription('Emoji pasta your text')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('The text you want to emojipasta')
            .setRequired(true)
        ),
    category: 'Text',
    description: 'Emoji pasta your text',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let emojipasta = client.Util.generateEmojipasta(text);
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