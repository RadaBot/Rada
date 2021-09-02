const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const DefaultRouter = require('./common/DefaultRouter');
const util = require('./common/util');
// const { inspect } = require('util');
const os = require('os');
// const WebSocket = require('ws'); // Websocket support, (Later on V2)
// const Events = require('events');
// let users = [];
// let RadaAPIEvents = new Events.EventEmitter();
// exports.EventManager = RadaAPIEvents


/**
 * Super class that allows error codes and commands to work simply.
 */
class RadaResponse {
    op;
    type;
    message;
    constructor(op, type, message) {
        this.op = op;
        this.type = type;
        this.message = message;
    }
}

/**
 * The JSON class for the member data the dashboard requires
 */
class RadaAPIMember {
    member;
    roles;
    presence;
    permissions;
    settings;
    constructor(member, roles, presence, permissions, settings) {
        this.member = member;
        this.roles = roles;
        this.presence = presence;
        this.permissions = permissions;
        this.settings = settings;
    }
}

/**
 * Construct a class that returns Rada's info on the current host
 */
class RadaAPIStats {
    os;
    cpu;
    cpuAvg;
    mem;
    users;
    usersCached;
    guilds;
    constructor(os, cpu, cpuAvg, mem, users, usersCached, guilds) {
        this.os = os;
        this.cpu = cpu;
        this.cpuAvg = cpuAvg;
        this.mem = mem;
        this.users = users;
        this.usersCached = usersCached;
        this.guilds = guilds;
    }
}
/*
 * Authenticate with the websocket with a user token handed to by Discord Oauth, Checks access of the current session
 */
// class RadaAPIAuthentication {
//     userToken;
//     sessionID;
//     constructor(userToken, sessionID) {
//         this.userToken = userToken;
//         this.sessionID = sessionID;
//     }
// }
class RadaAPI extends DefaultRouter {
    constructor(rada) {
        super(rada);
    }
    
    setup() {
        const server = require('http').createServer(this.api)
        let rada = this.client;
        let api = this.api
        api.use(bodyParser.urlencoded({ extended: true }));
        api.use(bodyParser.json());
        api.use(bodyParser.raw());
        api.use(express.json());
        api.use(cors());

        api.get('/test', (req, res) => {
            res.status(200).send("true");
        })

        api.post('/mutual', (req, res) => {
            let mutuals = util.getMutuals(req.body, rada)
            res.status(200).send(JSON.stringify(mutuals))
        });

        api.get('/slash', async(req, res) => {
            let guild = req.query.guildid;
            let enabled = await util.slashEnabled(guild, rada)
            res.status(200).send(JSON.stringify(enabled))
        })

        api.get('/warnings', async(req, res) => {
            let guild = req.query.guildid;
            let warnings = await util.getWarnings(guild, rada)
            res.status(200).send(JSON.stringify(warnings))
        });

        api.get('/warning/delete', async(req, res) => {
            let guild = req.query.guildid;
            let user = req.query.userid;
            let warn = req.query.warnid;
            let removed = await util.deleteWarning(guild, user, warn, rada)
            res.status(200).send(JSON.stringify(removed))
        });

        api.get('/reminders', async(req, res) => {
            let user = req.query.userid;
            let reminders = await util.getReminders(user, rada)
            res.status(200).send(JSON.stringify(reminders))
        });

        api.get('/reminders/clear', (req, res) => {
            let user = req.query.userid;
            res.status(200).send(util.clearReminders(user, rada))
        });

        api.get('/todolist', async(req, res) => {
            let user = req.query.userid;
            let todolist = await util.getToDoList(user, rada)
            res.status(200).send(JSON.stringify(todolist))
        });

        api.post('/todolist/add', async(req, res) => {
            let user = req.query.id;
            let data = req.body;
            let todolist = await util.addToDoList(user, rada, data)
            res.status(200).send(JSON.stringify(todolist))
        });

        api.get('/todolist/clear', (req, res) => {
            let user = req.query.userid;
            let id = req.query.id;
            if (!id) {
                res.status(200).send(util.clearToDoList(user, rada))
            } else {
                res.status(200).send(util.clearToDoList(user, rada, id))
            }
        });

        api.get('/autorole', (req, res) => {
            let guildID = req.query.id;
            if (!guildID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your GET request")))
            }
            let autorole = util.getAutorole(rada, guildID)
            let data = util.fixJSON(autorole)
            res.status(200).send(data)
        })

        api.post('/setautorole', async(req, res) => {
            let guild = req.query.id;
            let roleID = req.query.rid;
            let type = req.query.type;
            let authHeader = req.headers.authorization
            if (!authHeader || authHeader === 'undefined') {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            let validUser = await util.verifyUser(authHeader.split(' ')[1])
            if (!validUser) {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            if (!guild) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your POST request")))
            }
            if (!roleID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a &rid=roleid in your POST request")))
            }
            if (!type) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a &type=type in your POST request")))
            }
            let updated = util.setAutorole(rada, guild, roleID, type)
            updated ? res.status(200).send("true") : res.status(400).send("false")
        })

        api.get('/antilink', (req, res) => {
            let guildID = req.query.id;
            if (!guildID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your GET request")))
            }
            let antilink = util.getAntilink(rada, guildID)
            res.status(200).send(JSON.stringify(antilink))
        })
        api.post('/toggleantilink', async(req, res) => {
            let guild = req.query.id;
            let updated = req.query.updated;
            let authHeader = req.headers.authorization
            if (!authHeader || authHeader === 'undefined') {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            let validUser = await util.verifyUser(authHeader.split(' ')[1])
            if (!validUser) {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            if (!guild) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your POST request")))
            }
            if (!updated) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a &updated=option in your POST request")))
            }
            let toggled = util.setAntilink(rada, guild, updated)
            toggled ? res.status(200).send("true") : res.status(400).send("false")
        })

        api.get('/votechannel', (req, res) => {
            let guildID = req.query.id;
            if (!guildID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your GET request")))
            }
            let votechannel = util.getVoteChannel(rada, guildID)
            res.status(200).send(JSON.stringify(votechannel))
        })
        api.post('/setvotechannel', async(req, res) => {
            let guild = req.query.id;
            let cid = req.query.cid;
            let authHeader = req.headers.authorization
            if (!authHeader || authHeader === 'undefined') {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            let validUser = await util.verifyUser(authHeader.split(' ')[1])
            if (!validUser) {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            if (!guild) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your POST request")))
            }
            if (!cid) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a &cid=channelid in your POST request")))
            }
            let updated = util.setVoteChannel(rada, guild, cid)
            updated ? res.status(200).send("true") : res.status(400).send("false")
        })

        api.get('/welcomechannel', (req, res) => {
            let guildID = req.query.id;
            if (!guildID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your GET request")))
            }
            let welcomechannel = util.getWelcomeChannel(rada, guildID)
            res.status(200).send(JSON.stringify(welcomechannel))
        })
        api.post('/setwelcomechannel', async(req, res) => {
            let guild = req.query.id;
            let cid = req.query.cid;
            let authHeader = req.headers.authorization
            if (!authHeader || authHeader === 'undefined') {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            let validUser = await util.verifyUser(authHeader.split(' ')[1])
            if (!validUser) {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            if (!guild) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your POST request")))
            }
            if (!cid) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a &cid=channelid in your POST request")))
            }
            let updated = util.setWelcomeChannel(rada, guild, cid)
            updated ? res.status(200).send("true") : res.status(400).send("false")
        })

        api.get('/welcomemessage', (req, res) => {
            let guildID = req.query.id;
            if (!guildID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your GET request")))
            }
            let welcomemessage = util.getWelcomeMessage(rada, guildID)
            res.status(200).send(JSON.stringify(welcomemessage))
        })
        api.post('/setwelcomemessage', async(req, res) => {
            let guild = req.query.id;
            let msg = req.body.msg;
            let authHeader = req.headers.authorization
            if (!authHeader || authHeader === 'undefined') {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            let validUser = await util.verifyUser(authHeader.split(' ')[1])
            if (!validUser) {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            if (!guild) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your POST request")))
            }
            if (!msg) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a msg body in your POST request")))
            }
            let updated = await util.setWelcomeMessage(rada, guild, msg)
            updated ? res.status(200).send("true") : res.status(400).send("false")
        })

        api.get('/leavemessage', (req, res) => {
            let guildID = req.query.id;
            if (!guildID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your GET request")))
            }
            let leavemessage = util.getLeaveMessage(rada, guildID)
            res.status(200).send(JSON.stringify(leavemessage))
        })
        api.post('/setleavemessage', async(req, res) => {
            let guild = req.query.id;
            let msg = req.body.msg
            let authHeader = req.headers.authorization
            if (!authHeader || authHeader === 'undefined') {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            let validUser = await util.verifyUser(authHeader.split(' ')[1])
            if (!validUser) {
                res.status(401).send(JSON.stringify(new RadaResponse(-1, "error", "401: Unauthorized")))
            }
            if (!guild) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a ?id=guildid in your POST request")))
            }
            if (!msg) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "You must have a &msg=message in your POST request")))
            }
            let updated = await util.setLeaveMessage(rada, guild, msg)
            updated ? res.status(200).send("true") : res.status(400).send("false")
        })

        api.get('/channels', async (req, res) => {
            let guildID = req.query.gid;
            if (!guildID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "Your request query is invalid. Format: ?gid=guildID")))
            }
            let channels = await util.getChannels(rada, guildID)
            let data = util.fixJSON(channels)
            res.status(200).send(data)
        })

        api.get('/roles', async (req, res) => {
            let guildID = req.query.gid;
            if (!guildID) {
                res.status(400).send(JSON.stringify(new RadaResponse(-1, "error", "Your request query is invalid. Format: ?gid=guildID")))
            }
            let roles = await util.getRoles(rada, guildID)
            let data = util.fixJSON(roles)
            res.status(200).send(data)
        })

        api.get('/guild', (req, res) => {
            let guildID = req.query.id;
            if (guildID == null) {
                res.status(400).send(JSON.stringify(new RadaResponse(-2, "error", "You must have a ?id=guildid in your GET request")))
            } else if (guildID === "") {
                res.status(400).send(JSON.stringify(new RadaResponse(-2, "error", "You must have a guild id in the request. Not BLANK")))
            }
            let bool = rada.guilds.cache.find(g => g.id === guildID)
            if (!bool) {
                res.status(200).send("false")
            } else if (bool) {
                res.status(200).send("true")
            }
        });

        /**
         * ***Endpoint*** That provides a Boolean return of (`true`/`false`)
         *
         * **URI** /permission?uid=exampleUserID&gid=exampleGuildID
         * @param gid The guild id needed
         * @param uid The user id needed
         * @returns Boolean
         */
        api.get('/permission', (req, res) => {
            let guildID = req.query.gid;
            let userID = req.query.uid;
            if (guildID == null && userID == null || guildID === "" && userID === "" || guildID == null || userID == null) {
                res.status(400).send(JSON.stringify(new RadaResponse(-3, "error", "You must have BOTH a valid guildid (?gid=GUILDID) AND a valid userid (&uid=USERID)")))
            }
            util.getUser(userID, rada).then(u => {
                if (u == null) {
                    res.status(400).send(JSON.stringify(new RadaResponse(-3, "error", `You must have a valid user id (${userID} is not a valid user id)`)))
                } else {
                    let guild = rada.guilds.cache.get(guildID)
                    if (!guild.id) {
                        res.status(400).send(JSON.stringify(new RadaResponse(-3, "error", `That is not a valid guild id`)))
                    }
                    guild.members.fetch(u).then(m => {
                        if (m.permissions.has("ADMINISTRATOR") || m.permissions.has("MANAGE_GUILD")) {
                            res.status(200).send("true")
                        } else
                            res.status(200).send("false")
                    })
                }
            })
        });

        api.get('/member', async(req, res) => {
            let guildID = req.query.gid;
            let userID = req.query.uid;
            if (guildID == null && userID == null || guildID === "" && userID === "" || guildID == null || userID == null) {
                res.status(400).send(JSON.stringify(new RadaResponse(-3, "error", "You must have BOTH a valid guildid (?gid=GUILDID) AND a valid userid (&uid=USERID)")))
            }
            await util.getUser(userID, rada).then(async u => {
                if (u == null) {
                    res.status(400).send(JSON.stringify(new RadaResponse(-3, "error", `You must have a valid user id (${userID} is not a valid user id)`)))
                } else {
                    let guild = rada.guilds.cache.find(g => g.id === guildID)
                    if (guild.id) {
                        res.status(400).send(JSON.stringify(new RadaResponse(-3, "error", `That is not a valid guild id`)))
                    }
                    /*
                        * Needs to have 2 fetch methods to both grab the pre member and post member from cache so it can grab MongoDB on first request
                        */
                    guild.members.fetch(u)
                    guild.members.fetch(u).then(m => {
                        let settings;
                        settings = util.getSettingsForMember(m.id, guild)
                        let member = new RadaAPIMember(m, m.roles.cache, m.presence, m.permissions.toArray(), settings)
                        res.status(200).send(JSON.stringify(member))
                    })
                }
            })
        });

        api.get('/warnings', async(req, res) => {
            let gid = req.query.id;
            let warnings = [];
            rada.guilds.cache.get(gid).members.fetch()
            rada.guilds.cache.get(gid).members.fetch().then(members => {
                members.forEach(m => warnings.push({
                    user: m.user.tag,
                    warnings: m.settings.get(m.id, 'warnings', [])
                        .filter(w => w.guild_id === gid)
                }))
                res.status(200).send(warnings)
            })
        })

        api.get('/stats', async(req, res) => {
            let total = rada.guilds.cache.reduce((a, c) => a + c.memberCount, 0);
            let cached = this.client.guilds.cache.reduce((a, c) => a + c.members.cache.size, 0);
            let operatingSystem = `${process.platform === 'linux' ? 'Ubuntu 18.04' : 'Windows 10'} ${process.arch}`;
            let cpuModel = os.cpus()[0].model;
            let cpuAvg = os.loadavg()[0].toFixed(1)
            let mem = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) > 1024 ? `${(process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2)} GB` : `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`}`
            let users = total;
            let usersCached = cached
            let guilds = rada.guilds.cache;
            let stats = new RadaAPIStats(operatingSystem, cpuModel, cpuAvg, mem, users, usersCached, guilds.size);
            res.status(200).send(JSON.stringify(stats))
        });
        // let wss = new WebSocket.Server({server})
        // wss.on('connection', (ws, req) => {
        //     ws.send(JSON.stringify(new RadaResponse(1, "HELLO", `HELLO ${req.connection.remoteAddress}`)))
        //     ws.on('message', async (msg) => {
        //         try {
        //             JSON.parse(msg)
        //         } catch (e) {
        //             return ws.send(JSON.stringify(new RadaResponse(-7, "json-error", "Must be valid JSON!")));
        //         }
        //         if (JSON.parse(msg).type !== "auth" && users.indexOf(req.connection.remoteAddress) === -1) {
        //             return ws.send(JSON.stringify(new RadaResponse(401, "forbidden", "You cannot request any data before you have authenticated with our servers!")))
        //         }
        //         if (JSON.parse(msg).type === "auth") {
        //             let userToken = JSON.parse(msg).userToken;
        //             if (userToken === null || userToken === undefined || userToken === "") {
        //                 return ws.send(JSON.stringify(new RadaResponse(-8, "authentication-error", "User token must exist")));
        //             }
        //             let authentication = new RadaAPIAuthentication(userToken, "testid");
        //             let userStatus = await util.verifyUser(authentication.userToken);
        //                 if (!userStatus) {
        //                    return ws.send(JSON.stringify(new RadaResponse(-8, "authentication-error", "User token was invalid")));
        //                 }
        //                 users.push(req.connection.remoteAddress)
        //                 ws.send(JSON.stringify(new RadaResponse(8, "authenticated", `Welcome ${req.connection.remoteAddress}`)))
        //             /**
        //              * Websocket Events...
        //              */
        //             RadaAPIEvents.on('prefix', (data) => {
        //                 ws.send(JSON.stringify(data))
        //             });
        //         }
        //     });
        //     ws.on('close', () => {
        //         users.remove(req.connection.remoteAddress)
        //     });
        // });

        return server;
    }
    shutdown() {
        return super.shutdown()
    }
}
module.exports.RadaAPI = RadaAPI