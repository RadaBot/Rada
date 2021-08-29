const { Listener } = require('discord-akairo');
// const { readdirSync } = require('fs');

module.exports = class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        await this.client.slashHandler.init();
        let slashCommands = this.client.slashHandler.getCommands('./src/SlashCommands/');
        this.client.logger.info(this.client.classLoader)
        this.client.logger.info([
            `[ModuleLoader] ${this.client.listenerHandler.modules.size} listeners loaded`,
            `[ModuleLoader] ${this.client.inhibitorHandler.modules.size} inhibitors loaded`,
            `[ModuleLoader] ${slashCommands.length} slash commands loaded`
        ])
        this.client.user.setPresence({
            status: 'online',
            activities: [{
                type: 'WATCHING',
                name: `/help | ${this.client.guilds.cache.size} servers`
            }]
        })
        this.client.clientLoader.push(...[
            `[Gateway]  Connection established to ${this.client.chalk.underline(this.client.ws.gateway)}`,
            `[API]      Connection established to ${this.client.chalk.underline(this.client.options.http.api)}`,
            '[Client]   Presence set',
            `[Client]   Logged in as ClientUser ${this.client.user.tag}`
        ])
        this.client.logger.success(this.client.clientLoader);
    }
}