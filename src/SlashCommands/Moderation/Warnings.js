const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Warning settings for a user')
        .addSubcommand((subcommand) => subcommand
            .setName('view')
            .setDescription('View a warning or all warnings for a user')
            .addUserOption((option) => option
                .setName('user')
                .setDescription('The user you want to view warnings for')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('id')
                .setDescription('If you want to view a specific warning')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('remove')
            .setDescription('Remove a warning or all warnings from a user')
            .addUserOption((option) => option
                .setName('user')
                .setDescription('The user you want to remove warnings for')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The warning ID you want to remove')
                .setRequired(true)
            )
        ),
    category: 'Moderation',
    description: 'Warning settings for a user',
    async execute(interaction, client) {
        const subcommands = interaction.options.getSubcommand();
        let user = interaction.options.getUser('user');
        let ID = interaction.options.getString('id');
        const key = `${interaction.guild.id}.${user.id}`;
        let current = await client.settings.get(key, 'warnings', []);

        switch(subcommands) {
            
            case 'view':
                if (current.length < 1) {
                    return await interaction.reply({
                        content: `\`${user.tag}\` has no warnings`,
                        ephemeral: true
                    });
                }
                if (!ID) {
                    let embeds = [];
                    let pages = client.buttonPaginator.chunk(current, 5);
                    for (let i = 0; i < pages.length; i ++) {
                        let embed = client.util.embed()
                            .setTitle(`Warnings for ${user.username} (${client.settings.get(key, 'warnings', []).length} total)`)
                            .setColor(client.misc.color)
                            .setThumbnail(user.avatarURL({ size: 512, dynamic: true }))
                            .setDescription(pages[i].map(page => `\`[${page.id}]\` Warned by ${page.moderator} for ${page.reason}`).join('\n'))
                            .setTimestamp()
                        embeds.push(embed);
                    }
                    if (pages.length > 1) {
                        await client.buttonPaginator.start(embeds, interaction)
                    } else {
                        return await interaction.reply({
                            embeds: [embeds[0]]
                        });
                    }                    
                } else {
                    let warning = current.filter(warning => warning.id === ID.toUpperCase())[0];
                    if (!warning) {
                        return await interaction.reply({
                            content: `Warning ID \`${ID}\` was not found`,
                            ephemeral: true
                        });
                    }
                    let embed = client.util.embed()
                        .setTitle('Warning info')
                        .setColor(client.misc.color)
                        .setThumbnail(user.avatarURL({ size: 512, dynamic: true }))
                        .addField('Unique ID', warning.id)
                        .addField('Issued at', warning.date.toString())
                        .addField('Moderator', warning.moderator)
                        .addField('Warn reason', warning.reason)
                        .setFooter(`Requested by ${interaction.user.username}`)
                        .setTimestamp()
                    return await interaction.reply({
                        embeds: [embed]
                    });
                }

            break;

            case 'remove':
                // let fetch = await interaction.guild.members.fetch(user.id, { force: true })
                // let member = interaction.guild.members.cache.get(fetch.id);
                if (!interaction.member.permissions.has('MANAGE_GUILD')) {
                    return await interaction.reply({
                        content: 'You don\'t have permission to clear infractions',
                        ephemeral: true
                    });
                }
                if (user.id === interaction.user.id) {
                    return await interaction.reply({
                        content: 'You can\'t clear your own warnings',
                        ephemeral: true
                    });
                }
                if (current.length < 1) {
                    return await interaction.reply({
                        content: `\`${user.tag}\` has no warnings to clear`,
                        ephemeral: true
                    });
                }
                let filtered = current.filter(warning => warning.id === ID.toUpperCase())[0];
                if (!filtered) {
                    return await interaction.reply({
                        content: `Warning ID \`${ID}\` was not found`,
                        ephemeral: true
                    });
                }
                let removed = current.filter(warning => warning.id !== ID)
                await client.settings.set(key, 'warnings', removed);
                return await interaction.reply({
                    content: `The warning with the ID \`${ID}\` for \`${user.tag}\` has been cleared`
                });
            break;

        }
    }
};