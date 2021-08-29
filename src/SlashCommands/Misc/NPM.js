const { SlashCommandBuilder } = require('@discordjs/builders');
const req = require('@aero/centra');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('npm')
        .setDescription('Fetch information about an npm package')
        .addStringOption((option) => option
            .setName('package')
            .setDescription('The node package you want information for')
            .setRequired(true)
        ),
    category: 'Misc',
    description: 'Fetch information about an npm package',
    async execute(interaction, client) {
        let icon = 'https://cdn.br4d.vip/Q5Ql1P45.png'
        let query = interaction.options.getString('package');
        await interaction.deferReply();
        try {
            const body = await req(`https://registry.npmjs.com/${query.toLowerCase()}`, 'GET').json();
            const version = body.versions[body['dist-tags'].latest];
            let deps = version.dependencies ? Object.keys(version.dependencies) : null;
            let maintainers = body.maintainers.map(user => user.name)
            if (maintainers.length > 10) {
                maintainers = maintainers.slice(0, 10);
                maintainers.push(`... and more.`);
            }
            if (deps && deps.length > 10) {
                deps = deps.slice(0, 10);
                deps.push(`... and more.`)
            }
            let embed = client.util.embed()
                .setColor(client.misc.color)
                .setTitle(`Npm package information | \`${body.name}\``)
                .setThumbnail(icon)
                .addField(`Package Description`, `${version.description || "No description provided."}`)
                .addField(`Package Maintainers`, `${maintainers.join(", ")}`, true)
                .addField(`Package License`, `${body.license ? body.license : 'Unlicensed'}`, true)
                .addField(`Package Version`, `${body['dist-tags'].latest ? body['dist-tags'].latest : '1.0.0'}`, true)
                .addField(`Dependencies`, `${deps && deps.length ? deps.join(", ") : "None"}`, false)
                .addField(`Link`, `https://www.npmjs.com/package/${query.toLowerCase()}`)
                .setFooter(`Requested by ${interaction.user.username}`)
                .setTimestamp()
            await interaction.editReply({
                embeds: [embed]
            });
        } catch (e) {
            let embed = client.util.embed()
                .setTitle(`Npm package information | \`${query}\``)
                .setColor(client.misc.color)
                .setThumbnail(icon)
                .setDescription(`Couldn\'t find any results on [npmjs](https://www.npmjs.com/) for \`${query}\``)
                .setFooter(`Requested by ${interaction.user.username}`)
                .setTimestamp()
            await interaction.editReply({
                embeds: [embed]
            });
        }
    }
};