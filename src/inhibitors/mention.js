const { MessageActionRow, MessageButton } = require('discord.js');
const { Inhibitor } = require('discord-akairo');

module.exports = class Mention extends Inhibitor {
    constructor() {
        super('mention', {
            type: 'all'
        });
    }

    async exec(message) {
        if (message.channel.type === 'DM') return;
        const pings = [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`];

        let slashCommandsAllowed = true;
        await this.client.api.applications(this.client.user.id)
            .guilds(message.guild.id)
            .commands.get()
            .catch((_) => {
                slashCommandsAllowed = false;
            })
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setLabel('Rada Support')
            .setStyle('LINK')
            .setURL('https://discord.gg/4yKZVQ2cQh')
        )
        let embed = this.client.util.embed()
            .setTitle(`Information update`)
            .setDescription([
                `> **${this.client.user.username}** now has [Slash Commands](https://support.discord.com/hc/en-us/articles/1500000368501)!`,
                slashCommandsAllowed ? `${this.client.emotes.success} Slash commands are enabled for **${message.guild.name}**!\nTry them out by typing \`/\`` : `${this.client.emotes.error} Slash commands are not enabled for **${message.guild.name}**. If you are a server admin and want to enable the use of slash commands for ${this.client.user.username}, [click here to enable them](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&scope=applications.commands&guild_id=${message.guild.id}&disable_guild_select=true).`,
                `${this.client.emotes.info} Enabling slash commands is highly recommended: regular commands will no longer work.\nIf it says slash commands are enabled, but they're not, [click here](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&scope=applications.commands&guild_id=${message.guild.id}&disable_guild_select=true) to force enable them`
            ].join('\n\n'))
            .addField('Want more info?', 'Click the button below to join our support server where we can help with anything you need.')
            .setTimestamp()
            .setColor(this.client.misc.color)

        if (pings.some(p => message.content === p)) {
            return message.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }
}