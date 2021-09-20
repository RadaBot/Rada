const { emotes: { error } } = require('../../lib/util/constants');
const { Inhibitor } = require('discord-akairo');

module.exports = class SwearFilter extends Inhibitor {
    constructor() {
        super('SwearFilter', {
            emitter: 'inhibitorHandler',
            type: 'all'
        });
    }

    async exec(message) {
        if (message.channel.type === 'DM') return;
        if (message.author.id === message.guild.me.id) return;
        let swearFilter = this.client.settings.get(message.guild.id, 'wordfilter', false);
        let filteredWords = await this.client.settings.get(message.guild.id, 'filteredwords', [])
        if (filteredWords.length < 1) return;
        if (swearFilter) {
            if (filteredWords.some(word => message.content.includes(word))) {
                if (message.author.id === message.guild.ownerId) return;
                if (message.guild.me.permissions.has('MANAGE_MESSAGES')) {
                    await message.reply(`${error} | ${message.author.toString()} **Using that word is not allowed**`);
                    message.delete();
                    return;
                } else {
                    return message.reply(`${error} | ${message.author.toString()} **Using that word is not allowed**\nI lack the permission to manage messages so I was unable to delete the message.`);
                }
            }
        } else {
            return;
        }
    }
}