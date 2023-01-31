const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Display the advertising history (antilink) of a user')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('The user you want to get advertising history for')
        )
        .addStringOption((option) => option
            .setName('clear')
            .setDescription('Do you want to clear the advertising history?')
            .addChoices({ name: 'Yes', value: 'true' })
        ),
    category: 'Moderation',
    description: 'Display the advertising history (antilink) of a user',
    async execute(interaction, client) {
        let user = interaction.options.getUser('user') ?? interaction.user;
        let clear = interaction.options.getString('clear');
        const key = `${interaction.guild.id}.${user.id}`;
        let fetch = await interaction.guild.members.fetch(user.id, { force: true });
        let fetchSelf = await interaction.guild.members.fetch(interaction.user.id, { force: true });
        let member = interaction.guild.members.cache.get(fetch.id);
        let selfMember = interaction.guild.members.cache.get(fetchSelf.id);
        if (clear) {
            if (!selfMember.permissions.has('MANAGE_MESSAGES')) {
                return await interaction.reply({
                    content: 'You don\'t have permission to clear advertising history.',
                    ephemeral: true
                });
            }
            if (client.settings.get(key, 'history', 0) === 0) {
                return await interaction.reply({
                    content: `\`${user.tag}\` has no history to clear`,
                    ephemeral: true
                });
            }
            await client.settings.set(key, 'history', 0);
            return await interaction.reply({
                content: `The advertising history for \`${member.user.tag}\` has been reset`
            });
        }
        return await interaction.reply({
            embeds: [this.display(client, member, key)]
        });
    },
    display(client, member, key) {
        let history = client.settings.get(key, 'history', 0);
        let days = client.daysBetween(member.joinedAt);
        let embed = client.util.embed()
            .setTitle(`Advertisement history for ${member.user.username}`)
            .setColor(client.misc.color)
            .setThumbnail(member.user.avatarURL({ size: 512, dynamic: true }))
            .setDescription(`📝 \`${member.user.tag}\` has sent ${history === 0 ? 'no ads!' : `a total of \`${history}\` ads since joining (**${days !== 0 ? days : ''}${days === 1 ? ' day ago' : days === 0 ? 'today' : ' days ago'}**)`}`)
            .setTimestamp()
        return embed;
    }
};