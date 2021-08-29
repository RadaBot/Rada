const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Util = require('../../../lib/classes/Util');
const { ids: { confirm, deny } } = require('../../../lib/util/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user')
        .addUserOption((option) => option
            .setName('user').setDescription('The user you want to ban')
            .setRequired(true)
        )
        .addIntegerOption((option) => option
            .setName('days')
            .setDescription('How many days of messages to remove')
            .addChoice('0', 0)
            .addChoice('1', 1)
            .addChoice('2', 2)
            .addChoice('3', 3)
            .addChoice('4', 4)
            .addChoice('5', 5)
            .addChoice('6', 6)
            .addChoice('7', 7)
        )
        .addStringOption((option) => option
            .setName('reason')
            .setDescription('Optional ban reason')
        ),
    category: 'Moderation',
    description: 'Ban a user',
    permissions: ['BAN_MEMBERS'],
    async execute(interaction, client) {
        let user = interaction.options.getUser('user');
        let days = interaction.options.getInteger('days') || 0;
        let reason = interaction.options.getString('reason') || 'Not provided';
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setTimestamp()
        let member = interaction.guild.members.cache.get(user.id);
        if (!member.bannable) {
            return await interaction.reply({
                embeds: [
                    embed
                    .setDescription(`I am unable to ban \`${user.tag}\``)
                ],
                ephemeral: true
            });
        }
        if (interaction.guild.members.cache.get(interaction.user.id).roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return await interaction.reply({
                embeds: [
                    embed
                    .setDescription(`You are unable to ban \`${user.tag}\` due to them having a higher role than you`)
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
            components: [row],
            ephemeral: true
        });
        let firstInteraction = interaction;
        client.on("interactionCreate", async(interaction) => {
            if (!interaction.isButton()) return;
            switch (interaction.customId) {
                case "confirm":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    await member.ban({
                        days: days,
                        reason: `Banned by ${firstInteraction.user.username} for ${reason}`
                    })
                        .then(async() => {
                            await firstInteraction.editReply({
                                embeds: [
                                    embed
                                    .setDescription(`${client.emotes.success} \`${user.tag}\` has been banned from the server`)
                                    .addField('# days of messages deleted', days.toString())
                                    .addField('Reason', reason)
                                ],
                                components: []
                            })
                        })
                        .catch(async(e) => {
                            await firstInteraction.editReply({
                                embeds: [
                                    embed
                                    .setDescription(`${client.emotes.error} Failed to ban \`${user.tag}\``)
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
                        components: [],
                        ephemeral: true
                    });
                    break;
            }
        })
    }
};