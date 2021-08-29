const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user')
        .addStringOption((option) => option
            .setName('userid')
            .setDescription('The ID of the user you want to unban')
            .setRequired(true)
        ),
    category: 'Moderation',
    description: 'Unban a user',
    permissions: ['BAN_MEMBERS'],
    async execute(interaction, client) {
        let userId = interaction.options.getString('userid');
        try {
            let fetched = await client.users.fetch(userId);
            let user = client.users.cache.get(fetched.id);
            const bans = await interaction.guild.bans.fetch();
            if (!bans.has(user.id)) {
                return await interaction.reply({
                    content: 'That user is not banned',
                    ephemeral: true
                })
            }
            interaction.guild.members.unban(user.id)
            .then(async(member) => {
                return await interaction.reply({
                    embeds: [
                        client.util.embed()
                        .setColor(client.misc.color)
                        .setTitle('Unban')
                        .setDescription(`${client.emotes.success} \`${member.tag}\` has been unbanned`)
                    ]
                })
            })
            .catch(async(e) => {
                return await interaction.reply({
                    embeds: [
                        client.util.embed()
                        .setColor(client.misc.color)
                        .setTitle('Failed to unban')
                        .setDescription(`\`${e.message}\``)
                    ],
                    ephemeral: true
                })
            })
        } catch (e) {
            return await interaction.reply({
                content: `A user with the id of \`${userId}\` was not found`,
                ephemeral: true
            })
        }
    }
}