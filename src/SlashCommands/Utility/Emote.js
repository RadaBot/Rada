const { SlashCommandBuilder } = require('@discordjs/builders');
const req = require('@aero/centra');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emote')
        .setDescription('Emote management command')
        .addSubcommand((subcommand) => subcommand
            .setName('add')
            .setDescription('Add an emote by providing a url')
            .addStringOption((option) => option
                .setName('url')
                .setDescription('The image url of the emote you want to add')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('name')
                .setDescription('The name of the emote you want to add')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('delete')
            .setDescription('Delete an emote')
            .addStringOption((option) => option
                .setName('emote')
                .setDescription('The emote, emote name or emote id you want to delete')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('steal')
            .setDescription('Steal an emote from another server')
            .addStringOption((option) => option
                .setName('emote')
                .setDescription('The emote or emote id you want to steal')
                .setRequired(true)
            )
        ),
    category: 'Utility',
    description: 'Emote management command',
    regex: {
        image: /^http(s)?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg)\??.*$/igm
    },
    permissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        switch (subcommand) {

            case 'add':
                let url = interaction.options.getString('url');
                let name = interaction.options.getString('name');
                if (url.match(this.regex.image) < 1) {
                    return await interaction.reply({
                        content: 'That is not a valid image/gif',
                        ephemeral: true
                    })
                }
                try {
                    let e = await interaction.guild.emojis.create(url, name, {
                        reason: `Emote added by ${interaction.user.username}`
                    })
                    return interaction.reply({
                        content: `The emote ${e} has been added to the server`
                    })
                } catch (e) {
                    if (e.message.includes('ENOENT')) {
                        return await interaction.reply({
                            content: 'Please provide a valid image/gif url',
                            ephemeral: true
                        })
                    }
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    })
                }
            break;

            case 'delete':
                let input = interaction.options.getString('emote');
                let emote = client.Util.resolveEmoji(input, interaction.guild.emojis.cache)
                if (!emote) {
                    return await interaction.reply({
                        content: 'Please provide a valid emote, emote name or emote id',
                        ephemeral: true
                    })
                }
                let emoteName = emote.name;
                try {
                    await emote.delete(`Emote deleted by ${interaction.user.tag}`);
                    return interaction.reply({
                        content: `The emote __${emoteName}__ has been deleted from the server`
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    })
                }
            break;

            case 'steal':
                let stealInput = interaction.options.getString('emote');
                try {
                    let emoji = client.emojis.cache.get(stealInput.split(':').pop().replace(/>/g, ''));
                    let added = await interaction.guild.emojis.create(emoji.url, emoji.name, {
                        reason: `Emote stolen by ${interaction.user.tag}`
                    })
                    return interaction.reply({
                        content: `The emote ${added} has been stolen and added to the server`
                    })
                } catch (e) {
                    let stripped = stealInput.replace(/<a+/g, '').replace(/<+/g, '').replace(/:+/g, '').replace(/>+/g, '').replace(/[0-9]/g, '')
                    let id = stealInput.split(/:+/g).pop().replace(/>+/g, '')
                    let extention = stealInput.startsWith('<a:') ? '.gif' : '.png';
                    const res = await req(`https://cdn.discordapp.com/emojis/${id}${extention}?v=1`, 'GET').send()
                    if (res.statusCode === 404) {
                        return await interaction.reply({
                            content: 'That is not a valid emote',
                            ephemeral: true
                        });
                    }
                    let addedStripped = await interaction.guild.emojis.create(`https://cdn.discordapp.com/emojis/${id}${extention}?v=1`, stripped ? stripped : `emoji_${interaction.guild.emojis.cache.filter(e => !e.animated).size + 1}`, {
                        reason: `Emote stolen by ${interaction.user.tag}`
                    })
                    return interaction.reply({
                        content: `The emote ${addedStripped} has been stolen and added to the server`
                    })
                }
            break;
        }
    }
};