const Util = require('../../../lib/classes/Util');
const { Listener } = require('discord-akairo');

module.exports = class InteractionListener extends Listener {
    constructor() {
        super('interaction', {
            emitter: 'client',
            event: 'interactionCreate'
        });
    }

    async exec(interaction) {
        if (!interaction.guild) {
            return await interaction.reply({
                content: 'My slash commands can only be used in guilds.'
            })
        }
        if (!interaction.isCommand()) return;

        const command = this.client.slashCommands.get(interaction.commandName);
        if (!command) return;
        if (command.ownerOnly && !this.client.ownerID.some(id => interaction.user.id === id)) {
            return await interaction.reply({
                content: 'Nice try 😅\nThis slash command is owner only.',
                ephemeral: true
            });
        }
        if (command.permissions && command.permissions.length > 0 && command.permissions.some(permission => !interaction.member.permissions.has(permission))) {
            return await interaction.reply({
                content: 'You don\'t have the correct permissions to run this command.',
                ephemeral: true
            });
        }
        if (command.permissions && command.permissions.length > 0 && command.permissions.some(permission => !interaction.guild.me.permissions.has(permission))) {
            return await interaction.reply({
                content: `I don\'t have the correct permissions to run this command. I need:\n${command.permissions.map(perm => this.client.Util.toTitleCase(perm.split(/_/g).join(' '))).join(', ')}`,
                ephemeral: true
            });
        }
        try {
            await command.execute(interaction, this.client);
        } catch (error) {
            this.client.logger.error(error.stack.split('\n'));
            await interaction.reply({
                content: `There was an error executing this command:\n${Util.inlineCode(error.message)}`,
                ephemeral: true
            });
        }
    }
}