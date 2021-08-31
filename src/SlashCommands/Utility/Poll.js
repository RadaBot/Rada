const { SlashCommandBuilder } = require('@discordjs/builders');
const { poll } = require('../../../lib/util/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll in your server with some options for people to vote on')
        .addStringOption((option) => option
            .setName('title')
            .setDescription('The poll title')
            .setRequired(true)
        )
        .addStringOption((option) => option
            .setName('options')
            .setDescription('A comma (,) separated list of up to 5 options')
            .setRequired(true)
        ),
    category: 'Utility',
    description: 'Create a poll in your server with some options for people to vote on',
    async execute(interaction, client) {
        let options = interaction.options.getString('options');
        let title = interaction.options.getString('title');
        let embed = client.util.embed()
            .setColor(client.misc.color)
            .setTimestamp()
            .setFooter(`Poll created by ${interaction.user.username}`)
        if (title.length > 250) {
            return await interaction.reply({
                content: 'The title can\'t be longer than 250 characters',
                ephemeral: true
            }); 
        }
        let opt = options.split(/,\s*/);
        if (opt.length < 2) {
            return await interaction.reply({
                content: 'You must enter a minimum of 2 poll options i.e. \`/poll title:What is your favourite food? options:Pizza, Burger, Fries, Other\`',
                ephemeral: true
            });
        }
        if (opt.length > 5) {
            return await interaction.reply({
                content: 'You must only enter a maximum of 5 poll options',
                ephemeral: true
            });
        }
        const pollMap = opt.map((option, idx) => `**Option ${idx + 1}:** ${option}`).join('\n');
        if (pollMap.length > 2048) {
            return await interaction.reply({
                content: 'Your options are too long, please shorten them',
                ephemeral: true
            });
        }
        embed.setTitle(title)
            .setDescription(pollMap);
        await interaction.reply({
            embeds: [embed]
        })
        const message = await interaction.fetchReply();
        for (let i = 0; i < opt.length; i++) {
            await message.react(poll[i]);
        }
    }
};