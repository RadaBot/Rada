const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojify')
        .setDescription('Send your text as regional indicator emojis')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('The text you want to emojify')
            .setRequired(true)
        ),
    category: 'Text',
    description: 'Send your text as regional indicator emojis',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let emojified = client.Util.emojify(text);
        if (emojified.length > 1999) {
            return await interaction.reply({
                content: 'Please provide less text',
                ephemeral: true
            })
        }
        return await interaction.reply({
            content: emojified
        })
    }
};