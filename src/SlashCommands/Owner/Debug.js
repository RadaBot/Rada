const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Enable/disable debugging logs')
        .addStringOption((option) => option
            .setName('toggle')
            .setDescription('Do you want to enable or disable debug logging')
            .addChoices(
                { name: 'enable', value: 'on' },
                { name: 'disable', value: 'off' },
            )
            .setRequired(true)
        ),
    ownerOnly: true,
    category: 'Owner',
    description: 'Enable/disable debugging logs',
    async execute(interaction, client) {
        let toggle = interaction.options.getString('toggle');
        let current = client.settings.get(client.user.id, 'debug', false);
        if (toggle === 'on') {
            if (current) {
                return await interaction.reply({
                    content: 'Debug mode is already \`on\`',
                    ephemeral: true
                })
            }
            await client.settings.set(client.user.id, 'debug', true);
            return await interaction.reply({
                content: 'You have turned debug mode \`on\`'
            })
        }
        if (toggle === 'on') {
            if (!current) {
                return await interaction.reply({
                    content: 'Debug mode is already \`off\`',
                    ephemeral: true
                })
            }
            await client.settings.set(client.user.id, 'debug', false);
            return await interaction.reply({
                content: 'You have turned debug mode \`off\`'
            })
        }
    }
}