const { Listener } = require('discord-akairo');
const { CronJob } = require('cron');

module.exports = class ScheduleCheckerListener extends Listener {
    constructor() {
        super('scheduleChecker', {
            emitter: 'client',
            event: 'scheduleChecker'
        });
    }

    async exec(schedules) {
        schedules.forEach(async(schedule) => {
            schedule.forEach(async(sch) => {
                let reminderTime = parseInt(new Date(sch.date).getTime() / 1000);
                let currentTime = parseInt(new Date().getTime() / 1000);
                let embed = this.client.util.embed()
                    .setColor(this.client.misc.color)
                    .setTitle('Reminder')

                // fetch the user
                let fetched = await this.client.users.fetch(sch.user.id ? sch.user.id : sch.user.replace('<@', '').replace('>', ''), { force: true });
                let user = await this.client.users.cache.get(fetched.id);

                let current = this.client.settings.get(user.id, 'reminders.current', [])
                if (current.filter(reminder => reminder.id === sch.id).length < 1) return;
                if (reminderTime < currentTime) {
                    new CronJob(new Date(), async () => {
                        await this.client.databaseHandler.storeOldReminder(user, current.filter(reminder => reminder.id === sch.id)[0]);
                        await this.client.RadaReminder.delete(user, sch.id);
                        try {
                            user.send({
                                embeds: [embed.setDescription(`You asked me <t:${parseInt(sch.date.getTime() / 1000)}:R> to remind you of the following:\n\n${this.client.Util.trimString(sch.reminder, 1800)}`)]
                            })
                        } catch (e) {
                            return;
                        }
                    }).start();
                }
            })
        })
    }
};