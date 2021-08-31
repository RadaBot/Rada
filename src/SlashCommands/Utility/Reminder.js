const { SlashCommandBuilder } = require('@discordjs/builders');
const { poll } = require('../../../lib/util/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Create a reminder')
        .addStringOption((option) => option
            .setName('text')
            .setDescription('What do you want to be reminded?')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('duration')
            .setDescription('When do you want to be reminded? (ex. 12h, 1d, 30m)')
            .setRequired(true)
        ),
    category: 'Utility',
    description: 'Create a reminder',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let duration = interaction.options.getString('duration');
        
    }
};