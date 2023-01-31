const { ids: { confirm, deny } } = require('../../lib/util/constants');
const { MessageActionRow, MessageButton } = require('discord.js');
const { Inhibitor } = require('discord-akairo');

module.exports = class AFK extends Inhibitor {
    constructor() {
        super('afk', {
            type: 'all'
        });
    }

        async exec(message) {
            if (message.author.bot) return;
            let afkStatus = await this.client.settings.get(message.author.id, 'afk', { afk: false, message: null, started: null });
            let afkSince = afkStatus.started;
            let afkPings = await this.client.settings.get(message.author.id, 'afkPings', []);
            if (afkStatus.afk) {
                await this.client.settings.set(message.author.id, 'afk', { afk: false, message: null, started: null });
                let embed = this.client.util.embed()
                    .setAuthor(`AFK ➜ ${message.author.username}`, message.author.avatarURL({ dynamic: true }))
                    .setDescription(`Your AFK mode has been turned off.${afkPings.length > 0 ? `\nWhile you was away, you was @mentioned **${afkPings.length} times**.\nDo you want to see the @mentions you got? (Use the buttons below)` : ''}`)
                    .setColor(this.client.misc.color)
                    .setFooter(`AFK for ${this.client.convertMs(Math.abs(new Date() - afkSince))}`)
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(confirm)
                        .setStyle('SUCCESS')
                        .setEmoji(confirm),
                    new MessageButton()
                        .setCustomId(deny)
                        .setStyle('DANGER')
                        .setEmoji(deny)
                )
            let msg = await message.reply({
                embeds: [embed],
                components: afkPings.length < 1 ? [] : [row]
            })
            if (afkPings.length < 1) return;
            const pages = this.client.buttonPaginator.chunk(afkPings, 5);
            let embeds = [];
            for (let i = 0; i < pages.length; i++) {
                let embed = this.client.util.embed()
                    .setTitle('Your @mentions while you was AFK')
                    .setColor(this.client.misc.color)
                    .setDescription(pages[i].join('\n'))
                    .setTimestamp()
                embeds.push(embed);
            }
            let firstInteraction = msg;
            this.client.on("interactionCreate", async(interaction) => {
                if (!interaction.isButton()) return;
                switch (interaction.customId) {
                    case confirm:
                        if (interaction.user.id !== message.author.id) return;
                        await this.client.settings.set(message.author.id, 'afkPings', []);
                        try {
                            firstInteraction.edit({
                                embeds: [embed],
                                components: []
                            })
                            if (pages.length < 2) {
                                let embed2 = this.client.util.embed()
                                    .setTitle('Your @mentions while you was AFK')
                                    .setColor(this.client.misc.color)
                                    .setDescription(afkPings.join('\n'))
                                    .setTimestamp()
                                return await interaction.reply({
                                    embeds: [embed2],
                                    ephemeral: true
                                })
                            } else {
                                return await this.client.buttonPaginator.start(embeds, interaction, true)
                            }
                        } catch (e) {
                            return;
                        }
                    break;
                    case deny:
                        if (interaction.user.id !== message.author.id) return;
                        await this.client.settings.set(message.author.id, 'afkPings', []);
                        try {
                            firstInteraction.edit({
                                embeds: [msg.embeds[0].setDescription(`Your AFK mode has been turned off\nWhile you was away, you was mentioned **${afkPings.length} time${afkPings.length === 1 ? '' : 's'}**.\n\n${this.client.emotes.success} **Your @mentions have been cleared.**`)],
                                components: []
                            })
                            await interaction.deferUpdate()
                        } catch (e) {
                            return;
                        }
                    break;
                }
            })
        }
    }
}