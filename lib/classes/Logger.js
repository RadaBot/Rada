const chalk = require('chalk');

class Logger {

    constructor(client) {
        this.config = {
            emojis: {
                0: '',
                1: '✅',
                2: '⛔',
                3: '💡',
                4: '⚠️ ',
                5: 'ℹ️'
            },
            colour: {
                0: chalk.bold.white,
                1: chalk.bold.green,
                2: chalk.bold.red,
                3: chalk.bold.blueBright,
                4: chalk.bold.yellow,
                5: chalk.bold.white
            }
        }
        this.client = client;
    }

    init() {
        this.client.classLoader.push('[ClassLoader] Logger loaded');
    }

    format(type, message) {
        return [
            this.config.colour[type]('┌─────────────────────────────────────────────────────────────────────────────────────────────'),
            this.config.colour[type](`│ ${this.config.emojis[type]} ${this.client.formatDate(new Date())}`),
            this.config.colour[type]('├─────────────────────────────────────────────────────────────────────────────────────────────'),
            typeof message === 'object' ?
            message.map(m => this.config.colour[type](`│ ${m}`)).join('\n') :
            this.config.colour[type](`│ ${message}`),
            this.config.colour[type]('└─────────────────────────────────────────────────────────────────────────────────────────────')
        ].join('\n')
    }

    log = () => {
        console.log(this.format(0, message))
    }
    success = (message) => {
        console.log(this.format(1, message))
    }
    error = (message) => {
        console.log(this.format(2, message))
    }
    info = (message) => {
        console.log(this.format(3, message))
    }
    warn = (message) => {
        console.log(this.format(4, message))
    }
    debug = (message) => {
        console.log(this.format(5, message))
    }
}

module.exports = Logger;