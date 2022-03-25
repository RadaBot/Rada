const { MessageActionRow, MessageButton } = require('discord.js');
const { ids } = require('../util/constants');

class ButtonPaginator {

    constructor(client) {
        this.client = client;
        this.pageControls = [
            "<<",
            "<",
            "x",
            ">",
            ">>"
        ]
    }

    init() {
        this.client.classLoader.push('[ClassLoader] ButtonPaginator loaded');
    }

    chunk(array, chunkSize) {
        const output = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            output.push(array.slice(i, i + chunkSize));
        }
        return output;
    }

    async start(pages, interaction, hidden = false) {
        const row = new MessageActionRow()
        let controlButtons = [];
        for (const emoji of this.pageControls) {
            let button = new MessageButton()
                .setCustomId(emoji)
                .setStyle(emoji === ids.deny ? 'DANGER' : 'SECONDARY')
                .setLabel(emoji)
            controlButtons.push(button)
        }
        row.addComponents(controlButtons.map(b => b))
        //const row2 = new MessageActionRow()
        //    .addComponents(
        //        new MessageButton()
        //            .setCustomId(ids.delete)
        //            .setStyle('DANGER')
        //            .setEmoji(ids.delete)
        //    )
        let page = 0;
        if (pages.length === 1) {
            await interaction.reply({
                embeds: [pages[page].setFooter(`Requested by ${interaction.user.username}`)],
                //components: hidden ? [row] : [row, row2],
                components: [row],
                ephemeral: hidden
            })
            return;
        }
        await interaction.reply({
            embeds: [pages[page].setFooter(`Page ${page + 1} of ${pages.length} | Requested by ${interaction.user.username}`)],
            //components: hidden ? [row] : [row, row2],
            components: [row],
            ephemeral: hidden
        })
        let firstInteraction = interaction;
        this.client.on("interactionCreate", async(interaction) => {
            if (!interaction.isButton()) return;
            switch (interaction.customId) {
                case "<<":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    if (page !== 0) {
                        page = 0
                        try {
                            await firstInteraction.editReply({
                                embeds: [pages[page].setFooter(`Page ${page + 1} of ${pages.length} | Requested by ${interaction.user.username}`)],
                                //components: hidden ? [row] : [row, row2],
                                components: [row],
                                ephemeral: hidden
                            })
                            await interaction.deferUpdate();
                        } catch (e) {
                            return;
                        }
                    }
                break;
                case "<":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    page = page > 0 ? --page : pages.length - 1;
                    try {
                        await firstInteraction.editReply({
                            embeds: [pages[page].setFooter(`Page ${page + 1} of ${pages.length} | Requested by ${interaction.user.username}`)],
                            //components: hidden ? [row] : [row, row2],
                            components: [row],
                        })
                        await interaction.deferUpdate();
                    } catch (e) {
                        return;
                    }
                break;
                case "x":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    try {
                        await firstInteraction.editReply({
                            embeds: [pages[page].setFooter(`Page ${page + 1} of ${pages.length} | Requested by ${interaction.user.username}`)],
                            components: [],
                            ephemeral: hidden
                        })
                    } catch (e) {
                        return;
                    }
                break;
                case ">":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    page = page + 1 < pages.length ? ++page : 0;
                    try {
                        await firstInteraction.editReply({
                            embeds: [pages[page].setFooter(`Page ${page + 1} of ${pages.length} | Requested by ${interaction.user.username}`)],
                            //components: hidden ? [row] : [row, row2],
                            components: [row],
                            ephemeral: hidden
                        })
                        await interaction.deferUpdate();
                    } catch (e) {
                        return;
                    }
                break;
                case ">>":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    if (page !== pages.length - 1) {
                        page = pages.length - 1;
                        try {
                            await firstInteraction.editReply({
                                embeds: [pages[page].setFooter(`Page ${page + 1} of ${pages.length} | Requested by ${interaction.user.username}`)],
                                //components: hidden ? [row] : [row, row2],
                                components: [row],
                                ephemeral: hidden
                            })
                            await interaction.deferUpdate();
                        } catch (e) {
                            return;
                        }
                    }
                break;
                //case ids.delete:
                //    if (interaction.user.id !== firstInteraction.user.id) return;
                //    try {
                //        await firstInteraction.deleteReply()
                //    } catch (e) {
                //        return;
                //    }
                //break;
            }
        })
    }
}

module.exports = ButtonPaginator
