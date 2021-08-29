const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the invite link for Rada'),
    category: 'Misc',
    description: 'Get the invite link for Rada',
    async execute(interaction, client) {
        let id = client.user.id
        let invites = {
            admin: `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=8&scope=bot+applications.commands`,
            utility: `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=2081279217&scope=bot+applications.commands`,
            mod: `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=2085481719&scope=bot+applications.commands`,
            default: `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=67488833&scope=bot+applications.commands`
        };
        let embed = client.util.embed()
            .setTitle(`Invite ${client.user.username}`)
            .setColor(client.misc.color)
            .setThumbnail(client.user.avatarURL({ format: 'png', size: 512 }))
            .setFooter(`Requested by ${interaction.user.tag}`)
            .setTimestamp()
            .setDescription([
                "**Admin**\nInvite the bot with full admin perms",
                "**Utility**\nInvite the bot with utility perms (no moderation perms)",
                "**Mod**\nInvite the bot with only mod perms",
                "**Default**\nInvite the bot with perms for basic functionality (no moderation/utility/management perms)",
            ].join('\n'))
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Admin')
                .setStyle('LINK')
                .setURL(invites.admin),
                new MessageButton()
                .setLabel('Utility')
                .setStyle('LINK')
                .setURL(invites.utility),
                new MessageButton()
                .setLabel('Mod')
                .setStyle('LINK')
                .setURL(invites.mod),
                new MessageButton()
                .setLabel('Default')
                .setStyle('LINK')
                .setURL(invites.default)
            )
        return await interaction.reply({
            embeds: [embed],
            components: [row]
        })
    }
}