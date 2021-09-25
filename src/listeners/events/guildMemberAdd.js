const { Listener } = require('discord-akairo');

module.exports = class GuildMemberAddListener extends Listener {
    constructor() {
        super('guildMemberAdd', {
            emitter: 'client',
            event: 'guildMemberAdd'
        });
    }

    async exec(member) {
        let channel = this.client.settings.get(member.guild.id, 'ws.channel', false);
        let message = this.client.settings.get(member.guild.id, 'ws.join', false);
        let userAutorole = member.guild.roles.cache.get(this.client.settings.get(member.guild.id, 'autorole.user', null));
        let botAutorole = member.guild.roles.cache.get(this.client.settings.get(member.guild.id, 'autorole.bot', null));
        if (userAutorole && !member.user.bot && !member.roles.cache.has(userAutorole)) {
            await member.roles.add(userAutorole, 'User Autorole');
        }
        if (botAutorole && member.user.bot && !member.roles.cache.has(botAutorole)) {
            await member.roles.add(botAutorole, 'Bot Autorole');
        }
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
                        .send(`I tried to send a message in ${chan.toString()} for a user joining, however i was missing permissions to do so.\nPlease check the permissions for my role/channel to make sure i have the required permissions.`)
                        .then(() => { })
                        .catch((err) => { return; })
                }
            }
        }
    }
}