const { SlashCommandBuilder } = require('@discordjs/builders');
const Util = require('../../../lib/classes/Util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands')
        .addStringOption((option) => option
            .setName('command')
            .setDescription('Get help for a specific command')
        ),
    category: 'Misc',
    description: 'Show all available commands',
    async execute(interaction, client) {
        let embed = client.util.embed()
            .setTitle(`${client.user.username} help`)
            .setColor(client.misc.color)
        let command = interaction.options.getString('command') ? interaction.options.getString('command') : null;
        if (command) {
            let cmd = client.slashCommands.get(command)
            if (!cmd) {
                return await interaction.reply({
                    embeds: [embed.setDescription(`ℹ️ Command __${command}__ not found`)],
                    ephemeral: true
                });
            }
            embed.setDescription(`Help for command **${command}**`)
                .addField('Description', cmd.description)
                .addField('Category', cmd.category)
                .addField('Permissions', cmd.permissions && command.permissions.length > 0 ? Util.inlineCode(cmd.permissions) : 'Default')
                .addField('Owner only', cmd.ownerOnly ? '✅' : '❌')
            return await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
        let firstPage = client.util.embed()
            .setColor(client.misc.color)
            .setTimestamp()
            .setTitle('Help')
            .setDescription('Navigate through the pages using the buttons below')
            .addField('Pages', '\`1\` - This page\n' + client.slashHandler.formatCommands().map((commands, i) => `\`${i + 2}\` - ${commands.category}`).join('\n'))
        let pages = [firstPage];
        for (const category of client.slashHandler.formatCommands()) {
            pages.push(
                client.util.embed()
                .setColor(client.misc.color)
                .setTimestamp()
                .setTitle(`Help - ${category.category}`)
                .setDescription(category.commands.map(command => `\`${command.name}\` - ${command.description}`).join('\n'))
            )
        }
        await client.buttonPaginator.start(pages, interaction);
    }
}