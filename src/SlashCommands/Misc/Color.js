const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
        data: new SlashCommandBuilder()
            .setName('color')
            .setDescription('Info about a color')
            .addStringOption((option) => option
                .setName('hex')
                .setDescription('Hex code to get information for')
            ),
        category: 'Misc',
        description: 'Info about a color',
        async execute(interaction, client) {
            let reghex = /^#?([A-F0-9]{6}|[A-F0-9]{3})$/i;
            let hex = interaction.options.getString('hex') ? interaction.options.getString('hex').match(reghex)[0] : this.generateHex()
            let color = hex.replace(/#/g, '');
            const data = await client.flipnote.others.color(color);
            let embed = client.util.embed()
                .setColor(hex)
                .setTitle(`\`${data.name}\` | ${hex ? data.hex : `#${hex}`}`)
            .setThumbnail(data.image)
            .setImage(data.image_gradient)
            .setTimestamp()
        await interaction.reply({
            embeds: [embed]
        });
    },
    generateHex() {
        return Math.floor(Math.random() * 16777215).toString(16);
    }
};