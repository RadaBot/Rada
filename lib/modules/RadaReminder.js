const ms = require('ms');
class RadaReminder {
    constructor(duration, message, user, date) {
        this.duration = duration;
        this.message = message;
        this.user = user;
        this.date = date;
    }

}

module.exports = RadaReminder;