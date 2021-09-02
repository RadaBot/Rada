const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user breaking the rules')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('The user you want to warn')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('reason')
            .setDescription('Reason for the warn')
            .setRequired(true)
        ),
    category: 'Moderation',
    description: 'Warn a user breaking the rules',
    async execute(interaction, client) {
        let user = interaction.options.getUser('user');
        let reason = interaction.options.getString('reason');
        let fetch = await interaction.guild.members.fetch(user.id, { force: true });
        let member = interaction.guild.members.cache.get(fetch.id);
        if (user.id === interaction.user.id) {
            return await interaction.reply({
                content: 'You can\'t warn yourself',
                ephemeral: true
            });
        }
        if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return await interaction.reply({
                content: 'You can\'t warn users with a higher role than you',
                ephemeral: true
            });
        }
        if (reason.length > 150) {
            return await interaction.reply({
                content: 'Please shorten your warn reason to less than 150 characters',
                ephemeral: true
            });
        }
        const warnCase = {
            user: user.id,
            id: client.Util.generateID(),
            guild_id: interaction.guild.id,
            moderator: `\`${interaction.user.tag} (${interaction.user.id})\``,
            date: new Date(),
            reason: reason
        }
        await client.databaseHandler.addWarning(user, interaction.guild, warnCase);
        return await interaction.reply({
            content: `Warned \`${member.user.tag} (${member.id})\`. The warn ID is \`${warnCase.id}\``
        });
    }
};