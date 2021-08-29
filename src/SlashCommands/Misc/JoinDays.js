const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joindays')
        .setDescription('Joined/created information about a user')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('The user you want join information about.')
        ),
    category: 'Misc',
    description: 'Joined/created information about a user',
    async execute(interaction, client) {
        const placeholder = 'https://cdn.discordapp.com/embed/avatars/0.png'
        let user = interaction.options.getUser('user') ?? interaction.user;
        let member = interaction.guild.members.cache.get(user.id)
        const embed = client.util.embed()
            .setColor(client.misc.color)
            .setThumbnail(user.avatarURL({ dynamic: true, size: 512 }) ?? placeholder)
            .addField(`Member join info: ${user.username}`, `For full member info, run \`/info user ${user.tag}\``)
            .addField(`:inbox_tray: Joined Server`, client.timeFormat('dddd d MMMM YYYY', member.joinedAt), true)
            .addField(`:calendar: Joined Discord`, client.timeFormat('dddd d MMMM YYYY', user.createdAt), true)
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp()
        return await interaction.reply({
            embeds: [embed]
        })
    }
}