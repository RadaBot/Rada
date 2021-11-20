const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk delete up to 100 messages from the channel')
        .addIntegerOption((option) => option
            .setName('amount')
            .setDescription('The amount of messages to delete')
            .setRequired(true)
        ),
    category: 'Moderation',
    description: 'Bulk delete up to 100 messages from the channel',
    permissions: ['MANAGE_MESSAGES'],
    async execute(interaction, client) {
        await interaction.deferReply()
        let amount = parseInt(interaction.options.getInteger('amount').toString().replace('-', ''));
        if (amount > 100) {
            return await interaction.editReply({
                content: 'Please input a valid amount that is less than 100',
                ephemeral: true
            });
        }
        try {
            await interaction.channel.bulkDelete(amount + 1, { filterOld: true });
        } catch (e) {
            return await interaction.editReply({
                content: e.message,
                ephemeral: true
            });
        }
    }
};