const { SlashCommandBuilder } = require('@discordjs/builders');
const math = require('mathjs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Calculate math sums')
        .addStringOption((option) => option
            .setName('sum')
            .setDescription('The math sum you want to calculate')
            .setRequired(true)
        ),
    category: 'Misc',
    description: 'Calculate math sums',
    async execute(interaction, client) {
        let sum = interaction.options.getString('sum');
        let formatted = sum.replace(/x/g, '*').replace(/÷/g, '/').replace(/×/g, '*');
        let resp;
        try {
            resp = math.evaluate(formatted);
        } catch (error) {
            return await interaction.reply({
                content: 'The math sum you entered is not valid.',
                ephemeral: true
            });
        }
        return await interaction.reply({
            content: client.Util.codeBlock('prolog', `${formatted} = ${resp}`)
        }); 
    }
};