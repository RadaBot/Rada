const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminders')
        .setDescription('Manage your reminders, if any exist')
        .addSubcommand((subcommand) => subcommand
            .setName('view')
            .setDescription('View all your reminders or a specific')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The ID of the reminder you want to view')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('history')
            .setDescription('View up to 5 previous reminders')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The ID of the old reminder you want to view')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('restart')
            .setDescription('Restart an old reminder')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The ID of the reminder you want to restart')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('duration')
                .setDescription('How long do you want this to last? (ex. 12h, 1d, 30m)')
                .setRequired(true)
            )
        ),
    category: 'Utility',
    description: 'Manage your reminders, if any exist',
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        let current = client.settings.get(interaction.user.id, 'reminders.current', []);
        let previous = client.settings.get(interaction.user.id, 'reminders.old', []);
        switch (subcommand) {

            case 'view':
                let idToView = interaction.options.getString('id');
                if (!idToView) {
                    if (current.length < 1) {
                        return await interaction.reply({
                            content: 'You don\'t have any active reminders',
                            ephemeral: true
                        })
                    }
                    let currentEmbed = client.util.embed()
                        .setTitle('Active reminders')
                        .setColor(client.misc.color)
                        .setDescription(current.map((reminder) => `\`${reminder.id}\` - Reminding you <t:${parseInt(reminder.date.getTime() / 1000)}:R>\n> **${client.Util.trimString(reminder.reminder, 120)}**`).join('\n'))
                    return await interaction.reply({
                        embeds: [currentEmbed]
                    })
                } else {
                    if (current.filter(reminder => reminder.id === idToView.toUpperCase()).length < 1) {
                        return await interaction.reply({
                            content: `The reminder ID \`${idToView}\` was not found`,
                            ephemeral: true
                        })
                    }
                    let filtered = current.filter(reminder => reminder.id === idToView.toUpperCase())[0];
                    let reminderInfoEmbed = client.util.embed()
                        .setTitle(`Reminder | \`${filtered.id}\``)
                        .setColor(client.misc.color)
                        .setDescription(client.Util.quote(client.Util.trimString(filtered.reminder, 2020)))
                        .setFooter('Reminding you')
                        .setTimestamp(filtered.date)
                    return await interaction.reply({
                        embeds: [reminderInfoEmbed]
                    })
                }
            break;
            
            case 'history':
                let oldIdToView = interaction.options.getString('id');
                if (!oldIdToView) {
                    if (previous.length < 1) {
                        return await interaction.reply({
                            content: 'You don\'t have any previous reminders',
                            ephemeral: true
                        })
                    }
                    let previousEmbed = client.util.embed()
                        .setTitle('Previous reminders')
                        .setColor(client.misc.color)
                        .setDescription(previous.map((reminder) => `\`${reminder.id}\` - Reminded <t:${parseInt(new Date(reminder.date).getTime() / 1000)}:R>\n> **${client.Util.trimString(reminder.reminder, 120)}**`).join('\n'))
                    return await interaction.reply({
                        embeds: [previousEmbed]
                    })
                } else {
                    if (previous.filter(reminder => reminder.id === oldIdToView.toUpperCase()).length < 1) {
                        return await interaction.reply({
                            content: `The previous reminder ID \`${oldIdToView}\` was not found`,
                            ephemeral: true
                        })
                    }
                    let oldFiltered = previous.filter(reminder => reminder.id === oldIdToView.toUpperCase())[0];
                    let oldReminderInfoEmbed = client.util.embed()
                        .setTitle(`Previous reminder | \`${oldFiltered.id}\``)
                        .setColor(client.misc.color)
                        .setDescription(client.Util.quote(client.Util.trimString(oldFiltered.reminder, 2020)))
                        .addField('Start this reminder again', `To use this reminder again, use the command:\n\`/reminders restart <ID> <NewTime>\`\nExample:\n\`/reminders restart ${oldFiltered.id} 2h\``)
                        .setFooter('Reminded you')
                        .setTimestamp(oldFiltered.date)
                    return await interaction.reply({
                        embeds: [oldReminderInfoEmbed]
                    })
                }
            break;
            case 'restart':
                let idToRestart = interaction.options.getString('id');
                let timeToRestart = interaction.options.getString('duration');
                if (previous.filter(reminder => reminder.id === idToRestart.toUpperCase()).length < 1) {
                    return await interaction.reply({
                        content: `The previous reminder ID \`${idToRestart}\` was not found`,
                        ephemeral: true
                    })
                }
                let reminderToRestart = previous.filter(reminder => reminder.id === idToRestart.toUpperCase())[0];
                if (!ms(timeToRestart)) {
                    return await interaction.reply({
                        content: 'Please provide a valid time (ex. 12h, 1d, 30m)',
                        ephemeral: true
                    });
                }
                let embed = client.util.embed()
                    .setColor(client.misc.color)
                    .setTitle('Reminder')
                let date = new Date(Date.now() + ms(timeToRestart));
                let id = client.Util.generateID();
                let newCurrent = ms(ms(timeToRestart), { long: true });
                await interaction.reply({
                    content: `Reminder \`${reminderToRestart.id}\` re-activated, you will be reminded <t:${parseInt(date.getTime() / 1000)}:R>. The new ID is \`${id}\``
                })
                const message = await interaction.fetchReply()
                let data = {
                    id: id,
                    date: date,
                    current: newCurrent,
                    reminder: reminderToRestart.reminder,
                    user: interaction.user,
                    guild: interaction.guild.id,
                    channel: message.channel.id,
                    message: message.id,
                    embed: embed
                }
                return await client.RadaReminder.create(data);
            break;
        }
    }
};