const { SlashCommandBuilder } = require('@discordjs/builders');
const req = require('@aero/centra');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enlarge')
        .setDescription('Enlarge an emote')
        .addStringOption((option) => option
            .setName('emote')
            .setDescription('The emote or emote ID you want to enlarge')
            .setRequired(true)
        ),
    category: 'Misc',
    description: 'Enlarge an emote',
    async execute(interaction, client) {
        let emote = interaction.options.getString('emote');
        try {
            let emoji = client.emojis.cache.get(emote.split(':').pop().replace(/>/g, ''));
            return await interaction.reply({
                files: [emoji.url]
            });
        } catch (e) {
            let id = emote.split(/:+/g).pop().replace(/>+/g, '');
            let extension = emote.startsWith('<a:') ? '.gif' : '.png';
            const res = await req(`https://cdn.discordapp.com/emojis/${id}${extension}?v=1`, 'GET').send()
            if (res.statusCode === 404) {
                return await interaction.reply({
                    content: 'That is not a valid emote',
                    ephemeral: true
                });
            }
            return await interaction.reply({
                files: [`https://cdn.discordapp.com/emojis/${id}${extension}?v=1`]
            });
        }
    }
};