const schedule = require('cron');

class RadaReminder {

    constructor(client) {
        this.client = client;
    }

    init() {
        this.client.classLoader.push('[ClassLoader] RadaReminder loaded');
    }

    async create({ ... data }) {
        let reminderData = {
            id: data.id,
            date: data.date,
            reminder: data.reminder,
            user: data.user,
            current: data.current,
            message: data.message
        }
        let createdAt = new Date();
        await this.client.databaseHandler.addNewReminder(data.user, reminderData);
        new schedule.CronJob(data.date, async () => {
            await this.delete(data.user, reminderData.id);
            await this.client.databaseHandler.storeOldReminder(data.user, reminderData);
            data.user.send({
                embeds: [data.embed.setDescription(`You asked me <t:${parseInt(createdAt.getTime() / 1000)}:R> to remind you of the following:\n\n${this.client.Util.trimString(data.reminder, 1800)}`)]
            })
            .catch(() => {
                data.message.reply({
                    content: data.user.toString(),
                    embeds: [data.embed.setDescription(`I tried to DM you your reminder, but I was unable to.\n\nYou asked me <t:${parseInt(createdAt.getTime() / 1000)}:R> ago to remind you of the following: **${this.client.Util.trimString(data.reminder, 1800)}**`)],
                    ephermal: true
                });
            })
        }).start();
    }

    async delete(user, id) {
        let removed = this.client.settings.get(user.id, 'reminders.current', [])
            .filter(reminder => reminder.id !== id);
        await this.client.settings.set(user.id, 'reminders.current', removed);
    }

}

module.exports = RadaReminder;