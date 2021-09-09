const { emotes: { error } } = require('../../lib/util/constants');
const { Inhibitor } = require('discord-akairo');

module.exports = class Antilink extends Inhibitor {
    constructor() {
        super('Antilink', {
            emitter: 'inhibitorHandler',
            type: 'all'
        });
        this.cache = new Set();
        this.regex = {
            invites: /discord(?:(\.(?:me|io|li|gg|com)|sites\.com|list\.me)\/.{0,4}|app\.com.{1,4}(?:invite|api|oauth2).{0,5}\/)\w+/ig
        }
    }

    async exec(message) {
        if (message.channel.type === 'DM') return;
        if (message.author.id === message.guild.me.id) return;
        let antilink = this.client.settings.get(message.guild.id, 'antilink', false);
        const key = `${message.author.id}.antilink-cooldown`;
        const history = `${message.guild.id}.${message.author.id}`;
        if (antilink) return;
        else {
            let role = message.guild.roles.cache.find(r => r.name.toLowerCase().includes('bypass'));
            if (role && message.member.roles.cache.has(role.id)) return;
            if (message.content.match(this.regex.invites)) {
                if (message.author.id === message.guild.ownerId) return;
                await this.client.settings.set(history, 'history', this.client.settings.get(history, 'history', 0) + 1);
                if (message.guild.me.permissions.has('MANAGE_MESSAGES')) {
                    if (this.cache.has(key)) {
                        await message.delete();
                        return;
                    }
                    await message.reply(`${error} | ${message.author.toString()} **Advertising is not allowed**`);
                    message.delete().then(() => {
                        this.cache.add(key);
                        setTimeout(() => this.cache.delete(key), 300000)
                    })
                    return;
                } else {
                    return message.reply(`${error} | ${message.author.toString()} **Advertising is not allowed**\nI lack the permission to manage messages so I was unable to delete the link.`);
                }
            }
        }
    }
}