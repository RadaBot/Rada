const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hackban')
        .setDescription('Ban a user outside of the server')
        .addStringOption((option) => option
            .setName('userid')
            .setDescription('The ID of the user you want to force ban')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('reason')
            .setDescription('Optional kick reason')
        ),
    category: 'Moderation',
    description: 'Ban a user outside of the server',
    permissions: ['BAN_MEMBERS'],
    async execute(interaction, client) {
        let userId = interaction.options.getString('userid');
        let reason = interaction.options.getString('reason') || 'Not provided';
        try {
            let fetched = await client.users.fetch(userId);
            let user = client.users.cache.get(fetched.id);
            const bans = await interaction.guild.bans.fetch();
            if (interaction.guild.members.cache.has(user.id)) {
                return await interaction.reply({
                    content: `That user is already in the server.\nInstead you can use \`/ban @${user.tag}\``,
                    ephemeral: true
                })
            }
            if (bans.has(user.id)) {
                return await interaction.reply({
                    content: 'That user is already banned',
                    ephemeral: true
                })
            }
            interaction.guild.members.ban(user.id, {
                reason: `Hackbanned by: ${interaction.user.tag} - Reason: ${reason}`
            })
            .then(async(member) => {
                return await interaction.reply({
                    embeds: [
                        client.util.embed()
                        .setColor(client.misc.color)
                        .setTitle('Hackban')
                        .setDescription(`${client.emotes.success} \`${member.tag}\` has been hackbanned`)
                        .addField('Reason', reason)
                    ]
                })
            })
            .catch(async(e) => {
                return await interaction.reply({
                    embeds: [
                        client.util.embed()
                        .setColor(client.misc.color)
                        .setTitle('Failed to hackban')
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