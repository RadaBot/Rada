const { Listener } = require('discord-akairo');

module.exports = class GuildCreateListener extends Listener {
    constructor() {
        super('guildCreate', {
            emitter: 'client',
            event: 'guildCreate'
        });
    }

    async exec(guild) {
        this.client.presence.set({
            status: 'online',
            activity: {
                name: `/help | ${this.client.guilds.cache.size} servers`,
                type: 'WATCHING'
            }
        });
        let fetch = await this.client.users.fetch(guild.ownerId, { force: true });
        let owner = this.client.users.cache.get(fetch.id);
        this.client.logger.info(`${this.client.user.username} has been added to the guild ${guild.name}[${guild.id}]`);
        let embed = this.client.util.embed()
            .setColor(this.client.color)
            .setAuthor('Guild', 'https://cdn.discordapp.com/emojis/822855012110696448.png?v=1')
            .setThumbnail(guild.iconURL({dynamic: true, size: 512}) ?? 'https://cdn.discordapp.com/embed/avatars/0.png')
            .setDescription(`${this.client.user.username} has been added to a new guild which has **${guild.memberCount}** members`)
            .addField('Guild', `${guild.name}\n${guild.id}`, true)
            .addField('Owner', `${owner.tag}\n${owner.id}`, true)
            .addField('Total guilds', `${this.client.guilds.cache.size}`)
            .setTimestamp()
        this.client.channels.cache.get('789934400930316339').send({
            embeds: [embed]
        });
    }
};