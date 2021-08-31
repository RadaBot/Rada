const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user in the server')
        .addUserOption((option) => option
            .setName('user')
            .setDescription('The user to unmute')
            .setRequired(true)
        ),
    category: 'Moderation',
    description: 'Mute a user in the server',
    async execute(interaction, client) {
        let user = interaction.options.getUser('user');
        let muteRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('muted'))??
        client.settings.get(interaction.guild.id, 'muterole', null);
        // if (!muteRole) {
        //     return await interaction.reply({
        //         content: 'There doesn\'t seem to be a muted role in this server',
        //         ephemeral: true
        //     });
        // }
        if (user.id === interaction.user.id) {
            return await interaction.reply({
                content: `You can\'t unmute yourself... ${user.id === interaction.guild.ownerId ? 
                    'But you\'re the server owner so you can just remove the role manually smh' : 
                    'how did you even get here?'}`,
                ephemeral: true
            });
        }
        let fetched = await interaction.guild.members.fetch(user.id, { force: true });
        let member = interaction.guild.members.cache.get(fetched.id);
        if (muteRole && interaction.guild.me.roles.highest.comparePositionTo(muteRole) <= 0) {
            return await interaction.reply({
                content: 'The mute role must be lower than my role',
                ephemeral: true
            });
        }
        if (muteRole && !member.roles.cache.has(muteRole.id)) {
            return await interaction.reply({
                content: `\`${member.user.tag} (${member.id})\` is not muted`,
                ephemeral: true
            });
        }
        try {
            await member.roles.remove(muteRole.id, `Unmuted by ${interaction.user.username}`);
            return await interaction.reply({
                content: `\`${member.user.tag} (${member.id})\` has been unmuted`
            });
        } catch (e) {
            return await interaction.reply({
                content: `Failed to unmute \`${member.user.tag} (${member.id})\` - \`${e.message}\``,
                ephemeral: true
            });
        }
    }
};