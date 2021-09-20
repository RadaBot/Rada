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

    static following = async (follower, user, client) => {
        let followers = await client.settings.get(user, 'followers', []);
        let findFollower = followers.filter(f => f.id === follower) || []
        return findFollower[0] ? true : false;
    }

    static followers = async (user, client) => {
        let followers = await client.settings.get(user, 'followers', []);
        let followerCount = await client.settings.get(user, 'followerCount', 0);
        return {
            followCount: followerCount,
            followers: followers
        }
    }

    static follow = async (follower, user, auth, client) => {
        let valid = await this.verifyUser(auth);
        if (valid) {
            if (follower.id === user) {
                return {
                    success: false,
                    message: 'Stop trying... You can\'t follow yourself'
                }
            }
            let followers = await client.settings.get(user, 'followers', []);
            let followerCount = await client.settings.get(user, 'followerCount', 0);
            await client.settings.set(user, 'followerCount', followerCount + 1);
            const newFollower = {
                id: follower.id,
                tag: follower.username + '#' + follower.discriminator,
                followers: await client.settings.get(follower.id, 'followerCount', 0)
            }
            await client.databaseHandler.addFollower(user, newFollower)
            return {
                success: true,
                followCount: followerCount + 1
            }
        } else {
            return {
                success: false,
                message: '401 Unauthorized'
            }
        }
    }

    static unfollow = async (follower, user, auth, client) => {
        let valid = await this.verifyUser(auth);
        if (valid) {
            let followers = await client.settings.get(user, 'followers', []);
            let followerCount = await client.settings.get(user, 'followerCount', 0);
            await client.settings.set(user, 'followerCount', followerCount - 1);
            let current = await client.settings.get(user, 'followers', []);
            let removed = current.filter(f => f.id !== follower.id) || []
            await client.settings.set(user, 'followers', removed);
            return {
                success: true,
                followCount: followerCount - 1
            }
        } else {
            return {
                success: false,
                message: '401 Unauthorized'
            }
        }
    }

    static updateAboutMe = async (userId, body, client) => {
        let valid = await this.verifyUser(body.auth);
        if (valid) {
            await client.settings.set(userId, 'about', body.msg)
            return {
                success: true,
                about: body.msg
            }
        } else {
            return {
                success: false,
                message: '401 Unauthorized'
            }
        }
    }

    static getValidUser = async (userId, client) => {
        let placeholder = 'https://cdn.discordapp.com/embed/avatars/0.png';
        let placeholderNone = 'https://cdn.discordapp.com/embed/avatars/1.png';
        let bannerPlaceholder = 'https://cdn.br4d.vip/tCJr.png';
        try {
            let fetched = await client.users.fetch(userId, { force : true });
            let user = client.users.cache.get(fetched.id);
            let guilds = client.guilds.cache.filter(g => !g.members.cache.has(user.id)).map(g => g);
            if (guilds.length > 0 || userId === client.user.id) return {
                success: true,
                user: {
                    id: user.id,
                    tag: user.tag,
                    avatar: user.avatarURL({ dynamic: true, size: 512 }) ?? placeholder,
                    banner: fetched.bannerURL({ dynamic: true, size: 512 }) ?? bannerPlaceholder,
                    about: client.settings.get(user.id, 'about', false),
                    badges: client.displayFlags(user, false, true),
                    userType: user.bot ? 'bot' : 'user',
                    icon: user.bot ? 'https://cdn.discordapp.com/emojis/728596296243347486.png?v=1' : 'https://cdn.discordapp.com/emojis/556184052344946689.png?v=1'
                }
            }
        } catch (e) {
            return {
                success: false,
                user: {
                    avatar: placeholderNone,
                    banner: bannerPlaceholder
                }
            }
        }
        // let user = client.users.cache.get(userId);
        // let settings = await client.settings.items.get(userId) ?? false;
        // if (user || settings) return true; else return false;
    }

    static staff = async (client) => {
        let placeholder = `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`
        let bannerPlaceholder = 'https://cdn.br4d.vip/tCJr.png'
        let guild = client.guilds.cache.get('778361102709817384');
        await guild.roles.fetch({ force: true });
        await guild.members.fetch({ force: true });
        let leadDevArr = [];
        let devArr = [];
        let adminArr = [];
        let modArr = [];
        let helperArr = [];
        let contribArr = [];
        let roles = {
            lead: '885296762380746755',
            dev: '778363361477132328',
            admin: '778363622459179039',
            mod: '778363856816701440',
            helper: '778364009530916894',
            contrib: '789310316105170945'
        }
        // Lead Developers
        for (const member of guild.roles.cache.get(roles.lead).members.map(m => m)) {
            let fetch = await client.users.fetch(member.id, { force: true });
            leadDevArr.push({
                id: member.id,
                role: 'Lead Developer',
                tag: member.user.tag,
                avatar: member.user.avatarURL({ dynamic: true, size: 512 }) ?? placeholder,
                color: guild.roles.cache.get(roles.lead).hexColor,
                banner: fetch.bannerURL() ? fetch.bannerURL({ dynamic: true, size: 512 }) : bannerPlaceholder
            })
        }
        // Developers
        for (const member of guild.roles.cache.get(roles.dev).members.filter(m => m.roles.highest.id === roles.dev).map(m => m)) {
            let fetch = await client.users.fetch(member.id, { force: true });
            devArr.push({
                id: member.id,
                role: 'Developer',
                tag: member.user.tag,
                avatar: member.user.avatarURL({ dynamic: true, size: 512 }) ?? placeholder,
                color: guild.roles.cache.get(roles.dev).hexColor,
                banner: fetch.bannerURL() ? fetch.bannerURL({ dynamic: true, size: 512 }) : bannerPlaceholder
            })
        }
        // Administrators
        for (const member of guild.roles.cache.get(roles.admin).members.filter(m => m.roles.highest.id === roles.admin).map(m => m)) {
            let fetch = await client.users.fetch(member.id, { force: true });
            adminArr.push({
                id: member.id,
                role: 'Administrator',
                tag: member.user.tag,
                avatar: member.user.avatarURL({ dynamic: true, size: 512 }) ?? placeholder,
                color: guild.roles.cache.get(roles.admin).hexColor,
                banner: fetch.bannerURL() ? fetch.bannerURL({ dynamic: true, size: 512 }) : bannerPlaceholder
            })
        }
        // Moderators
        for (const member of guild.roles.cache.get(roles.mod).members.filter(m => m.roles.highest.id === roles.mod).map(m => m)) {
            let fetch = await client.users.fetch(member.id, { force: true });
            modArr.push({
                id: member.id,
                role: 'Moderator',
                tag: member.user.tag,
                avatar: member.user.avatarURL({ dynamic: true, size: 512 }) ?? placeholder,
                color: guild.roles.cache.get(roles.mod).hexColor,
                banner: fetch.bannerURL() ? fetch.bannerURL({ dynamic: true, size: 512 }) : bannerPlaceholder
            })
        }
        // Helpers
        for (const member of guild.roles.cache.get(roles.helper).members.filter(m => m.roles.highest.id === roles.helper && !m.user.bot).map(m => m)) {
            let fetch = await client.users.fetch(member.id, { force: true });
            helperArr.push({
                id: member.id,
                role: 'Helper',
                tag: member.user.tag,
                avatar: member.user.avatarURL({ dynamic: true, size: 512 }) ?? placeholder,
                color: guild.roles.cache.get(roles.helper).hexColor,
                banner: fetch.bannerURL() ? fetch.bannerURL({ dynamic: true, size: 512 }) : bannerPlaceholder
            })
        }
        // Contributors
        for (const member of guild.roles.cache.get(roles.contrib).members.map(m => m)) {
            let fetch = await client.users.fetch(member.id, { force: true });
            contribArr.push({
                tag: member.user.tag,
                avatar: member.user.avatarURL({ dynamic: true, size: 512 }) ?? placeholder
            })
        }
        return {
            leadDeveloper: leadDevArr,
            developers: devArr,
            administrators: adminArr,
            moderators: modArr,
            helpers: helperArr,
            contributors: contribArr
        }
    }

    static getWordFilter = async (client, guildId) => {
        let enabled = await client.settings.get(guildId, 'wordfilter', false);
        return enabled;
    }

    static getFilteredWords = async (client, guildId) => {
        let words = await client.settings.get(guildId, 'filteredwords', []);
        return words;
    }

    static addFilterWord = async (client, guildId, word, auth) => {
        let valid = await this.verifyUser(auth);
        if (valid) {
            let data = await client.databaseHandler.addFilterWord(guildId, word);
            return true;
        } else {
            return {
                success: false,
                message: '401 Unauthorized'
            }
        }
    }

    static removeFilterWord = async (client, guildId, word, auth) => {
        let valid = await this.verifyUser(auth);
        if (valid) {
            let current = await client.settings.get(guildId, 'filteredwords', []);
            let filtered = current.filter(w => word.toLowerCase() !== w.toLowerCase());
            let deleted = current.filter(w => word.toLowerCase() === w.toLowerCase());
            await client.settings.set(guildId, 'filteredwords', filtered);
            return {
                deleted: deleted
            }
        } else {
            return {
                success: false,
                message: '401 Unauthorized'
            }
        }
    }

    static updateWordFilter = async (client, guildId, enabled) => {
        await client.settings.set(guildId, 'wordfilter', enabled);
        return true;
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
        await client.settings.delete(userId, 'reminders.current');
        await client.settings.delete(userId, 'reminders.old');
        return true;
    }

    static getToDoList = async (userId, client) => {
        let todolist = await client.settings.get(userId, 'todolist', []);
        return todolist;
    }

    static clearToDoList = async (userId, client, id = null) => {
        if (!id) {
            await client.settings.delete(userId, 'todolist');
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
    
    static setAntilink = async (client, guild, option, auth) => {
        let valid = await this.verifyUser(auth)
        if (valid) {
            await client.settings.set(guild, 'antilink', option);
            return true;
        } else {
            return {
                success: false,
                message: '401 Unauthorized'
            }
        }
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