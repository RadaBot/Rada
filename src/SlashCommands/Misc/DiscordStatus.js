const { SlashCommandBuilder } = require('@discordjs/builders');
const { emotes } = require('../../../lib/util/constants');
const req = require('@aero/centra');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('discordstatus')
        .setDescription('Get the status of Discord'),
    category: 'Misc',
    description: 'Get the status of Discord',
    async execute(interaction, client) {
        const baseUrl = 'https://status.discord.com/api/v2';
        const colors = {
            none: '#63f799',
            minor: '#ffb338',
            major: '#f05151'
        }
        const logos = {
            none: 'https://cdn.discordapp.com/embed/avatars/2.png',
            minor: 'https://cdn.discordapp.com/embed/avatars/3.png',
            major: 'https://cdn.discordapp.com/embed/avatars/4.png'
        }
        const summary = await req(baseUrl, 'GET').path('summary.json').json();
        const incident = await req(baseUrl, 'GET').path('incidents.json').json();

        const components = summary.components.filter(c => !c.group_id);

        const array = [];
        for (let i = 0; i < components.length; i++) {
            array.push(`${components[i].status === 'operational' ? emotes.checked : emotes.unchecked} **${components[i].name}**`)
        }
        const previous = [];
        for (let i = 0; i < 3; i++) {
            previous.push(`> \`-\` [${incident.incidents[i].name}](${incident.incidents[i].shortlink}) (${incident.incidents[i].status})`)
        }

        let embed = client.util.embed()
            .setTitle(`Discord Status - ${summary.status.description}`)
            .setColor(colors[summary.status.indicator])
            .setURL('https://status.discord.com/')
            .setThumbnail(logos[summary.status.indicator])
            .addField('Status', array.join('\n'))
            .addField('Top 3 latest incidents', previous.join('\n'))
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp();
        await interaction.reply({
            embeds: [embed]
        });
    },
};