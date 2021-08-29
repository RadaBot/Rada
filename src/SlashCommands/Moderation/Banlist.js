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
        let array = [];
        fetched.forEach(ban => {
            let data = {
                user: new Object(ban.user),
                reason: String(ban.reason ?? '⚠ No reason found')
            }
            array.push(data);
        })
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