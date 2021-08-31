const { SlashCommandBuilder } = require('@discordjs/builders');
const { poll } = require('../../../lib/util/constants');
const ms = require('ms');
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
        let current = ms(ms(duration), { long: true });
        if (text.length > 800) {
            return await interaction.reply({
                content: `**Reminder message must be less than 800 charecters**`,
                ephemeral: true
            });
        }
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setTitle('Reminder')
        let date = new Date(Date.now() + ms(duration));
        await interaction.reply({
            content: `I will remind you in \`${current}\``
        })
        const message = await interaction.fetchReply()
        await client.RadaReminder.create(date, message, interaction.user, text, embed, current);
    }
};