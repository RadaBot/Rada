const { Listener } = require('discord-akairo');

module.exports = class GuildMemberRemoveListener extends Listener {
    constructor() {
        super('guildMemberRemove', {
            emitter: 'client',
            event: 'guildMemberRemove'
        });
    }

    async exec(member) {
        let channel = this.client.settings.get(member.guild.id, 'ws.channel', false);
        let message = this.client.settings.get(member.guild.id, 'ws.leave', false);
        if (channel && message) {
            message = message.replace(/{tag}/gi, member.user.tag);
            message = message.replace(/{user}/gi, member.user.toString());
            message = message.replace(/{userid}/gi, member.user.id);
            message = message.replace(/{username}/gi, member.user.username);
            message = message.replace(/{membercount}/gi, member.guild.memberCount);
            message = message.replace(/{servername}/gi, member.guild.name);
            try {
                let fetched = await member.guild.channels.fetch(channel, { force: true })
                let chan = member.guild.channels.cache.get(fetched.id)
                chan.send(message);
            } catch (e) {
                if (e.message === 'Missing Permissions') {
                    let fetch = await this.client.users.fetch(member.guild.ownerId, { force: true })
                    let owner = this.client.users.cache.get(fetch.id)
                    owner
                        .send(`I tried to send a message in ${chan.toString()} for a user leaving, however i was missing permissions to do so.\nPlease check the permissions for my role/channel to make sure i have the required permissions.`)
                        .then(() => { })
                        .catch((err) => { return; })
                }
            }
        }
    }
}