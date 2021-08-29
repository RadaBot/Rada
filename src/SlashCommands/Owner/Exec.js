const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const Util = require('../../../lib/classes/Util');
const { execSync } = require('child_process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exec')
        .setDescription('Execute shell commands.')
        .addStringOption((option) => option
            .setName('command')
            .setDescription('The command you want to execute')
            .setRequired(true)
        ),
    ownerOnly: true,
    category: 'Owner',
    description: 'Execute shell commands',
    async execute(interaction) {
        let command = interaction.options.getString('command');
        try {
            let executed = await execSync(command).toString();
            if (executed == '') {
                return await interaction.reply({
                    content: Util.codeBlock('prolog', `$ ${command}\n\nExecuted successfully: No further message to display`)
                })
            }

            if (executed.length > 2000) {
                if (interaction.guild && interaction.guild.me.permissions.has('ATTACH_FILES')) {
                    return await interaction.reply({
                        content: 'Output was too long... sent the result as a file.',
                        files: [new MessageAttachment(Buffer.from(executed), 'output.txt')]
                    })
                }
                console.log(result);
                return await interaction.reply({
                    content: 'Output was too long... sent the result to console.'
                })
            }
            return await interaction.reply({
                content: Util.codeBlock('prolog', `$ ${command}\n\n${executed}`)
            })
        } catch (e) {
            return await interaction.reply({
                content: Util.codeBlock('prolog', `$ ${command}\n\n${e.message}`)
            })
        }
    }
}