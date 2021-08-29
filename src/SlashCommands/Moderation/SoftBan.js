const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Util = require('../../../lib/classes/Util');
const { ids: { confirm, deny } } = require('../../../lib/util/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('softban')
        .setDescription('Basically a kick that removes their messages')
        .addUserOption((option) => option
            .setName('user').setDescription('The user you want to softban')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('reason')
            .setDescription('Optional softban reason')
        ),
    category: 'Moderation',
    description: 'Basically a kick that removes their messages',
    permissions: ['BAN_MEMBERS'],
    async execute(interaction, client) {
        let user = interaction.options.getUser('user');
        let reason = interaction.options.getString('reason') || 'Not provided';
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setTimestamp()
        let member = interaction.guild.members.cache.get(user.id);
        if (!member.bannable) {
            return await interaction.reply({
                embeds: [
                    embed
                    .setDescription(`I am unable to softban \`${user.tag}\``)
                ],
                ephemeral: true
            });
        }
        if (interaction.guild.members.cache.get(interaction.user.id).roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return await interaction.reply({
                embeds: [
                    embed
                    .setDescription(`You are unable to softban \`${user.tag}\` due to them having a higher role than you`)
                ],
                ephemeral: true
            });
        }
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('confirm')
                .setStyle('SUCCESS')
                .setEmoji(confirm),
                new MessageButton()
                .setCustomId('deny')
                .setStyle('DANGER')
                .setEmoji(deny),
            )
        await interaction.reply({
            embeds: [
                embed
                .setDescription(`Are you sure you want to ban \`${user.tag}\`?`)
            ],
            components: [row]
        });
        let firstInteraction = interaction;
        client.on("interactionCreate", async(interaction) => {
            if (!interaction.isButton()) return;
            switch (interaction.customId) {
                case "confirm":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    await interaction.guild.members.cache.get(user.id).ban({
                        days: 7,
                        reason: `Banned by ${firstInteraction.user.username} for ${reason}`
                    })
                        .then(async() => {
                            await interaction.guild.members.unban(user.id);
                            await firstInteraction.editReply({
                                embeds: [
                                    embed
                                    .setDescription(`${client.emotes.success} \`${user.tag}\` has been softbanned from the server`)
                                    .addField('Reason', reason)
                                ],
                                components: []
                            })
                        })
                        .catch(async(e) => {
                            await firstInteraction.editReply({
                                embeds: [
                                    embed
                                    .setDescription(`${client.emotes.error} Failed to softban \`${user.tag}\``)
                                    .addField('Error', Util.codeBlock('js', e.message))
                                ],
                                components: [],
                                ephemeral: true
                            });
                        })
                    break;
                case "deny":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    await firstInteraction.editReply({
                        embeds: [embed.setDescription(`${client.emotes.success} Cancelled`)],
                        components: []
                    });
                    break;
            }
        })
    }
};