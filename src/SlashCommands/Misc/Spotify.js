const { SlashCommandBuilder } = require('@discordjs/builders');
const req = require('@aero/centra');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spotify')
        .setDescription('Search for a song on spotify')
        .addSubcommand((subcommand) => subcommand
            .setName('popular')
            .setDescription('Spotify popular')
        )
        .addSubcommand((subcommand) => subcommand
            .setName('search')
            .setDescription('Search for a song on spotify')
            .addStringOption((option) => option
                .setName('song')
                .setDescription('What song do you want to search for?')
                .setRequired(true)
            )
        ),
    category: 'Misc',
    description: 'Search for a song on spotify',
    color: '#1DD05D',
    spotifyWsLogo: 'https://cdn.br4d.vip/spotify-ws.png',
    baseUrl: 'https://spotify.feuer.tech',
    async execute(interaction, client) {
        return await interaction.reply({
            embeds: [
                this.spotifyEmbed(client, 'Spotify search')
                    .setDescription('This command is temporarily disabled!')
            ]
        })
        await interaction.deferReply();
        let subcommand = interaction.options.getSubcommand();
        if (subcommand === 'popular') {
            const popular = await req(`${this.baseUrl}/new?limit=10`).json();
            let embeds = [];
            for (let i = 0; i < popular.new.length; i++) {
                let embed = this.spotifyEmbed(client, 'Spotify popular now')
                    .addField('Name', popular.new[i].name)
                    .addField('Artists', client.Util.isArray(popular.new[i].artists) ? popular.new[i].artists.join(', ') : popular.new[i].artists)
                    .addField('Type', popular.new[i].total_tracks > 1 ? 'Album' : 'Single')
                    .setThumbnail(popular.new[i].image)
                    .setTimestamp()
                if (popular.new[i].total_tracks > 1) {
                    embed.addField('Songs', popular.new[i].tracks.map((i, e) => `**${e+1}**. ${i}`).join('\n'))
                }
                embeds.push(embed);
            }
            await client.buttonPaginator.start(embeds, interaction);
        } else if (subcommand === 'search') {
            let song = interaction.options.getString('song');
            if (!song) {
                return await interaction.editReply({
                    embeds: [
                        this.spotifyEmbed(client, 'Spotify search')
                            .setDescription('Please provide a song to search for')
                    ]
                })
            }
            let query = song.split(/\s+/).join('%20');
            const search = await req(`${this.baseUrl}/search?q=${query}`).json();
            if (search.search.length < 1) {
                return await interaction.editReply({
                    embeds: [
                        this.spotifyEmbed(client, 'Spotify search')
                            .setDescription('There was no results for your query, please try again with something different')
                        ]
                })
            }
            let track = search.search[0].track;
            console.log(track)
            let embed = this.spotifyEmbed(client, 'Spotify search')
                .setDescription('Your search results matched a song')
                .addField('Song', `[${track.full_track}](https://open.spotify.com/track/${track.id})`)
                .addField('Popularity', track.popularity)
                .addField('Explicit', track.explicit ? client.emotes.checked : client.emotes.unchecked)
                .addField('Song length', client.convertMs(track.duration, true))
                .setThumbnail(track.artwork)
            return await interaction.editReply({
                embeds: [embed]
            })
        }
    },
    spotifyEmbed(client, title) {
        return client.util.embed()
            .setTitle(title)
            .setColor(this.color)
            .setFooter(this.baseUrl, this.spotifyWsLogo)
            .setTimestamp();
    }
};