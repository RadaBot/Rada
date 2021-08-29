const { Listener } = require('discord-akairo');

module.exports = class ErrorListener extends Listener {
    constructor() {
        super('error', {
            emitter: 'commandHandler',
            event: 'error'
        });
    }

    async exec(error, message) {
        this.client.logger.error([
            'Error occured',
            `Type:   ${error.name}`,
            `Error:  ${error.message}`
        ]);
        return message.channel.send(`\`\`\`js\n${error.message}\`\`\``);
    }
};