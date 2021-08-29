const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempconvert')
        .setDescription('Convert a temperature')
        .addIntegerOption((option) => option
            .setName('temp')
            .setDescription('The temperature you want to convert')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('to')
            .setDescription('The temperature unit you want to convert to (F or C)')
            .addChoice('Fahrenheit', 'f')
            .addChoice('Celcius', 'c')
            .setRequired(true)
        ),
    category: 'Misc',
    description: 'Convert a temperature',
    async execute(interaction, client) {
        let temp = interaction.options.getInteger('temp')
        let unit = interaction.options.getString('to')
        if (!unit.toLowerCase().match(/^(f|c)$/i)) {
            await interaction.reply({
                message: 'The temperature unit you entered is invalid. Try either \`F\` or \`C\`',
                emepheral: true
            })
        }
        let converted = client.convertTemp(temp, unit)
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setTitle('Temperature conversion')
            .setDescription(`**${temp}°${unit.toLowerCase() === 'c' ? 'F' : 'C'}** converted to ${unit.toLowerCase() === 'c' ? 'celcius' : 'fahrenheit'} is **${converted}°${unit.toLowerCase() === 'c' ? 'C' : 'F'}**`)
        await interaction.reply({
            embeds: [embed]
        });
    }
};