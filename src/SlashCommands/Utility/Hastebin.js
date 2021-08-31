const { SlashCommandBuilder } = require('@discordjs/builders');
const req = require('@aero/centra');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hastebin')
        .setDescription('Upload text/code to a shareable hastebin link')
        .addStringOption((option) => option
            .setName('code')
            .setDescription('The code you want to upload.')
            .setRequired(true)
        ),
    category: 'Utility',
    description: 'Upload text/code to a shareable hastebin link',
    async execute(interaction, client) {
        let code = interaction.options.getString('code');
        try {
            const res = await req("https://haste.br4d.vip/documents", 'POST').body(client.beautify(code)).json(); 
            return await interaction.reply({
                content: `Document uploaded, you can find it [here](https://haste.br4d.vip/${res.key})`
            })
        } catch (e) {
            return await interaction.reply({
                content: `Failed to upload: \`${e.message}\``,
                ephemeral: true
            })
        }
    }
};