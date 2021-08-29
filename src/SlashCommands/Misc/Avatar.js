const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display someone\'s avatar')
        .addUserOption((option) => option
            .setName('user').setDescription('The user you want the avatar for')
            .setRequired(false)
        ),
    category: 'Misc',
    description: 'Display someone\'s avatar',
    async execute(interaction, client) {
        let user = interaction.options.getUser('user') || interaction.user;
        const placeholder = 'https://cdn.discordapp.com/embed/avatars/1.png'
        let embed = client.util.embed()
            .setTitle(`${user.username}'s avatar`)
            .setColor(client.misc.color)
            .setImage(user.avatarURL() ? user.avatarURL({ dynamic: true, size: 512 }) : placeholder)
        await interaction.reply({
            embeds: [embed]
        });
    },
};