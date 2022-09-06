const { SlashCommandBuilder } = require('@discordjs/builders');
const { inspect } = require('util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('preset')
        .setDescription('Manage content-filter presets')
        .addSubcommand((subcommand) => subcommand
            .setName('approve')
            .setDescription('Approve a preset request')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The preset ID that you want to approve')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('delete')
            .setDescription('Delete an existing preset')
            .addStringOption((option) => option
                .setName('name')
                .setDescription('The ID of the preset that you want to delete')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('deny')
            .setDescription('Deny a preset request')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The preset ID that you want to deny')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('requests')
            .setDescription('List all preset requests')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The preset request ID that you want to view')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('view')
            .setDescription('View the current presets')
            .addStringOption((option) => option
                .setName('name')
                .setDescription('The preset name that you want to view')
            )
        ),
    permissions: ['MANAGE_GUILD'],
    category: 'Owner',
    description: 'Manage content-filter presets',
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        switch (subcommand) {

            case 'delete':
                let nameToDelete = interaction.options.getString('name');
                let activePresets = await client.settings.get(client.user.id, 'presets', []);
                let presetToDelete = activePresets.filter(r => r.name.toLowerCase() === nameToDelete.toLowerCase())[0]
                let presetsAfterDelete = activePresets.filter(r => r.name.toLowerCase() !== nameToDelete.toLowerCase())
                if (!presetToDelete) return await interaction.reply({
                    content: `The preset name \`${nameToDelete}\` was not found`
                })
                await client.settings.set(client.user.id, 'presets', presetsAfterDelete)
                await interaction.reply({
                    content: `Deleted the preset \`${presetToDelete.name}\``
                })
            break;

            case 'approve':
                let idToApprove = interaction.options.getString('id');
                let requestsToApprove = await client.settings.get(client.user.id, 'presetrequests', []);
                let requestToApprove = requestsToApprove.filter(r => r.id === idToApprove)[0]
                let afterApproveRequests = requestsToApprove.filter(r => r.id !== idToApprove)
                if (!requestToApprove) return await interaction.reply({
                    content: `The preset request id \`${idToApprove}\` was not found`
                })
                let newPreset = {
                    name: requestToApprove.name,
                    words: requestToApprove.preset
                }
                let currentPresets = await client.settings.get(client.user.id, 'presets', [])
                await client.settings.set(client.user.id, 'presets', [newPreset, ...currentPresets])
                await client.settings.set(client.user.id, 'presetrequests', afterApproveRequests);
                let updated = await client.settings.get(client.user.id, 'presets', [])
                await interaction.reply({
                    content: `Approved the preset request \`${newPreset.name}\` \`(${idToApprove})\``
                })
            break;

            case 'deny':
                let idToDeny = interaction.options.getString('id');
                let requestsToDeny = await client.settings.get(client.user.id, 'presetrequests', []);
                let deniedRequest = requestsToDeny.filter(r => r.id === idToDeny)[0]
                let afterDenyRequests = requestsToDeny.filter(r => r.id !== idToDeny)
                if (!deniedRequest) return await interaction.reply({
                    content: `The preset request id \`${idToDeny}\` was not found`
                })
                await client.settings.set(client.user.id, 'presetrequests', afterDenyRequests);
                await interaction.reply({
                    content: `Denied the preset request \`${deniedRequest.name}\` \`(${idToDeny})\``
                })
            break;

            case 'requests':
                let requestId = interaction.options.getString('id');
                let currentRequests = await client.settings.get(client.user.id, 'presetrequests', []);
                if (requestId) {
                    let requestToView = currentRequests.filter(r => r.id === requestId)[0]
                    if (!requestToView) {
                        return await interaction.reply({
                            content: `The preset request id \`${requestId}\` was not found`
                        })
                    }
                    return await interaction.reply({
                        content: `Viewing \`${requestToView.name}\` \`(${requestId})\`:\nWords: \n${requestToView.preset.map(w => { return `||${w}||`}).join(', ')}\n\nApprove: \`/preset approve id:${requestId}\`\nDeny: \`/preset deny id:${requestId}\``
                    })
                }
                if (currentRequests.length < 1) {
                    return await interaction.reply({
                        content: 'There are no current requests to view'
                    })
                }
                await interaction.reply({
                    content: `\`\`\`\n${currentRequests.map(req => { return `"${req.name}" by ${req.requester.tag} - ${req.id}`}).join('\n')}\n\`\`\`\nView a request with \`/preset requests id:<id>\``
                })
            break;

            case 'view':
                let preset = interaction.options.getString('name');
                let currentPresetList = await client.settings.get(client.user.id, 'presets', []);
                if (preset) {
                    let presetToView = currentPresetList.filter(r => r.name.toLowerCase() === preset.toLowerCase())[0]
                    if (!presetToView) {
                        return await interaction.reply({
                            content: `The preset name \`${preset}\` was not found`
                        })
                    }
                    console.log(presetToView.words)
                    return await interaction.reply({
                        content: `Viewing \`${presetToView.name}\`:\n\nWords: ${presetToView.words.map(w => { return `||${w}||`}).join(', ')}`
                    })
                }
                if (currentPresetList.length < 1) {
                    return await interaction.reply({
                        content: 'There are no current presets to view'
                    })
                }
                await interaction.reply({
                    content: `\`\`\`\n${currentPresetList.map(req => req.name).join(', ')}\n\`\`\`\nView a preset with \`/preset view name:<name>\``
                })
            break;

        }
    }
}