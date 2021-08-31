const schedule = require('cron');
const ReminderHistory = require('./RadaReminderHistory');
const RadaReminder = require('./RadaReminder');

class RadaScheduler {

    constructor(client) {
        this.client = client;
    }

    create(date, message, user, reminder, embed, duration) {
        let reminderData = new RadaReminder(date, reminder, user.id);
        this.client.reminders.current.push(reminderData)
        new schedule.CronJob(date, () => {
            let old = new ReminderHistory(user);
            this.delete(user, date, reminder);
            old.store(reminderData);
            user.send({
                embeds: [embed.setDescription(`You asked me \`${duration}\` ago to remind you of the following:\n\n${this.client.Util.trimString(reminder, 1800)}`)]
            })
            .catch(() => {
                message.reply({
                    embeds: [embed.setDescription(`I tried to DM you your reminder, but I was unable to.\n\nYou asked me \`${duration}\` ago to remind you of the following: **${this.client.Util.trimString(reminder, 1800)}**`)]
                });
            })
        }).start();
    }

    delete(author, start, reminder) {
        let current = this.client.reminders.current;
        let data = new RadaReminder(start, reminder, author.id);
        current.splice(current.indexOf(data), 1);
    }

    clear() {
        this.client.reminders.current = [];
    }

    clearSaved(author) {
        this.client.reminders.old = [];
        let db = new ReminderHistory(author);
        db.clear();
    }
}

module.exports = RadaScheduler;