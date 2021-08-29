const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { readdirSync, statSync } = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

class SlashHandler {
    constructor(client, {
        directory
    }) {
        this.client = client;
        this.commands = [];
        this.directory = directory;
    }

    async init() {
        await this.loadCommands();
        this.client.classLoader.push('[ClassLoader] SlashHandler loaded');
    }
    formatCommands() {
        let formatted = [];
        const categories = readdirSync(this.directory);
        for (const category of categories) {
            let commands = this.getCommands(path.join(this.directory, category));
            let commandData = [];
            for (const command of commands) {
                let data = require(`${process.cwd()}\\${command}`)
                commandData.push({
                    name: data.data.name,
                    description: data.description,
                    permissions: data.permissions || [],
                    ownerOnly: data.ownerOnly || false
                })
            }
            formatted.push({ category: category, commands: commandData });
        }
        return formatted;
    }
    getCommands(directory) {
        const results = [];

        (function read(dir) {
            const files = readdirSync(dir);
            for (const file of files) {
                const filepath = path.join(dir, file);
                if (statSync(filepath).isDirectory()) {
                    read(filepath);
                } else {
                    results.push(filepath);
                }
            }
        }(directory));
        return results;
    }
    async loadCommands() {
        let files = this.getCommands(this.directory);
        for (let file of files) {
            const command = require(`${process.cwd()}\\${file}`);
            this.commands.push(command.data.toJSON());
            this.client.slashCommands.set(command.data.name, command);
        }
        this.client.guilds.cache.forEach(async(guild) => {
            try {
                // await rest.put(Routes.applicationCommands(this.client.user.id), {
                await rest.put(Routes.applicationGuildCommands(this.client.user.id, '770757172341506061'), {
                    body: this.commands
                });
            } catch (error) {
                this.client.logger.error([
                    `Loading slash commands for ${chalk.underline(guild.name)} failed`,
                    `Type:   ${error.name}`,
                    `Error:  ${error.message}`
                ]);
            }
        })
    }
}

module.exports = SlashHandler;