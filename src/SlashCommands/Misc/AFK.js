const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set yourself as afk')
        .addStringOption((option) => option
            .setName('reason')
            .setDescription('The reason you are afk')
        ),
    category: 'Misc',
    description: 'Set yourself as afk',
    placeholder: 'https://cdn.discordapp.com/embed/avatars/1.png',
    async execute(interaction, client) {
        let reason = interaction.options.getString('reason') || 'n/a';
        let current = await client.settings.get(interaction.user.id, 'afk', { afk: false, message: null, started: null });
        if (!current.afk) {
            await client.settings.set(interaction.user.id, 'afk', { afk: true, message: reason, started: new Date() });
            let embed = client.util.embed()
                .setAuthor(`AFK ➜ ${interaction.user.username}`, interaction.user.avatarURL({ dynamic: true }) ?? this.placeholder)
                .setDescription(`You are now set as afk with the reason:\n> **${reason}**\nYour AFK status will be cleared when you next speak.`)
                .setColor(client.misc.color)
                .setTimestamp()
            await interaction.reply({
                embeds: [embed]
            });
        }
    },
};