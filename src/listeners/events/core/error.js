const { Listener } = require('discord-akairo');
const { production } = require('../../../config');

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
            `Error:  ${error.message}`,
            `Stacktrace:`
        ]);
        this.client.logger.error(error.stack.split('\n'));
        let embed = this.client.util.embed()
            .setColor(this.client.misc.color)
            .setTitle('Client error')
            .setDescription(`Guild: **${message.guild ? message.guild.name : 'Unknown'}**\nUser: \`${message.author ? `${message.author} (${interaction.user.id})` : 'Unknown'}\`\n\n${Util.codeBlock('properties', error.stack)}`)
            .setTimestamp()
        if (production) {
            this.client.channels.cache.get('787745780432764948').send({
                embeds: [embed]
            });
        }
        return message.channel.send(`\`\`\`js\n${error.message}\`\`\``);
    }
};