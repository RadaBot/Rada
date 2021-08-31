class ReminderHistory {

    constructor(client, author) {
        this.author = author;
        this.client = client;
        this.reminders = this.client.settings.get(this.author.id, 'reminders', []);
    }

    store(obj) {
        let array = [];
        if (this.reminders.length <= 4) {
            array.push(obj);
            for (let i = 0; i < this.reminders.length; i++) {
                array.push(this.reminders[i])
            }
        } else {
            if (this.reminders.length === 5) {
                this.reminders.pop()
                array.push(obj)
                for (let i = 0; i < this.reminders.length; i++) {
                    array.push(this.reminders[i])
                }
            }
        }
        this.client.settings.set(this.author.id, 'reminders', array);
    }
    clear() {
        this.client.settings.set(this.author.id, 'reminders', []);
    }
    populate() {
        this.client.reminders.old = this.client.settings.get(this.author.id, 'reminders', []);
    }
}

module.exports = ReminderHistory;