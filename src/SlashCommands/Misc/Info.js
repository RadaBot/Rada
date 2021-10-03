const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels: { emotes, types, ids } } = require('../../../lib/util/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Show information about things')
        .addSubcommand((subcommand) => subcommand
            .setName('user')
            .setDescription('Information about a user')
            .addUserOption((option) => option
                .setName('user')
                .setDescription('The user you want to get information about')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('server')
            .setDescription('Information about the server')
        )
        .addSubcommand((subcommand) => subcommand
            .setName('role')
            .setDescription('Information about a role')
            .addRoleOption((option) => option
                .setName('role')
                .setDescription('The role you want to get information about')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('channel')
            .setDescription('Information about a channel')
            .addChannelOption((option) => option
                .setName('channel')
                .setDescription('The channel you want to get information about')
            )
        ),
    category: 'Misc',
    description: 'Show information about things',
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        let placeholder = 'https://cdn.discordapp.com/embed/avatars/0.png';
        if (subcommand === 'user') {

            let user = interaction.options.getUser('user') ?? interaction.user;
            let member = interaction.guild.members.cache.get(user.id);
            let userJoinedAt = `${client.timeFormat('dddd d MMMM YYYY', member.joinedAt, true)}`;
            let userCreatedAt = `${client.timeFormat('dddd d MMMM YYYY', member.user.createdAt, true)}`;
            let badges = client.displayFlags(user);
            let aboutMe = client.settings.get(user.id, 'about', false);
            let embed = client.util.embed()
                .setColor(client.misc.color)
                .setTitle(`User Information | \`${user.tag}\``)
                .setThumbnail(user.avatarURL({size:512, dynamic: true}) ?? placeholder)
                .addField(`• Stats`, `Account created on ${userCreatedAt}\nJoined ${interaction.guild.name} on ${userJoinedAt}`)
                .addField(`• Information`, `${member.nickname !== null ? `${client.emotes.checked} Nickname: **${member.nickname}**` : `${client.emotes.unchecked} Nickname: **None**`}\n${member.bannable ? client.emotes.checked : client.emotes.unchecked} Bannable\n${member.kickable ? client.emotes.checked : client.emotes.unchecked} Kickable\n${user.bot ? client.emotes.checked : client.emotes.unchecked} Bot`)
                .addField(`• Highest Role [${member.roles.highest.position}/${interaction.guild.roles.highest.position}]`, `${member.roles.highest} \`[${member.roles.highest.id}]\``)
                .setFooter(`Requested by ${interaction.user.username}`)
                .setTimestamp()
            let fetch = await client.users.fetch(user.id, { force: true });
            if (fetch.bannerURL()) {
                embed.setImage(fetch.bannerURL({ dynamic: true, size: 512 }))
            }
            if (badges.length > 0) {
                embed.addField('Badges', badges.join(''))
            }
            if (aboutMe) {
                embed.addField('About me', `> ${client.Util.trimString(aboutMe.split('\n').join('\n> '), 980)}\n\n*Update your about me [here](https://radabot.net/users/@me)*`)
            }
            return await interaction.reply({
                embeds: [embed]
            })

        } else if (subcommand === 'server') {

            let server = interaction.guild;
            let fetchOwner = await server.members.fetch(server.ownerId)
            let owner = server.members.cache.get(fetchOwner.id);
            let embed = client.util.embed()
                .setColor(client.misc.color)
                .setTitle(`Server information for **${server.name}**`)
                .addField(`• Owner`, `${owner} [${owner.id}]\nAccount created on ${client.timeFormat('dddd d MMMM YYYY', owner.user.createdAt, true)}`)
                .addField(`• Information`, `Guild created on ${client.timeFormat('dddd d MMMM YYYY', server.createdAt, true)}`)
                .addField(`• Details`, `Notifications: **${client.Util.toTitleCase(server.defaultMessageNotifications.split('_').join(' '))}**\nVerification level: **${client.Util.toTitleCase(server.verificationLevel)}**\nExplicit content filter: **${client.Util.toTitleCase(server.explicitContentFilter)}**\nMfa level: **${client.Util.toTitleCase(server.mfaLevel)}**`)
                .addField(`• Boost`, `This guild has ${server.premiumSubscriptionCount > 1 ? `**${server.premiumSubscriptionCount}** boosts.` : 'no boosts'}${server.features.length > 0 ? `\nFeatures: **${server.features.toString().replace(/_/g, ' ').split(',').join(', ').toLowerCase()}**` : ''}${server.splashURL() !== null ? `\nInvite splash: **[View here](${server.splashURL({ size: 1024, format: 'png' })})**` : ''}${server.vanityURLCode !== null ? `Vanity url: https://discord.gg/${server.vanityURLCode}` : ''}`)
                .setFooter(`Requested by ${interaction.user.username}`)
                .setTimestamp()
            if (server.iconURL() !== null) {
                embed.setThumbnail(server.iconURL({ size:512, dynamic: true }))
            }
            if (server.description !== null) {
                embed.setDescription(server.description)
            }
            return await interaction.reply({
                embeds: [embed]
            })

        } else if (subcommand === 'role') {

            let role = interaction.options.getRole('role') ?? interaction.guild.members.cache.get(interaction.user.id).roles.highest;
            let hex = role.hexColor.replace(/#/g, "");
            const data = await client.flipnote.others.color(hex);
            let embed = client.util.embed()
                .setColor(`${role.hexColor !== '#000000' ? role.hexColor : client.misc.color}`)
                .setTitle(`Role info | **${role.name}**`)
                .setDescription(`ID: \`${role.id}\`\nColor: [${data.name}](${data.image})\nHex: \`${role.hexColor}\`\nRole users: \`${role.members.size}\`\nRole position: \`${role.position}/${interaction.guild.roles.highest.position}\`\n${role.mentionable ? client.emotes.checked : client.emotes.unchecked} Mentionable\n${role.hoist ? client.emotes.checked : client.emotes.unchecked} Hoisted\n${role.managed ? client.emotes.checked : client.emotes.unchecked} Managed`)
                .addField('Created', `\`${new Date(role.createdAt).toLocaleString()} | ${client.daysBetween(role.createdAt)} days ago\``)
                .setFooter(`Requested by ${interaction.user.username}`)
                .setTimestamp()
            return await interaction.reply({
                embeds: [embed]
            })
                
        } else if (subcommand === 'channel') {

            let channel = interaction.options.getChannel('channel') ?? interaction.channel;
            let embed = client.util.embed()
                .setColor(client.misc.color)
                .setTitle('Channel info')
                .addField('Created', `\`${new Date(channel.createdAt).toLocaleString()} | ${client.daysBetween(channel.createdAt)} days ago\``)
                .setFooter(`Requested by ${interaction.user.username}`)
                .setTimestamp()
                .setThumbnail(channel.nsfw ? `https://cdn.discordapp.com/emojis/${ids['NSFW']}.png?v=1` : `https://cdn.discordapp.com/emojis/${ids[channel.type]}.png?v=1`)
                .addField('Type', `${emotes[channel.type]} ${types[channel.type]}`)
            switch(channel.type) {
                case 'GUILD_TEXT':
                    embed.setDescription(`Name: \`${channel.name}\`\nID: \`${channel.id}\`\nThreads: \`${channel.threads.cache.size}\`\nCategory: \`${channel.parentId ? channel.guild.channels.cache.get(channel.parentId).name : 'None'}\`\nNSFW: \`${channel.nsfw}\``)
                    .addField('Topic', channel.topic ?? 'None')
                break;
                case 'GUILD_CATEGORY':
                    embed.setDescription(`Name: \`${channel.name}\`\nID: \`${channel.id}\`\nCategory: \`${channel.parentId ? channel.guild.channels.cache.get(channel.parentId).name : 'None'}\``)
                break;
                case 'GUILD_VOICE':
                    embed.setDescription(`Name: \`${channel.name}\`\nID: \`${channel.id}\`\nCategory: \`${channel.parentId ? channel.guild.channels.cache.get(channel.parentId).name : 'None'}\``)
                break;
                case 'GUILD_STAGE_VOICE':
                    embed.setDescription(`Name: \`${channel.name}\`\nID: \`${channel.id}\`\nCategory: \`${channel.parentId ? channel.guild.channels.cache.get(channel.parentId).name : 'None'}\``)
                break;
                case 'GUILD_NEWS':
                    embed.setDescription(`Name: \`${channel.name}\`\nID: \`${channel.id}\`\nThreads: \`${channel.threads.cache.size}\`\nCategory: \`${channel.parentId ? channel.guild.channels.cache.get(channel.parentId).name : 'None'}\`\nNSFW: \`${channel.nsfw}\``)
                    .addField('Topic', channel.topic ?? 'None')
                break;
            }
            return await interaction.reply({
                embeds: [embed]
            })

        }
    }
};