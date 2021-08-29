const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('1337')
        .setDescription('Send your text as 1337 text')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('The text you want to 1337\'ify')
            .setRequired(true)
        ),
    category: 'Text',
    description: 'Send your text as 1337 text',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let leetified = client.Util.leet(text);
        if (leetified.length > 1999) {
            return await interaction.reply({
                content: 'Please provide less text',
                ephemeral: true
            })
        }
        return await interaction.reply({
            content: leetified
        })
    }
};