const { SlashCommandBuilder } = require('@discordjs/builders');
const { inspect } = require('util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('data')
        .setDescription('Data we have stored in our database')
        .addSubcommand((subcommand) => subcommand
            .setName('user')
            .setDescription('Your user data')
            .addStringOption((option) => option
                .setName('clear')
                .setDescription('Do you want to clear your data?')
                .addChoices({ name: 'Yes', value: 'true' })
            )
        )
        .addSubcommand((subcommand) => subcommand
        .setName('guild')
        .setDescription('Your guild data')
        .addStringOption((option) => option
            .setName('clear')
            .setDescription('Do you want to clear your data?')
            .addChoices({ name: 'Yes', value: 'true' })
        )
    ),
    category: 'Config',
    description: 'Data we have stored in our database',
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp()
        switch (subcommand) {

            case 'user':
                let currentData = await client.settings.items.get(interaction.user.id) || [];
                let formatted = client.Util.codeBlock('js', inspect(currentData, {
                    depth: 2,
                    maxStringLength: 150
                }))
                let clear = interaction.options.getString('clear');
                if (!clear) {
                    embed.setTitle('Your data')
                        .setDescription(formatted)
                    return await interaction.reply({ embeds: [embed] })
                }
                if (currentData.length < 1) {
                    embed.setTitle('Your data')
                        .setDescription('Awesome! You have no data to clear')
                    return await interaction.reply({ embeds: [embed] })
                }
                embed.setTitle('Your data')
                    .setDescription(formatted)
                    .addField('Are you sure?', '⚠️ Are you sure you want to clear your data? This cannot be undone. (Use the buttons below)')
                let cleared = client.util.embed()
                    .setColor(client.misc.color)
                    .setTitle('Your data')
                    .setDescription(`Your data has been cleared!\n${client.Util.codeBlock('js', '[]')}`)
                    .setFooter(`Requested by ${interaction.user.username}`)
                    .setTimestamp()
                await client.buttonConfirmer.start([embed, cleared], interaction, false, this.clearData)
            break;

            case 'guild':
                let currentGuildData = await client.databaseHandler.getAllGuildData(interaction.guild.id) || [];
                let guildFormatted = client.Util.codeBlock('js', inspect(currentGuildData, {
                    depth: 2,
                    maxStringLength: 150
                }))
                let clearG = interaction.options.getString('clear');
                if (interaction.user.id !== interaction.guild.ownerId) {
                    embed.setTitle('Error')
                        .setDescription('Only the server owner can manage guild data')
                    return await interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                }
                if (!clearG) {
                    embed.setTitle('Your guild data')
                        .setDescription(guildFormatted)
                    return await interaction.reply({ embeds: [embed] })
                }
                if (currentGuildData.length < 1) {
                    embed.setTitle('Your guild data')
                        .setDescription('Awesome! You have no guild data to clear')
                    return await interaction.reply({ embeds: [embed] })
                }
                embed.setTitle('Your guild data')
                    .setDescription(guildFormatted)
                    .addField('Are you sure?', '⚠️ Are you sure you want to clear your guild data? This cannot be undone. (Use the buttons below)')
                let clearedG = client.util.embed()
                    .setColor(client.misc.color)
                    .setTitle('Your guild data')
                    .setDescription(`Your guild data has been cleared!\n${client.Util.codeBlock('js', '[]')}`)
                    .setFooter(`Requested by ${interaction.user.username}`)
                    .setTimestamp()
                await client.buttonConfirmer.start([embed, clearedG], interaction, false, this.clearGuildData)
            break;

        }
    },
    async clearUserData(client, interaction) {
        await client.settings.clear(interaction.user.id)
    },
    async clearGuildData(client, interaction) {
        await client.settings.clear(interaction.guild.id)
        await client.databaseHandler.clearGuildWarnings(interaction.guild.id);
    }
}