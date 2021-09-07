const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class util {
    constructor() {
        throw new Error('This class may not be initiated with new');
    }

    static fixJSON(json) {
        return JSON.stringify(json, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value
        );
    }

    static verifyUser = async (userToken) => {
        const request = await fetch('http://discordapp.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        const res = await request.json();
        return res.message === "401: Unauthorized" ? false : true ;
    }
    static getMutuals = (guilds, client) => {
        try {
            let mutuals = client.guilds.cache.filter(g => guilds.some(guild => g.id === guild.id)).map(g => g)
            return mutuals.length > 0 ? mutuals : [];
        } catch (e) {
            return null;
        }
    }
    
    static slashEnabled = async (guildId, client) => {
        let slashCommandsEnabled;
        await client.api.applications(client.user.id)
            .guilds(guildId)
            .commands.get()
            .then((_) => {
                slashCommandsEnabled = true;
            })
            .catch((_) => {
                slashCommandsEnabled = false;
            })
        return slashCommandsEnabled;
    }

    static getWarnings = async (guildId, client) => {
        let arr = [];

        let filteredCollection = client.settings.items.filter(i => i.warnings && i.warnings.length > 0);
        let mappedCollection = filteredCollection.map(i => i.warnings);
        for (const warnings of mappedCollection) {
            for (const warn of warnings) {
                if (warn.guild_id === guildId) {
                    let fetched = await client.users.fetch(warn.user, { force: true });
                    let user = client.users.cache.get(fetched.id);
                    arr.push({ ...warn, tag: user.tag })
                }
            }
        }
        return arr;
    }

    static deleteWarning = async (guild, user, id, client) => {
        const key = `${guild}.${user}`;
        let current = await client.settings.get(key, 'warnings', []);
        let removed = current.filter(warning => warning.id !== id) || []
        await client.settings.set(key, 'warnings', removed);
        return true;
    }
    
    static getReminders = async (userId, client) => {
        try {
            let current = await client.settings.get(userId, 'reminders.current', []);
            let old = await client.settings.get(userId, 'reminders.old', []);
            return {
                current: current,
                old: old
            };
        } catch (e) {
            return {
                current: [],
                old: []
            }
        }
    }
    
    static clearReminders = async (userId, client) => {
        await client.settings.clear(userId, 'reminders.current');
        await client.settings.clear(userId, 'reminders.old');
        return true;
    }

    static getToDoList = async (userId, client) => {
        let todolist = await client.settings.get(userId, 'todolist', []);
        return todolist;
    }

    static clearToDoList = async (userId, client, id = null) => {
        if (!id) {
            await client.settings.clear(userId, 'todolist');
            return true;
        } else {
            let todolist = await client.settings.get(userId, 'todolist', []);
            let filtered = todolist.filter(tdl => tdl.id !== id);
            await client.settings.set(userId, 'todolist', filtered);
            return true;
        }
        
    }

    static addToDoList = async (userId, client, data) => {
        let task = {
            id: client.Util.generateID(),
            created: new Date(data.created),
            text: data.msg
        }
        await client.databaseHandler.addToDoListTask(userId, task);
        return task;
    }
    
    static getVoteChannel = (client, guild) => {
        let server = client.guilds.cache.get(guild)
        return client.settings.get(guild, 'vote', false) ? server.channels.cache.get(client.settings.get(guild, 'vote')) : null
    }
    static setVoteChannel = async (client, guild, channel) => {
        await client.settings.set(guild, 'vote', channel === 'null' ? null : channel);
        return true;
    }
    
    static getWelcomeChannel = (client, guild) => {
        let server = client.guilds.cache.get(guild)
        return client.settings.get(guild, 'ws.channel', false) ? server.channels.cache.get(client.settings.get(guild, 'ws.channel', false)) : null
    }
    static setWelcomeChannel = async (client, guild, channel) => {
        await client.settings.set(guild, 'ws.channel', channel === 'null' ? null : channel);
        return true;
    }
    
    static getWelcomeMessage = (client, guild) => {
        return client.settings.get(guild, 'ws.join', false) ? client.settings.get(guild, 'ws.join', false) : null
    }
    static setWelcomeMessage = async (client, guild, msg) => {
        await client.settings.set(guild, 'ws.join', msg === "null" ? null : msg);
        return true;
    }
    
    static getLeaveMessage = (client, guild) => {
        return client.settings.get(guild, 'ws.leave', false) ? client.settings.get(guild, 'ws.leave', false) : null
    }
    static setLeaveMessage = async (client, guild, msg) => {
        await client.settings.set(guild, 'ws.leave', msg === "null" ? null : msg);
        return true;
    }
    
    static getAutorole = (client, guild) => {
        let server = client.guilds.cache.get(guild)
        let bot = client.settings.get(server.id, 'autorole.bot', null)
        let user = client.settings.get(server.id, 'autorole.user', null)
        let botRole = server.roles.cache.get(bot);
        let userRole = server.roles.cache.get(user);
        return {
            bot: botRole ? {
                role: botRole,
                color: botRole.hexColor === "#000000" ? "#7289da" : botRole.hexColor
            } : null,
            user: userRole ? {
                role: userRole,
                color: userRole.hexColor === "#000000" ? "#7289da" : userRole.hexColor
            } : null
        }
    }
    
    static setAutorole = async (client, guild, newRole, type) => {
        await client.settings.set(guild, `autorole.${type}`, newRole);
        return true;
    }
    
    static getAntilink = (client, guild) => {
        let antilink = client.settings.get(guild, 'antilink', 'off')
        return antilink;
    }
    
    static setAntilink = async (client, guild, option) => {
        await client.settings.set(guild, 'antilink', option);
        return true;
    }
    
    // Misc functions
    static getChannels = async (client, guildID) => {
        let guild = client.guilds.cache.get(guildID)
        await guild.channels.fetch();
        let channels = guild.channels.cache
            .filter(c => c.type === "GUILD_TEXT")
            .filter(c => c.permissionsFor(guild.me).has('SEND_MESSAGES'))
            .map(g => g);
        return channels.length > 0 ? channels : [];
    }
    static getRoles = async (client, guildID) => {
        let guild = client.guilds.cache.get(guildID)
        await guild.roles.fetch();
        let roles = guild.roles.cache
            .filter(r => !r.managed)
            .filter(r => r.position < client.guilds.cache.get(guildID).me.roles.highest.position)
            .filter(r => r.id !== guildID)
            .map(g => g);
        return roles.length > 0 ? roles : [];
    }
    
    static getUser = async (id, client) => {
        try {
            let caching = await client.users.fetch(id)
            return client.users.cache.get(caching.id)
        }  catch (e) {
            return null
        }
    }
    
    static getSettingsForMember = (id, guild) => {
        return guild.members.cache.get(id).settings.items.get(id)
    }

}

module.exports = util;