
module.exports = class DatabaseHandler {

    constructor(client) {
        this.client = client;
    }

    addToDoListTask = async (member, content) => {
        let array = [];
        let db = this.client.settings.get(member.id ? member.id : member, 'todolist', array);
        if (db.length < 1) {
            array.push(content);
        } else {
            for(let i = 0; i < db.length; i++) {
                array.push(db[i]);
            }
            array.push(content);
        }
        await this.client.settings.set(member.id ? member.id : member, 'todolist', array);
    }

    addWarning = async (member, guild, warning) => {
        let array = [];
        const key = `${guild.id}.${member.id}`;
        let db = this.client.settings.get(key, 'warnings', array);
        if (db.length < 1) {
            array.push(warning);
        } else {
            for(let i = 0; i < db.length; i++) {
                array.push(db[i]);
            }
            array.push(warning);
        }
        await this.client.settings.set(key, 'warnings', array);
    }

    addAfkPing = async(member, content) => {
        let array = [];
        let db = this.client.settings.get(member.id, 'afkPings', array);
        if (db.length < 1) {
            array.push(content);
        } else {
            for (let i = 0; i < db.length; i++) {
                array.push(db[i]);
            }
            array.push(content);
        }
        await this.client.settings.set(member.id, 'afkPings', array);
    }

    addNewReminder = async(user, data) => {
        let array = [];
        let db = this.client.settings.get(user.id, 'reminders.current', array);
        if (db.length < 1) {
            array.push(data);
        } else {
            for (let i = 0; i < db.length; i++) {
                array.push(db[i]);
            }
            array.push(data);
        }
        await this.client.settings.set(user.id, 'reminders.current', array);
    }

    storeOldReminder = async(user, data) => {
        let array = [];
        let db = this.client.settings.get(user.id, 'reminders.old', array);
        if (db.length < 1) {
            array.push(data);
        } else {
            array.push(data);
            if (db.length > 4) {
                for (let i = 0; i < 4; i++) {
                    array.push(db[i]);
                }
            } else {
                for (let i = 0; i < db.length; i++) {
                    array.push(db[i]);
                }
            }
        }
        await this.client.settings.set(user.id, 'reminders.old', array);
    }

}