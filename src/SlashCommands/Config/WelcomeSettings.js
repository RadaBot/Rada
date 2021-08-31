const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcomesettings')
        .setDescription('Configure the bot\'s welcome module')
        .addSubcommand((subcommand) => subcommand
            .setName('channel')
            .setDescription('Set the channel for join/leave messages to be sent to')
            .addChannelOption((option) => option
                .setName('channel')
                .setDescription('The channel you want the messages to be sent to')
            )
            .addStringOption((option) => option
                .setName('reset')
                .setDescription('Do you want to reset to default?')
                .addChoice('Yes', 'true')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('join')
            .setDescription('The message when a user joins the server')
            .addStringOption((option) => option
                .setName('message')
                .setDescription('What do you want the message to be?')
            )
            .addStringOption((option) => option
                .setName('reset')
                .setDescription('Do you want to reset to default?')
                .addChoice('Yes', 'true')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('leave')
            .setDescription('The message when a user leaves the server')
            .addStringOption((option) => option
                .setName('message')
                .setDescription('What do you want the message to be?')
            )
            .addStringOption((option) => option
                .setName('reset')
                .setDescription('Do you want to reset to default?')
                .addChoice('Yes', 'true')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('placeholders')
            .setDescription('The placeholders that yo ucan use for join/leave messages')
        )
        .addSubcommand((subcommand) => subcommand
            .setName('visualise')
            .setDescription('Visualise your current welcome settings')
        )
        .addSubcommand((subcommand) => subcommand
            .setName('view')
            .setDescription('View your current welcome settings')
        ),
    category: 'Config',
    description: 'Configure the bot\'s welcome module',
    permissions: ['MANAGE_MESSAGES', 'MANAGE_GUILD', 'MANAGE_ROLES'],
    placeholders: [
        '{user} - The mention of the user',
        '{tag} - The user#discrim of the user',
        '{username} - The username of the user',
        '{servername} - The name of the server',
        '{membercount} - Member count of the server'
    ],
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp()
        switch (subcommand) {

            case 'view':
                let currentSettings = [
                    `Channel       ➜ ${client.settings.get(interaction.guild.id, 'ws.channel', 'None') !== 'None' ? `${client.emotes.checked} ${interaction.guild.channels.cache.get(client.settings.get(interaction.guild.id, 'ws.channel'))} \`(${client.settings.get(interaction.guild.id, 'ws.channel')})\`` : client.emotes.unchecked}`,
                    `Join message  ➜ ${client.settings.get(interaction.guild.id, 'ws.join', 'None') !== 'None' ? `> ${client.settings.get(interaction.guild.id, 'ws.join')}` : client.emotes.unchecked}`,
                    `Leave message ➜ ${client.settings.get(interaction.guild.id, 'ws.leave', 'None') !== 'None' ? `> ${client.settings.get(interaction.guild.id, 'ws.leave')}` : client.emotes.unchecked}`
                ]
                embed.setTitle(`${client.user.username} welcome settings`)
                    .addField('Current settings', currentSettings.join('\n'))
                    .addField('Command examples', `\`/welcomesettings channel #welcome-leave\`\n\`/welcomesettings join Hello {user}!\`\n\`/welcomesettings visualise\`\n\`/welcomesettings view\``)
                return await interaction.reply({ embeds: [embed] })

            break;

            case 'channel':
            
                let channel = interaction.options.getChannel('channel');
                let resetWC = interaction.options.getString('reset');
                let currentWC = await client.settings.get(interaction.guild.id, 'ws.channel', null);
                if (!channel && !resetWC) { 
                    embed.setTitle(`Welcome Channel`)
                        .setDescription(`Update the welcome channel with \`/welcomesettings channel #channel\``)
                        .addField('Current channel', `${client.settings.get(interaction.guild.id, 'ws.channel', null) ? `${client.emotes.checked} ${interaction.guild.channels.cache.get(client.settings.get(interaction.guild.id, 'ws.channel'))} \`(${client.settings.get(interaction.guild.id, 'ws.channel')})\`` : client.emotes.unchecked}`);
                    return await interaction.reply({ embeds: [embed] })
                }
                if (!channel && resetWC) {
                    if (!currentWC) {
                        embed.addField('Failed', 'There is no welcome channel to reset')
                        return await interaction.reply({ embeds: [embed] })
                    }
                    await client.settings.set(interaction.guild.id, 'ws.channel', null);
                    embed.addField('Welcome channel reset', 'The welcome channel has been reset')
                    return await interaction.reply({ embeds: [embed] })
                }
                if (!channel.isText()) {
                    embed.addField('Failed', 'You can only set the welcome channel to a text channel')
                    return await interaction.reply({ embeds: [embed] })
                }
                if (channel.id === currentWC) {
                    embed.addField('Failed', `The welcome channel is already \`#${channel.name} (${channel.id})\`...\nTry another channel`)
                    return await interaction.reply({ embeds: [embed] })
                }
                await client.settings.set(interaction.guild.id, 'ws.channel', channel.id);
                embed.addField('Welcome channel updated', `The welcome channel has been set to \`#${channel.name} (${channel.id})\`\nYou can reset it with \`/welcomesettings channel reset\``)
                return await interaction.reply({ embeds: [embed] })

            break;

            case 'placeholders':
                embed.setTitle('Placeholders')
                    .setDescription(this.placeholders.join('\n'))
                return await interaction.reply({ embeds: [embed] })
            break;

            case 'join':
                let join = interaction.options.getString('message');
                let resetJM = interaction.options.getString('reset');
                let currentJM = await client.settings.get(interaction.guild.id, 'ws.join', null);
                if (!join && !resetJM) {
                    embed.setTitle('Join Message')
                        .setDescription(`Update the join message with \`/welcomesettings join <message>\``)
                        .addField('Current message', `${client.settings.get(interaction.guild.id, 'ws.join', null) !== null ? `> ${client.settings.get(interaction.guild.id, 'ws.join')}` : client.emotes.unchecked}`)
                    return await interaction.reply({ embeds: [embed] })
                }
                if (!join && resetJM) {
                    if (!currentJM) {
                        embed.addField('Failed', 'There is no join message to reset')
                        return await interaction.reply({ embeds: [embed] })
                    }
                    await client.settings.set(interaction.guild.id, 'ws.join', null);
                    embed.addField('Join message reset', 'Your join message has been reset')
                    return await interaction.reply({ embeds: [embed] })
                }
                await client.settings.set(interaction.guild.id, 'ws.join', join);
                embed.addField('Join message updated', `Your join message has been updated to:\n${client.Util.codeBlock('', join)}`)
                return await interaction.reply({ embeds: [embed] })
            break;

            case 'leave':
                let leave = interaction.options.getString('message');
                let resetLM = interaction.options.getString('reset');
                let currentLM = await client.settings.get(interaction.guild.id, 'ws.leave', null);
                if (!leave && !resetLM) {
                    embed.setTitle('Leave Message')
                        .setDescription(`Update the leave message with \`/welcomesettings leave <message>\``)
                        .addField('Current message', `${client.settings.get(interaction.guild.id, 'ws.leave', null) !== null ? `> ${client.settings.get(interaction.guild.id, 'ws.join')}` : client.emotes.unchecked}`)
                    return await interaction.reply({ embeds: [embed] })
                }
                if (!leave && resetLM) {
                    if (!currentLM) {
                        embed.addField('Failed', 'There is no leave message to reset')
                        return await interaction.reply({ embeds: [embed] })
                    }
                    await client.settings.set(interaction.guild.id, 'ws.leave', null);
                    embed.addField('Leave message reset', 'Your leave message has been reset')
                    return await interaction.reply({ embeds: [embed] })
                }
                await client.settings.set(interaction.guild.id, 'ws.leave', leave);
                embed.addField('Leave message updated', `Your leave message has been updated to:\n${client.Util.codeBlock('', leave)}`)
                return await interaction.reply({ embeds: [embed] })
            break;

            case 'visualise':
                if (!client.settings.get(interaction.guild.id, 'ws.leave', null) && !client.settings.get(interaction.guild.id, 'ws.join', null)) {
                    embed.addField('Failed', 'You have no join/leave messages to visualise')
                    return await interaction.reply({ embeds: [embed] })
                }
                let visualised = [
                    `**Join message**:\n${client.settings.get(interaction.guild.id, 'ws.join') ? client.settings.get(interaction.guild.id, 'ws.join').replace(/{user}/gi, interaction.user.toString()).replace(/{tag}/gi, interaction.user.tag).replace(/{username}/gi, interaction.user.username).replace(/{servername}/gi, interaction.guild.name).replace(/{membercount}/gi, interaction.guild.memberCount) : 'Not set'}`,
                    `**Leave message**:\n${client.settings.get(interaction.guild.id, 'ws.leave') ? client.settings.get(interaction.guild.id, 'ws.leave').replace(/{user}/gi, interaction.user.toString()).replace(/{tag}/gi, interaction.user.tag).replace(/{username}/gi, interaction.user.username).replace(/{servername}/gi, interaction.guild.name).replace(/{membercount}/gi, interaction.guild.memberCount) : 'Not set'}`,
                ]
                return await interaction.reply({
                    content: visualised.join('\n')
                })
            break;

        }
    }
}