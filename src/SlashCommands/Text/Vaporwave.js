const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vaporwave')
        .setDescription('Ｓｅｎｄ  ｙｏｕｒ  ｔｅｘｔ  ｖａｐｏｒｗａｖｅｄ')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('The text you want to ｖａｐｏｒｗａｖｅ')
            .setRequired(true)
        ),
    category: 'Text',
    description: 'Ｓｅｎｄ  ｙｏｕｒ  ｔｅｘｔ  ｖａｐｏｒｗａｖｅｄ',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let vaporwaved = client.Util.vaporwave(text);
        if (vaporwaved.length > 1999) {
            return await interaction.reply({
                content: 'Please provide less text',
                ephemeral: true
            })
        }
        return await interaction.reply({
            content: vaporwaved
        })
    }
};