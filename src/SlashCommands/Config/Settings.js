const { SlashCommandBuilder } = require('@discordjs/builders');
const { inspect } = require('util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('The bot\'s main settings')
        .addSubcommand((subcommand) => subcommand
            .setName('antilink')
            .setDescription('The module for auto deleting invite links')
            .addStringOption((option) => option
                .setName('toggle')
                .setDescription('Enable or disable here')
                .addChoice('On', 'on')
                .addChoice('Off', 'off')
            )
            .addStringOption((option) => option
                .setName('reset')
                .setDescription('Do you want to reset to default?')
                .addChoice('Yes', 'true')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('autorole')
            .setDescription('Manage roles that are given to users or bots when they join')
            .addStringOption((option) => option
                .setName('type')
                .setDescription('Who the role should be given to')
                .addChoice('Bots', 'bot')
                .addChoice('Users', 'user')
            )
            .addRoleOption((option) => option
                .setName('role')
                .setDescription('The role you want to give')
            )
            .addStringOption((option) => option
                .setName('reset')
                .setDescription('Do you want to reset to default?')
                .addChoice('Yes', 'true')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('votechannel')
            .setDescription('Add ✔ ✖ reactions in a channel when someone sends a message')
            .addChannelOption((option) => option
                .setName('channel')
                .setDescription('The channel you want the reactions to be added in')
            )
            .addStringOption((option) => option
                .setName('reset')
                .setDescription('Do you want to reset to default?')
                .addChoice('Yes', 'true')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('data')
            .setDescription('Your data we have stored in our database')
            .addStringOption((option) => option
                .setName('clear')
                .setDescription('Do you want to clear your data?')
                .addChoice('Yes', 'true')
            )
        ),
    category: 'Config',
    description: 'The bot\'s main settings',
    permissions: ['MANAGE_MESSAGES', 'MANAGE_GUILD', 'MANAGE_ROLES'],
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp()
        switch (subcommand) {

            case 'antilink':
                let toggle = interaction.options.getString('toggle');
                let resetAntilink = interaction.options.getString('reset');
                let currentAL = await client.settings.get(interaction.guild.id, 'antilink', 'off');
                if (resetAntilink) {
                    if (currentAL === 'off') {
                        embed.addField('Failed', 'The antilink is already \`off\`')
                        return await interaction.reply({
                            embeds: [embed]
                        })
                    }
                    await client.settings.set(interaction.guild.id, 'antilink', 'off');
                    embed.addField(`Antilink updated`, `The antilink has been reset`)
                    return await interaction.reply({
                        embeds: [embed]
                    })
                }
                if (!toggle) {
                    return await interaction.reply({
                        embeds: [this.currentAntilink(client, embed, currentAL)]
                    })
                }
                if (toggle === currentAL) {
                    embed.addField(`Failed`, `The antilink is already \`${toggle}\``)
                    return await interaction.reply({
                        embeds: [embed]
                    })
                }
                await client.settings.set(interaction.guild.id, 'antilink', toggle);
                embed.addField(`Antilink updated`, `The antilink is now \`${toggle}\``)
                return await interaction.reply({
                    embeds: [embed]
                })
            break;

            case 'autorole':
                let type = interaction.options.getString('type');
                let role = interaction.options.getRole('role');
                let resetAutorole = interaction.options.getString('reset');
                let currentARBot = client.settings.get(interaction.guild.id, 'autorole.bot', null);
                let currentARUser = client.settings.get(interaction.guild.id, 'autorole.user', null);
                if (!role && type && !resetAutorole || !role && !type && !resetAutorole) {
                    return await interaction.reply({
                        embeds: [this.currentAutorole(client, interaction, embed, currentARBot, currentARUser)]
                    })
                }
                if (role && role.position > interaction.guild.me.roles.highest.position) {
                    embed.addField('Failed', 'The autorole must be lower than my highest role')
                    return await interaction.reply({
                        embeds: [embed]
                    })
                }
                if (resetAutorole) {
                    if (type && type === 'bot') { // reset bot autorole
                        if (!currentARBot) { // no bot autorole
                            embed.addField('Failed', 'There is no bot autorole to reset')
                            return await interaction.reply({ embeds: [embed] })
                        }
                        await client.settings.set(interaction.guild.id, 'autorole.bot', null);
                        embed.addField('Autorole updated', 'The bot autorole has been reset');
                        return await interaction.reply({ embeds: [embed] })
                    } else if (type && type === 'user') { // reset user autorole
                        if (!currentARUser) { // no user autorole
                            embed.addField('Failed', 'There is no user autorole to reset')
                            return await interaction.reply({ embeds: [embed] })
                        }
                        await client.settings.set(interaction.guild.id, 'autorole.user', null);
                        embed.addField('Autorole updated', 'The bot autorole has been reset');
                        return await interaction.reply({ embeds: [embed] })
                    } else { // reset both autoroles
                        if (!currentARBot && currentARUser) { // no autoroles
                            embed.addField('Failed', 'There is no autorole to reset')
                            return await interaction.reply({ embeds: [embed] })
                        }
                        await client.settings.set(interaction.guild.id, 'autorole.bot', null);
                              client.settings.set(interaction.guild.id, 'autorole.user', null);
                        embed.addField('Autorole updated', 'The bot autorole has been reset')
                            .addField('Autorole updated', 'The user autorole has been reset')
                        return await interaction.reply({ embeds: [embed] })
                    }
                }
                if (role) {
                    if (type && type === 'bot') { // set bot autorole
                        if (role.id === currentARBot) {
                            embed.addField('Failed', `The bot autorole is already \`@${role.name} (${role.id})\`...\nTry another role`)
                            return await interaction.reply({ embeds: [embed] })
                        }
                        await client.settings.set(interaction.guild.id, 'autorole.bot', role.id);
                        embed.addField('Autorole updated', `The bot autorole has been set to \`@${role.name} (${role.id})\`\nYou can reset it with \`/settings autorole bot reset\``)
                        return await interaction.reply({ embeds: [embed] })
                    } else if (type && type === 'user') { // set user autorole
                        if (role.id === currentARUser) {
                            embed.addField('Failed', `The user autorole is already \`@${role.name} (${role.id})\`...\nTry another role`)
                            return await interaction.reply({ embeds: [embed] })
                        }
                        await client.settings.set(interaction.guild.id, 'autorole.user', role.id);
                        embed.addField('Autorole updated', `The user autorole has been set to \`@${role.name} (${role.id})\`\nYou can reset it with \`/settings autorole user reset\``)
                        return await interaction.reply({ embeds: [embed] })
                    } else { // set both autoroles
                        if (role.id === currentARUser && role.id === currentARBot) {
                            embed.addField('Failed', `The bot autorole is already \`@${role.name} (${role.id})\`...\nTry another role`)
                                .addField('Failed', `The user autorole is already \`@${role.name} (${role.id})\`...\nTry another role`)
                            return await interaction.reply({ embeds: [embed] })
                        }
                        await client.settings.set(interaction.guild.id, 'autorole.bot', role.id);
                        await client.settings.set(interaction.guild.id, 'autorole.user', role.id);
                        embed.addField('Autorole updated', `The bot autorole has been set to \`@${role.name} (${role.id})\`\nYou can reset it with \`/settings autorole bot reset\``)
                            .addField('Autorole updated', `The user autorole has been set to \`@${role.name} (${role.id})\`\nYou can reset it with \`/settings autorole user reset\``)
                        return await interaction.reply({ embeds: [embed] })
                    }
                }
            break;

            case 'votechannel':
                let channel = interaction.options.getChannel('channel');
                let resetVC = interaction.options.getString('reset');
                let currentVC = await client.settings.get(interaction.guild.id, 'vote', false);
                if (!channel && !resetVC) {
                    return await interaction.reply({ embeds: [this.currentVotechannel(client, interaction, embed, currentVC)] })
                }
                if (!channel && resetVC) {
                    if (!currentVC) {
                        embed.addField('Failed', 'There is no votechannel to reset')
                        return await interaction.reply({ embeds: [embed] })
                    }
                    await client.settings.set(interaction.guild.id, 'vote', false);
                    embed.addField('Vote channel reset', 'The vote channel has been reset')
                    return await interaction.reply({ embeds: [embed] })
                }
                if (!channel.isText()) {
                    embed.addField('Failed', 'You can only set the vote channel to a text channel')
                    return await interaction.reply({ embeds: [embed] })
                }
                if (channel.id === currentVC) {
                    embed.addField('Failed', `The vote channel is already \`#${channel.name} (${channel.id})\`...\nTry another channel`)
                    return await interaction.reply({ embeds: [embed] })
                }
                await client.settings.set(interaction.guild.id, 'vote', channel.id);
                embed.addField('Vote channel updated', `The vote channel has been set to \`#${channel.name} (${channel.id})\`\nYou can reset it with \`/settings votechannel reset\``)
                return await interaction.reply({ embeds: [embed] })

            break;

            case 'data':
                let currentData = await client.settings.items.get(interaction.user.id) || [];
                let formatted = client.Util.codeBlock('js', inspect(currentData, { depth: 1 }))
                let clear = interaction.options.getString('clear');
                if (!clear) {
                    embed.setTitle('Your data')
                        .setDescription(formatted)
                    return await interaction.reply({ embeds: [embed] })
                }
                if (currentData.length < 1) {
                    embed.setTitle('Your data')
                        .setDescription('Awesome! You have no data to clear')
                    return await interaction.reply({ embeds: [embed] })
                }
                embed.setTitle('Your data')
                    .setDescription(formatted)
                    .addField('Are you sure?', '⚠️ Are you sure you want to clear your data? This cannot be undone. (Use the buttons below)')
                let cleared = client.util.embed()
                    .setColor(client.misc.color)
                    .setTitle('Your data')
                    .setDescription(`Your data has been cleared!\n${client.Util.codeBlock('js', '[]')}`)
                    .setFooter(`Requested by ${interaction.user.username}`)
                    .setTimestamp()
                await client.buttonConfirmer.start([embed, cleared], interaction, false, this.clearData)
            break;

        }
    },
    async clearData(client, interaction) {
        await client.settings.clear(interaction.user.id)
    },
    currentAntilink(client, embed, current) {
        embed.setTitle(`${client.user.username} antilink settings`)
            .setDescription('You can find information about the antilink below.')
            .addField('Current setting', current === 'on' ? client.emotes.checked : client.emotes.unchecked)
            .addField('Update setting', `\`/settings antilink <on|off>\``)
        return embed;
    },
    currentAutorole(client, interaction, embed, currentBot, currentUser) {
        embed.setTitle(`${client.user.username} autorole settings`)
            .setDescription('You can find information about the autorole below.')
            .addField('Current bot autorole', currentBot ? `${client.emotes.checked} ${interaction.guild.roles.cache.get(currentBot)}` : `${client.emotes.unchecked} None`)
            .addField('Current user autorole', currentUser ? `${client.emotes.checked} ${interaction.guild.roles.cache.get(currentUser)}` : `${client.emotes.unchecked} None`)
            .addField('Update autorole', `\`/settings autorole <@role> <bots|users>\``)
            .addField('Reset autorole', `\`/settings autorole <bots|users> reset\``)
        return embed;
    },
    currentVotechannel(client, interaction, embed, current) {
        embed.setTitle(`${client.user.username} vote channel settings`)
            .setDescription('You can find information about the vote channel below.')
            .addField('Current channel', `${current ? `${client.emotes.checked} ${interaction.guild.channels.cache.get(current)}` : `${client.emotes.unchecked} None`}`)
            .addField('Update channel', `\`/settings votechannel <#channel>\``)
            .addField('Reset channel', `\`/settings votechannel reset\``)
        return embed;
    }
}