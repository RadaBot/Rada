const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');

const Stopwatch = require('../../../lib/classes/Stopwatch');
const Util = require('../../../lib/classes/Util');
const { inspect } = require('util');
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate javascript code')
        .addStringOption((option) => option
            .setName('code')
            .setDescription('The code you want to evaluate.')
            .setRequired(true)
        )
        .addBooleanOption((option) => option
            .setName('async')
            .setDescription('Do you want the execution to be asynchronous?')
        )
        .addBooleanOption((option) => option
            .setName('silent')
            .setDescription('Do you want the execution to be ran silently?')
        )
        .addIntegerOption((option) => option
            .setName('depth')
            .setDescription('The number of times to recurse while formatting an object.')
            .addChoices([
                ['1', 1],
                ['2', 2],
                ['3', 3],
                ['4', 4],
            ]),
        ),
    ownerOnly: true,
    category: 'Owner',
    description: 'Evaluate javascript code',
    async execute(interaction, client) {
        let async = interaction.options.getBoolean('async') ? interaction.options.getBoolean('async') : false;
        let silent = interaction.options.getBoolean('silent') ? interaction.options.getBoolean('silent') : false;
        let depth = interaction.options.getInteger('depth') ? interaction.options.getInteger('depth') : 0;
        let code = interaction.options.getString('code');
        const { success, result, time } = await this.eval(code, async, depth, client, interaction);
        const output = success ? `**Output**:${Util.codeBlock('js', result)}\n${time}` : `**Error**:${Util.codeBlock('js', result)}\n${time}`
        if (silent) {
            await interaction.deferReply();
            return await interaction.deleteReply();
        }
        if (output.length > 2000) {
            if (interaction.guild && interaction.guild.me.permissions.has('ATTACH_FILES')) {
                return await interaction.reply({
                    content: `Output was too long... sent the result as a file.\n${time}`,
                    files: [new MessageAttachment(Buffer.from(result), 'output.txt')]
                })
            }
            console.log(result);
            return await interaction.reply({
                content: `Output was too long... sent the result to console.\n${time}`
            })
        }
        return await interaction.reply({
            content: result.includes(this.client.token) ? output + '\n\n⚠️ This message has been made ephemeral due to the eval result including your client token' : output,
            ephemeral: result.includes(this.client.token) ? true : false
        })
    },
    async eval(code, async, depth, client, interaction) {
        this.client = client;
        this.interaction = interaction;
        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        const stopwatch = new Stopwatch();
        let success, syncTime, asyncTime, result;
        let thenable = false;
        try {
            if (async) code = `(async () => {\n${code}\n})();`;
            result = eval(code);
            syncTime = stopwatch.toString();
            if (Util.isThenable(result)) {
                thenable = true;
                stopwatch.restart();
                result = await result;
                asyncTime = stopwatch.toString();
            }
            success = true;
        } catch (error) {
            if (!syncTime) syncTime = stopwatch.toString();
            if (thenable && !asyncTime) asyncTime = stopwatch.toString();
            result = error;
            success = false;
        }
        stopwatch.stop();
        if (typeof result !== 'string') {
            result = inspect(result, {
                depth: depth ? parseInt(depth) || 0 : 0,
                showHidden: false
            });
        }
        return { success, time: this.formatTime(syncTime, asyncTime), result: result };
    },
    formatTime(syncTime, asyncTime) {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    },
};