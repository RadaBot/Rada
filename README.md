# Multi purpose discord bot made by br4d#0040

This bot is the first proper bot that I have open sourced. I prefer to keep bots closed source due to the fact that I'm not a huge fan of people self hosting their own version of my bot that I spent alot of time and effort on. That changes today with Rada! If you're interested in self hosting Rada, there's information below on how to do so!

**Dependencies**
- __NodeJS__: You *will* need NodeJS **v16** or above. Any version lower than 16.X.X won't work. You can get that [here](https://nodejs.org/en/download/current/).
- __Git__: You will need Git. You can get that [here](https://git-scm.com/download/).
- __MongoDB__: You will need a MongoBD instance. You can follow the guide [here](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) to install it.

**Installation**
- Open command prompt and type `git clone https://github.com/RadaBot/Rada.git`
- In command prompt, type `cd Rada` to enter the directory. Once in the directory, type `npm i`. This will install all required packages
- Edit `.example.env` (main directory) with your own information then rename it to `.env`
- Edit `example.config.js` (src folder) again with your own information then rename it to `config.js`

**Running**
- Simply type `node .` or `node rada.js` in the command prompt to start the bot

# Differences to expect
Of course, with this being a major rewrite, there's going to be (in this case, quite a lot) of changes. I will list any major changes below, and continue to update as i go.

- (-) Modlogs: These will be completely removed in this rewrite. There are plenty of other bots that actually do logging very well, but for rada, it impacts stability.
- (-) Polls: These will be removed due to wanting to stay away from the message/messageCreate and/or reaction events due to the future of discord.js / the discord API.
- (-) Upload: This will be removed due to slash commands being unable to accept a MessageAttachment or image as an argument.
- (i) Grouped commands: A few of the commands have been condensed into groups (subcommands). For example, instead of having `r!addemoji <whatever>`, it has been condensed to `/emote add <whatever>`. Other commands that have this change: **/settings**, **/welcomesettings**, **/info**, **/emote**, **/role**, **/channel**
- (i) Emote add: As mentioned above, this command will no longer accept a MessageAttachment or image as the emote to add. You must make it a URL. (Popular place for this is imgur etc.)
- (-) Fun: These commands will be removed to save some slash command space.
- (-) Misc: A few misc commands have been removed due to not being used or *needed*

<!-- **Running with sharding** -->
<!-- - Navigate to `lib\ws\ShardManager.js` and then change the `totalShards` to your desired number (`auto` works too.)
- Simply type `npm start` in the command prompt to start the bot with shards. -->

# ATTENTION
This repository is the official v13 rewrite which moves all commands to interactions (slash commands and buttons) [discord.js v13] which most likely wont be stable until public testing goes underway and we are able to isolate and fix any issues.