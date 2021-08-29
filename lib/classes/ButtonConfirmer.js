const { MessageActionRow, MessageButton } = require('discord.js');
const { ids: { confirm, deny } } = require('../util/constants');

module.exports = class ButtonConfirmer {

    constructor(client) {
        this.client = client;
    }

    init() {
        this.client.classLoader.push('[ClassLoader] ButtonConfirmer loaded');
    }

    async start(pages, interaction, hidden, callback) {
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
        await interaction.reply({
            embeds: [pages[0]],
            components: [row]
        })
        let firstInteraction = interaction;
        this.client.on("interactionCreate", async(interaction) => {
            if (!interaction.isButton()) return;
            switch (interaction.customId) {
                case confirm:
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    try {
                        if (callback) {
                            await callback(this.client, firstInteraction);
                        }
                        await firstInteraction.editReply({
                            embeds: [pages[0]],
                            components: []
                        })
                        await interaction.reply({
                            embeds: [pages[1]],
                            ephemeral: hidden
                        })
                    } catch (e) {
                        return;
                    }
                break;
                case deny:
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    try {
                        await firstInteraction.editReply({
                            embeds: [pages[0]],
                            components: []
                        })
                        await interaction.deferUpdate();
                    } catch (e) {
                        return;
                    }
                break;
            }
        })
    }
}