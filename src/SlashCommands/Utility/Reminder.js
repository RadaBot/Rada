const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Create a reminder')
        .addStringOption((option) => option
            .setName('duration')
            .setDescription('When do you want to be reminded? (ex. 12h, 1d, 30m)')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('text')
            .setDescription('What do you want to be reminded?')
            .setRequired(true)
        ),
    category: 'Utility',
    description: 'Create a reminder',
    async execute(interaction, client) {
        let text = interaction.options.getString('text');
        let duration = interaction.options.getString('duration');
        let current = ms(ms(duration), { long: true });
        if (!ms(duration)) {
            return await interaction.reply({
                content: 'Please provide a valid time (ex. 12h, 1d, 30m)',
                ephemeral: true
            });
        }
        if (text.length > 500) {
            return await interaction.reply({
                content: 'Reminder message must be less than 500 charecters',
                ephemeral: true
            });
        }
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setTitle('Reminder')
        let date = new Date(Date.now() + ms(duration));
        let id = client.Util.generateID();
        await interaction.reply({
            content: `I will remind you <t:${parseInt(date.getTime() / 1000)}:R>. Reminder ID: \`${id}\``
        })
        let message = await interaction.fetchReply()
        let data = {
            id: id,
            date: date,
            current: current,
            reminder: text,
            user: interaction.user,
            message: message,
            embed: embed
        }
        // await client.RadaReminder.create(date, message, interaction.user, text, embed, current);
        await client.RadaReminder.create(data);
    }
};