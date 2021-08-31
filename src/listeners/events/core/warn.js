const { Listener } = require('discord-akairo');

module.exports = class WarnListener extends Listener {
    constructor() {
        super('warn', {
            emitter: 'client',
            event: 'warn'
        });
    }

    async exec(info) {
        this.client.logger.warn(info);
    }
};