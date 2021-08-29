const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fetchuser')
        .setDescription('Fetch a user by ID and show info about them')
        .addStringOption((option) => option
            .setName('userid')
            .setDescription('The ID of the user you want to fetch')
            .setRequired(true)
        ),
    category: 'Misc',
    description: 'Fetch a user by ID and show info about them',
    async execute(interaction, client) {
        let placeholders = {
            avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
            bot: 'https://cdn.discordapp.com/emojis/728596296243347486.png?v=1',
            user: 'https://cdn.discordapp.com/emojis/556184052344946689.png?v=1'
        };
        let userId = interaction.options.getString('userid');
        if (!userId) {
            return await interaction.reply({
                content: 'You must provide a user ID.',
                ephemeral: true
            });
        }
        try {
            let fetch = await client.users.fetch(userId, { force: true });
            let user = client.users.cache.get(fetch.id);
            let mutualCount = client.guilds.cache.filter(g => g.members.cache.has(user.id)).map(g => g.name).length;
            let badges = client.displayFlags(user);
            let embed = client.util.embed()
                .setColor(client.misc.color)
                .setURL(user.avatarURL() ? user.avatarURL({ size: 512, dynamic: true }) : placeholders.avatar)
                .setAuthor(`${user.tag}`, user.bot ? placeholders.bot : placeholders.user)
                .setThumbnail(user.avatarURL() ? user.avatarURL({ size: 512, dynamic: true }) : placeholders.avatar)
                .setFooter(interaction.user.username)
                .setTimestamp()
                .addField('ID', `${userId}`)
                .addField('Joined Discord', `${client.timeFormat('dddd d MMMM YYYY', user.createdAt)}`)
                .addField(`Mutual servers with ${client.user.username}`, mutualCount == 0 ? 'No mutual servers' : `Found ${mutualCount} mutual server${mutualCount > 1 ? 's' : ''}`)
            if (badges.length > 0 && badges[0]) {
                embed.addField('Badges', badges.join(" "))
            }
            if (fetch.bannerURL()) {
                embed.setImage(fetch.bannerURL({ dynamic: true, size: 512 }))
            }
            return await interaction.reply({
                embeds: [embed]
            })
        } catch (e) {
            return await interaction.reply({
                content: `**Unable to fetch a user with the id \`${userId}\`** \`(${e.message})\``,
                ephemeral: true
            })
        }
    }
}