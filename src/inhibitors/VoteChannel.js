const { emotes: { success, error } } = require('../../lib/util/constants');
const { Inhibitor } = require('discord-akairo');

module.exports = class VoteChannel extends Inhibitor {
    constructor() {
        super('voteChannel', {
            type: 'all'
        });
    }

    async exec(message) {
        if (message.channel.type === 'DM') return;
        if (this.client.settings.get(message.guild.id, 'vote', null)) {
            if (!message.guild.me.permissions.has('ADD_REACTIONS') || !message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) {
                return message.reply('**This channel is set as the vote channel, but I don\'t have permission to add reactions**');
            }
            await message.react(success);
                  message.react(error);
            return;
        }
    }
}