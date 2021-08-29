const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Util = require('../../../lib/classes/Util');
const { ids: { confirm, deny } } = require('../../../lib/util/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user')
        .addUserOption((option) => option
            .setName('user').setDescription('The user you want to kick')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('reason')
            .setDescription('Optional kick reason')
        ),
    category: 'Moderation',
    description: 'Kick a user',
    permissions: ['KICK_MEMBERS'],
    async execute(interaction, client) {
        let user = interaction.options.getUser('user');
        let reason = interaction.options.getString('reason') || 'Not provided';
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setTimestamp()
        let member = interaction.guild.members.cache.get(user.id);
        if (!member.kickable) {
            return await interaction.reply({
                embeds: [
                    embed
                    .setDescription(`I am unable to kick \`${user.tag}\``)
                ],
                ephemeral: true
            });
        }
        if (interaction.guild.members.cache.get(interaction.user.id).roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return await interaction.reply({
                embeds: [
                    embed
                    .setDescription(`You are unable to kick \`${user.tag}\` due to them having a higher role than you`)
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
                .setDescription(`Are you sure you want to kick \`${user.tag}\`?`)
            ],
            components: [row]
        });
        let firstInteraction = interaction;
        client.on("interactionCreate", async(interaction) => {
            if (!interaction.isButton()) return;
            switch (interaction.customId) {
                case "confirm":
                    if (interaction.user.id !== firstInteraction.user.id) return;
                    await interaction.guild.members.cache.get(user.id).kick(`Kicked by ${firstInteraction.user.username} for ${reason}`)
                        .then(async() => {
                            await firstInteraction.editReply({
                                embeds: [
                                    embed
                                    .setDescription(`${client.emotes.success} \`${user.tag}\` has been kicked from the server`)
                                    .addField('Reason', reason)
                                ],
                                components: []
                            })
                        })
                        .catch(async(e) => {
                            await firstInteraction.editReply({
                                embeds: [
                                    embed
                                    .setDescription(`${client.emotes.error} Failed to kick \`${user.tag}\``)
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