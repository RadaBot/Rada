const { SlashCommandBuilder } = require('@discordjs/builders');
const { emotes } = require('../../../lib/util/constants');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user in the server')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('The user to mute')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('duration')
            .setDescription('How long do you want to mute them for (ex. 12h, 1d, 30m)')
        ),
    category: 'Moderation',
    description: 'Mute a user in the server',
    async execute(interaction, client) {
        let user = interaction.options.getUser('user');
        let duration = interaction.options.getString('duration');
        let muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('muted'));
        let fetched = await interaction.guild.members.fetch(user.id, { force: true });
        let member = interaction.guild.members.cache.get(fetched.id);
        if (user.id === interaction.user.id) {
            return await interaction.reply({
                content: 'You can\'t mute yourself',
                ephemeral: true
            });
        }
        if (user.id === interaction.guild.ownerId) {
            return await interaction.reply({
                content: 'You can\'t mute the server owner',
                ephemeral: true
            });
        }
        if (user.id === client.user.id) {
            return await interaction.reply({
                content: 'No, i will not mute myself >:[',
                ephemeral: true
            });
        }
        if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return await interaction.reply({
                content: `You are unable to mute \`${user.tag}\` because they have a higher role than you`,
                ephemeral: true
            });
        }
        if (interaction.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return await interaction.reply({
                content: `I am unable to mute \`${user.tag}\` because they have a higher role than me`,
                ephemeral: true
            });
        }
        if (muteRole && interaction.guild.me.roles.highest.comparePositionTo(muteRole) <= 0) {
            return await interaction.reply({
                content: 'The mute role must be lower than my role',
                ephemeral: true
            });
        }
        if (muteRole) await client.settings.set(interaction.guild.id, 'muterole', muteRole.id);
        if (muteRole && member.roles.cache.has(muteRole.id)) {
            return await interaction.reply({
                content: `\`${member.user.tag} (${member.id})\` is already muted`,
                ephemeral: true
            });
        }
        await interaction.deferReply();
        let text = muteRole ? '' : 'There is no mute role configured in this server, configuring now...';
        let completedText = muteRole ? '' : `~~${text}~~\n${emotes.success} Mute role configured\n\n`;
        let failedText = `~~${text}~~\n${emotes.error} Failed to configure mute role\n\n`;
        if (!muteRole) {
            await interaction.editReply({
                content: text
            });
            await interaction.guild.roles.create({
                name: 'Muted',
                color: '#68696d',
                reason: `Mute role configured automatically by ${client.user.username}`
            }).then(async(role) => {
                await client.settings.set(interaction.guild.id, 'muterole', role.id);
                interaction.guild.channels.cache.forEach(async(channel) => {
                    await channel.permissionOverwrites.edit(role, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    }, {
                        reason: 'Configuring mute role channel permissions',
                        type: 0
                    });
                });
                await interaction.editReply({
                    content: completedText
                });
            }).catch(async(e) => {
                return await interaction.editReply({
                    content: `${failedText}${emotes.error} | \`${e.message}\``
                });
            })
        }
        let role = await client.settings.get(interaction.guild.id, 'muterole');
        await member.roles.add(role, `Muted by ${interaction.user.username}`);
        if (!duration) {
            await member.roles.add(role, `Permanently muted by ${interaction.user.username}`);
            return await interaction.editReply({
                content: `${completedText}${emotes.success} | Permanently muted \`${user.tag} (${user.id})\``
            });
        }
        if (isNaN(ms(duration))) {
            return await interaction.editReply({
                content: `${completedText}The mute duration you entered is invalid`,
                ephemeral: true
            });
        }
        if (ms(duration) < 1000) duration = '60s';
        let parsedTime = ms(duration, { long: true });
        let time = ms(parsedTime, { long: true });
        await interaction.editReply({
            content: `${completedText}${emotes.success} | Muted \`${user.tag} (${user.id})\` for \`${time}\``
        });
        await member.roles.add(role, `Muted for ${time} by ${interaction.user.username}`);
        setTimeout(async() => {
            if (member.roles.cache.has(role)) {
                await member.roles.remove(role, `Automatic unmute - Muted for ${time} by ${interaction.user.username}`)
                    .then(async() => {
                        return await interaction.editReply({
                            content: `${completedText}${emotes.success} | Automatically unmuted \`${user.tag} (${user.id})\` after being muted for \`${time}\`\n\nUnmuted: <t:${parseInt(Date.now() / 1000)}:F>`
                        });
                    })
                    .catch(async(e) => {
                        return await interaction.editReply({
                            content: `${completedText}${emotes.error} | Failed to automatically unmute \`${user.tag} (${user.id})\` - ${e.message}`
                        });
                    })
            }
        }, ms(duration));
    }
};