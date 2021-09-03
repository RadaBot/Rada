const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banlist')
        .setDescription('Display the banned members'),
    category: 'Moderation',
    description: 'Display the banned members',
    permissions: ['VIEW_AUDIT_LOG', 'BAN_MEMBERS'],
    placeholder: 'https://cdn.discordapp.com/embed/avatars/1.png',
    async execute(interaction, client) {
        const fetched = await interaction.guild.bans.fetch();
        let mainEmbed = client.util.embed()
            .setColor(client.misc.color)
        let array = [];
        fetched.forEach(ban => {
            let data = {
                user: new Object(ban.user),
                reason: String(ban.reason ?? '⚠ No reason found')
            }
            array.push(data);
        })
        if (array.length < 1) {
            return await interaction.reply({
                content: 'There are no bans in this server',
                ephemeral: true
            });
        }
        if (array.length === 1) {
            mainEmbed.setTitle(`Banned users in ${interaction.guild.name} (1 total)`)
                .addField('Target', `\`${array[0].user.tag} (${array[0].user.id})\``)
                .addField('Reason', `${array[0].reason}`)
                .setThumbnail(array[0].user.avatarURL({ size: 512, dynamic: true }) ?? this.placeholder)
            return await interaction.reply({
                embeds: [mainEmbed]
            });
        }
        const embeds = [];
        for (let i = 0; i < array.length; i++) {
            let embed = client.util.embed()
                .setColor(client.misc.color)
                .setTitle(`Banned users in ${interaction.guild.name} (${array.length} total)`)
                .addField('Target', `\`${array[i].user.tag} (${array[i].user.id})\``)
                .addField('Reason', `${array[i].reason}`)
                .setThumbnail(array[i].user.avatarURL({ size: 512, dynamic: true }) ?? this.placeholder)
            embeds.push(embed);
        }
        await client.buttonPaginator.start(embeds, interaction);
    }
};