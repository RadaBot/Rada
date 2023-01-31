const { SlashCommandBuilder } = require('@discordjs/builders');
const { channels: { emotes, types } } = require('../../../lib/util/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Channel management command')
        .addSubcommand((subcommand) => subcommand
            .setName('create')
            .setDescription('Create a channel')
            .addStringOption((option) => option
                .setName('name')
                .setDescription('The name of the channel you want to create')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('type')
                .setDescription('The type of the channel you want to create')
                .addChoices(
                    { name: 'Text', value: 'GUILD_TEXT' },
                    { name: 'Voice', value: 'GUILD_VOICE' },
                    { name: 'Category', value: 'GUILD_CATEGORY' },
                    { name: 'Stage', value: 'GUILD_STAGE_VOICE' },
                    { name: 'News', value: 'GUILD_NEWS' },
                )
                .setRequired(true)
            )
            .addChannelOption((option) => option
                .setName('category')
                .setDescription('The category you want to put the channel in')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('delete')
            .setDescription('Delete a channel')
            .addChannelOption((option) => option
                .setName('channel')
                .setDescription('The channel you want to delete')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('edit')
            .setDescription('Edit a channel')
            .addChannelOption((option) => option
                .setName('channel')
                .setDescription('The channel you want to edit')
                .setRequired(true)
            )
            // .addStringOption((option) => option
            //     .setName('type')
            //     .setDescription('The type of edit you want')
            //     .addChoice('name', 'name')
            //     .setRequired(true)
            // )
            .addStringOption((option) => option
                .setName('new-name')
                .setDescription('This is if you want to edit the name')
            )
            .addChannelOption((option) => option
                .setName('new-category')
                .setDescription('This is if you want to edit the category')
            )
        ),
    category: 'Utility',
    description: 'Channel management command',
    permissions: ['MANAGE_CHANNELS'],
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        switch (subcommand) {

            case 'create':
                let channelName = interaction.options.getString('name')
                let channelType = interaction.options.getString('type')
                let category = channelType === 'GUILD_CATEGORY' ? null : interaction.options.getChannel('category')
                category = category?.type === 'GUILD_CATEGORY' ? category : null;
                try {
                    interaction.guild.channels.create(channelName, {
                        type: channelType,
                        parent: category,
                        reason: `Channel created by ${interaction.user.username}`
                    }).then(async(channel) => {
                        return await interaction.reply({
                            content: `The ${emotes[channelType]} ${types[channelType]} ${channelType !== 'GUILD_CATEGORY' ? channel.toString() : `__${channel.name}__`} has been created`
                        })
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    }) 
                }
            break;

            case 'delete':
                let channel = interaction.options.getChannel('channel');
                try {
                    await channel.delete(`Channel deleted by ${interaction.user.username}`);
                    return await interaction.reply({
                        content: `The ${emotes[channel.type]} ${types[channel.type]} __${channel.name}__ has been deleted`
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    }) 
                }
            break;

            case 'edit':
                let channelToEdit = interaction.options.getChannel('channel');
                let newName = interaction.options.getString('new-name') ?? channelToEdit.name;
                if (channelToEdit.type === 'GUILD_CATEGORY' && interaction.options.getChannel('new-category')) {
                    return await interaction.reply({
                        content: 'You cannot change the category of a category.',
                        ephemeral: true
                    })   
                }
                let newCategory = interaction.options.getChannel('new-category');
                if (newName === channelToEdit.name && newCategory === channelToEdit.parent) {
                    return await interaction.reply({
                        content: 'You must change either the channel name or category.',
                        ephemeral: true
                    })
                }
                let oldName = channelToEdit.name;
                let oldCategory = channelToEdit.parent;
                try {
                    await channelToEdit.edit({
                        name: newName,
                        parent: newCategory
                    }, `Channel edited by ${interaction.user.username}`)
                    .then(async(channel) => {
                        return await interaction.reply({
                            content: `The ${emotes[channel.type]} ${types[channel.type]} __${channel.name}__ has been edited${newName && newName !== oldName ? `\n    • Name: \`${oldName}\` ➜ \`${newName}\`` : ''}${newCategory && newCategory !== oldCategory ? `\n    • Category: \`${oldCategory.name}\` ➜ \`${newCategory.name}\`` : ''}`
                        })
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    }) 
                }
            break;
        }
    }
};