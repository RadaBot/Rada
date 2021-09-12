const { SlashCommandBuilder } = require('@discordjs/builders');
const { emotes } = require('../../../lib/util/constants');
const req = require('@aero/centra');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cloudflarestatus')
        .setDescription('Get the status of Cloudflare'),
    category: 'Misc',
    description: 'Get the status of Cloudflare',
    async execute(interaction, client) {
        const baseUrl = 'https://www.cloudflarestatus.com/api/v2';
        const colors = {
            none: '#63f799',
            minor: '#ffb338',
            major: '#f05151'
        }
        const logo = 'https://cdn.br4d.vip/4Dm3';
        const summary = await req(baseUrl, 'GET').path('summary.json').json();
        const incident = await req(baseUrl, 'GET').path('incidents.json').json();

        const coreComponents = summary.components.filter(c => c.description);
        const components = summary.components.filter(c => !c.group_id);

        let coreArray = [];
        for (let i = 0; i < coreComponents.length; i++) {
            coreArray.push(`${coreComponents[i].status === 'operational' ? '✓' : '✕'} [${coreComponents[i].status}] ${coreComponents[i].name}`)
        }
        let uploaded = false;
        let res;
        try {
            res = await req("https://haste.br4d.vip/documents", 'POST').body(coreArray.join('\n')).json();
            uploaded = true;
        } catch (e) {
            uploaded = false;
        }
        const array = [];
        for (let i = 0; i < components.length; i++) {
            array.push(`${components[i].status === 'operational' ? emotes.checked : emotes.unchecked} **${components[i].name}**`)
        }
        const previous = [];
        for (let i = 0; i < 3; i++) {
            previous.push(`> \`-\` [${incident.incidents[i].name}](${incident.incidents[i].shortlink}) (${incident.incidents[i].status})`)
        }

        let embed = client.util.embed()
            .setTitle(`Cloudflare Status - ${summary.status.description}`)
            .setColor(colors[summary.status.indicator])
            .setURL('https://cloudflarestatus.com/')
            .setThumbnail(logo)
            .addField('Status', array.join('\n'))
            .addField('Top 3 latest incidents', previous.join('\n'))
            .setFooter(`Requested by ${interaction.user.username}`)
            .setTimestamp();
        if (uploaded) {
            embed.addField('Core components', `You can view the status of the core components [here](https://haste.br4d.vip/${res.key})`)
        }
        await interaction.reply({
            embeds: [embed]
        });
    },
};