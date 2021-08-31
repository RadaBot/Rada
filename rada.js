const {
    AkairoClient,
    CommandHandler,
    ListenerHandler,
    InhibitorHandler,
    MongooseProvider
    // } = require('discord-akairo');
} = require('discord-akairo');
const { Intents, Collection } = require('discord.js');
const { Timestamp } = require('@skyra/timestamp');
const Flipnote = require('alexflipnote.js');
const beautify = require('js-beautify').js;
const google = require('google-it');
const chalk = require('chalk');

const database = require('./src/handlers/DatabaseModal');
const Logger = require('./lib/classes/Logger');
const Util = require('./lib/classes/Util');
const config = require('./src/config');
const ButtonPaginator = require('./lib/classes/ButtonPaginator');
const ButtonConfirmer = require('./lib/classes/ButtonConfirmer');
const DatabaseHandler = require('./src/handlers/DatabaseHandler');
const RadaScheduler = require('./lib/modules/RadaScheduler');
const SlashHandler = require('./src/handlers/SlashHandler');
const { emotes, clientColor, badges } = require('./lib/util/constants');


require('dotenv').config();

class RadaClient extends AkairoClient {
    constructor() {
        super({
            ownerID: ['286509757546758156'],
        }, {
            fetchAllMembers: false,
            allowedMentions: {
                repliedUser: true,
                parse: [
                    'users',
                    'roles'
                ]
            },
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
            ],
        });
        this.misc = {
            color: clientColor
        }
        this.classLoader = [];
        this.clientLoader = [];
        this.emotes = emotes;
        this.reminders = {
            current: [],
            old: []
        };
        this.logger = new Logger(this);
        this.RadaReminder = new RadaScheduler(this);
        this.settings = new MongooseProvider(database);
        this.databaseHandler = new DatabaseHandler(this);
        this.buttonPaginator = new ButtonPaginator(this);
        this.buttonConfirmer = new ButtonConfirmer(this);
        this.beautify = beautify
        this.chalk = chalk;
        this.Util = Util;
        this.flipnote = new Flipnote(process.env.FLIPNOTE);
        this.slashCommands = new Collection();
        this.slashHandler = new SlashHandler(this, {
            directory: './src/SlashCommands/'
        });
        this.commandHandler = new CommandHandler(this, {
            directory: './src/Commands/',
            prefix: (message) => {
                if (message.guild) {
                    return this.settings.get(message.guild.id, 'prefix', config.production ? config.prefix : config.devPrefix)
                }
                return config.production ? config.prefix : config.devPrefix;
            },
            ignoreCooldown: [],
            blockBots: true,
            allowMention: true,
            handleEdits: true,
            commandUtil: true
        });
        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: './src/inhibitors/'
        });
        this.listenerHandler = new ListenerHandler(this, {
            directory: './src/listeners/'
        });
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.loadAll();
        this.inhibitorHandler.loadAll();
        this.commandHandler.loadAll();
    }
    async login(token) {
        await this.logger.init();
        await this.settings.init();
        this.clientLoader.push(`[Database] Connection established to ${this.chalk.underline(config.mongooseUrl)}`)
        await this.buttonPaginator.init();
        await super.login(token);
    }

    async search(query, results) {
        return await google({ 'query': query, 'no-display': true, 'limit': results });
    }

    convertTemp(temp, unit) {
        return unit.toLowerCase() === 'f' ?
            Number((temp * 9 / 5 + 32).toFixed(1)) :
            Number(((temp - 32) * 5 / 9).toFixed(1))
    }

    daysBetween(startDate, endDate = new Date()) {
        let timeDiff = endDate.getTime() - startDate.getTime()
        let daysDiff = timeDiff / (1000 * 3600 * 24)
        return daysDiff.toFixed(0);
    }

    displayFlags(user, emojify = true) {
        let badgeArray = [];
        try { user.flags.toArray(); } catch (e) { return []; }
        let flags = user.flags.toArray();
        for (const flag of flags) {
            badgeArray.push(badges[flag])
        }
        if (user.avatarURL() && ['.gif', '.webm'].some(type => user.avatarURL({ dynamic: true }).endsWith(type))) {
            badgeArray.push(badges['NITRO']);
        }
        if (!emojify) {
            if (user.avatarURL() && ['.gif', '.webm'].some(type => user.avatarURL({ dynamic: true }).endsWith(type))) {
                flags.push('NITRO');
            }
            return flags;
        }
        return badgeArray;
    }

    timeFormat(ts, date, encased = false) {
        const timestamp = new Timestamp(ts);
        const days = this.daysBetween(date);
        if (encased) {
            return `${timestamp.display(date)} [${days} days ago]`;
        }
        return `${timestamp.display(date)}\n${days} days ago`;
    }

    convertMs(time, song = false) {
        const conversion = (ms) => {
            let d, h, m, s;
            s = Math.floor(ms / 1000);
            m = Math.floor(s / 60);
            s = s % 60;
            h = Math.floor(m / 60);
            m = m % 24;
            d = Math.floor(h / 24);
            h = h % 24;
            return {
                d: d,
                h: h,
                m: m,
                s: s
            };
        };
        let u = conversion(time);
        let uptime;
        let ms_song;
        if (u.s) uptime = `${u.s} second${u.s < 2 ? '' : 's'}`;
        if (u.m) uptime = `${u.m} minute${u.m > 0 && u.m < 2 ? '' : 's'} and ${u.s} second${u.s > 0 && u.s < 2 ? '' : 's'}`;
        if (u.h) uptime = `${u.h} hour${u.h > 0 && u.h < 2 ? '' : 's'}, ${u.m} minute${u.m > 0 && u.m < 2 ? '' : 's'} and ${u.s} second${u.s > 0 && u.s < 2 ? '' : 's'}`;
        if (u.d) uptime = `${u.d} day${u.d > 0 && u.d < 2 ? '' : 's'}, ${u.h} hour${u.h > 0 && u.h < 2 ? '' : 's'}, ${u.m} minute${u.m > 0 && u.m < 2 ? '' : 's'} and ${u.s} second${u.s > 0 && u.s < 2 ? '' : 's'}`;

        if (u.s) ms_song = `00:${u.s < 10 ? '0' + u.s : u.s}`;
        if (u.m) ms_song = `${u.m < 10 ? '0' + u.m : u.m}:${u.s < 10 ? '0' + u.s : u.s}`;
        if (u.h) ms_song = `${u.h < 10 ? '0' + u.h : u.h}:${u.m < 10 ? '0' + u.m : u.m}:${u.s < 10 ? '0' + u.s : u.s}`;
        if (u.d) ms_song = `${u.d < 10 ? '0' + u.d : u.d}:${u.h < 10 ? '0' + u.h : u.h}:${u.m < 10 ? '0' + u.m : u.m}:${u.s < 10 ? '0' + u.s : u.s}`;

        return song ? ms_song : uptime;
    }

    formatDate(date) {
        let formats = {
            days: {
                0: 'Sunday',
                1: 'Monday',
                2: 'Tuesday',
                3: 'Wednesday',
                4: 'Thursday',
                5: 'Friday',
                6: 'Saturday'
            },
            month: {
                0: 'January',
                1: 'February',
                2: 'March',
                3: 'April',
                4: 'May',
                5: 'June',
                6: 'July',
                7: 'August',
                8: 'September',
                9: 'October',
                10: 'November',
                11: 'December'
            },
            date: {
                0: 'th',
                1: 'st',
                2: 'nd',
                3: 'rd',
                4: 'th',
                5: 'th',
                6: 'th',
                7: 'th',
                8: 'th',
                9: 'th'
            }
        }
        let dayOfWeek = formats.days[date.getDay()];
        let dayOfMonth = date.getDate().toString();
        let month = formats.month[date.getMonth()];
        let formatted = dayOfMonth.substring(2) ? formats.date[dayOfMonth.substring(2)] : formats.date[dayOfMonth.substring(1)];
        return `${dayOfWeek} ${dayOfMonth}${formatted} ${month} | ${date.toLocaleTimeString()}`;
    }

}

const client = new RadaClient();
client.login(process.env.TOKEN);