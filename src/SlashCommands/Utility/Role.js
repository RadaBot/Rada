const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Role management command')
        .addSubcommand((subcommand) => subcommand
            .setName('create')
            .setDescription('Create a role')
            .addStringOption((option) => option
                .setName('name')
                .setDescription('The name of the role you want to create')
                .setRequired(true)
            )
            .addBooleanOption((option) => option
                .setName('mentionable')
                .setDescription('Do you want the role to be mentionable')
                // .addChoice('Yes', true)
                // .addChoice('No', false)
                .setRequired(true)
            )
            .addBooleanOption((option) => option
                .setName('hoisted')
                .setDescription('Do you want the role to be hoisted')
                // .addChoice('Yes', true)
                // .addChoice('No', false)
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('color')
                .setDescription('The color of the role you want to create')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('delete')
            .setDescription('Delete a role')
            .addRoleOption((option) => option
                .setName('role')
                .setDescription('The role you want to delete')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('edit')
            .setDescription('Edit a role')
            .addRoleOption((option) => option
                .setName('role')
                .setDescription('The role you want to edit')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('name')
                .setDescription('This is if you want to edit the name')
            )
            .addStringOption((option) => option
                .setName('color')
                .setDescription('This is if you want to edit the color')
            )
            .addBooleanOption((option) => option
                .setName('hoist')
                // .addChoice('Yes', true)
                // .addChoice('No', false)
                .setDescription('This is if you want the role hoisted')
            )
            .addBooleanOption((option) => option
                .setName('mentionable')
                // .addChoice('Yes', true)
                // .addChoice('No', false)
                .setDescription('This is if you want the role mentionable')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('give')
            .setDescription('Give a role to a user')
            .addUserOption((option) => option
                .setName('user')
                .setDescription('The user you want to give the role to')
                .setRequired(true)
            )
            .addRoleOption((option) => option
                .setName('role')
                .setDescription('The role you want to give')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('remove')
            .setDescription('Remove a role from a user')
            .addUserOption((option) => option
                .setName('user')
                .setDescription('The user you want to remove the role from')
                .setRequired(true)
            )
            .addRoleOption((option) => option
                .setName('role')
                .setDescription('The role you want to remove')
                .setRequired(true)
            )
        ),
    category: 'Utility',
    description: 'Role management command',
    permissions: ['MANAGE_ROLES', 'MANAGE_MEMBERS'],
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        switch (subcommand) {

            case 'create':
                let name = interaction.options.getString('name')
                let mentionable = interaction.options.getBoolean('mentionable')
                let hoisted = interaction.options.getBoolean('hoisted')
                let color = interaction.options.getString('color') ?? this.generateHex();
                try {
                    interaction.guild.roles.create({
                        name: name,
                        color: color,
                        hoist: hoisted,
                        mentionable: mentionable,
                        reason: `Role created by ${interaction.user.username}`
                    })
                    .then(async(r) => {
                        return await interaction.reply({
                            content: `The role __${r.name}__ has been created\n    • Color: \`${r.hexColor}\`\n    • Hoist ${r.hoist ? client.emotes.checked : client.emotes.unchecked}\n    • Mentionable ${r.mentionable ? client.emotes.checked : client.emotes.unchecked}`
                        })
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    }) 
                }
            break;

            case 'delete':
                let role = interaction.options.getRole('role');
                try {
                    await role.delete(`Role deleted by ${interaction.user.username}`);
                    return await interaction.reply({
                        content: `The role __${role.name}__ has been deleted`
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    }) 
                }
            break;

            case 'edit':
                let roleToEdit = interaction.options.getRole('role')
                let newName = interaction.options.getString('name') ?? roleToEdit.name;
                let newColor = interaction.options.getString('color') ?? roleToEdit.hexColor;
                let newMentionable = interaction.options.getBoolean('mentionable') ?? roleToEdit.mentionable;
                let newHoist = interaction.options.getBoolean('hoist') ?? roleToEdit.hoist;
                let old = {
                    name: roleToEdit.name,
                    color: roleToEdit.hexColor,
                    mentionable: roleToEdit.mentionable,
                    hoist: roleToEdit.hoist
                }
                try {
                    await interaction.guild.roles.edit(roleToEdit, {
                        name: newName,
                        color: newColor,
                        mentionable: newMentionable,
                        hoist: newHoist
                    }, `Role edited by ${interaction.user.username}`)
                    .then(async(role) => {
                        return await interaction.reply({
                            content: [
                                `The role __${role.name}__ has been edited`,
                                newName && newName !== old.name ? `\n    • Name: \`${old.name}\` ➜ \`${newName}\`` : '',
                                newColor && newColor !== old.color ? `\n    • Color: \`${old.color}\` ➜ \`${newColor}\`` : '',
                                newMentionable && newMentionable !== old.mentionable ? `\n    • Mentionable: ${role.mentionable ? client.emotes.checked : client.emotes.unchecked}` : '',
                                newHoist && newHoist !== old.hoist ? `\n    • Hoist: ${role.hoist ? client.emotes.checked : client.emotes.unchecked}` : '',
                            ].join('')
                        })
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    }) 
                }
            break;

            case 'give':
                let roleToGive = interaction.options.getRole('role');
                let userToGive = interaction.options.getUser('user');
                let fetchingUserToGive = await interaction.guild.members.fetch(userToGive.id, { force: true });
                let memberToGive = interaction.guild.members.cache.get(fetchingUserToGive.id)
                if (memberToGive.roles.cache.has(roleToGive.id)) {
                    return await interaction.reply({
                        content: `${userToGive.username} already has that role!`,
                        ephemeral: true
                    }) 
                }
                let userGivePosition = roleToGive.position - interaction.member.roles.highest.position;
                let botGivePosition = roleToGive.position - interaction.guild.me.roles.highest.position;
                if (roleToGive.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerID) {
                    return await interaction.reply({
                        content: `That role is ${userGivePosition === 0 ? 'equal to your highest role' : `\`${userGivePosition}\` places higher than your highest role`}`,
                        ephemeral: true
                    }) 
                }
                if (roleToGive.position >= interaction.guild.me.roles.highest.position) {
                    return await interaction.reply({
                        content: `That role is ${botGivePosition === 0 ? 'equal to my highest role' : `\`${botGivePosition}\` places higher than my highest role`}`,
                        ephemeral: true
                    })
                }
                if (roleToGive.managed) {
                    return await interaction.reply({
                        content: 'Unable to give integrated bot roles',
                        ephemeral: true
                    })
                }
                try {
                    memberToGive.roles.add(roleToGive.id, `Role given to ${userToGive.username} by ${interaction.user.username}`)
                    let givenEmbed = client.util.embed()
                        .setTitle('Role given')
                        .setColor(client.misc.color)
                        .setDescription(`The role **${roleToGive.name}** has been given to \`${userToGive.tag}\``)
                    return await interaction.reply({
                        embeds: [givenEmbed]
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    })
                }

            break;

            case 'remove':
                let roleToRemove = interaction.options.getRole('role');
                let userToRemove = interaction.options.getUser('user');
                let fetchingUserToRemove = await interaction.guild.members.fetch(userToRemove.id, { force: true });
                let memberToRemove = interaction.guild.members.cache.get(fetchingUserToRemove.id)
                if (!memberToRemove.roles.cache.has(roleToRemove.id)) {
                    return await interaction.reply({
                        content: `${userToRemove.username} already has that role!`,
                        ephemeral: true
                    }) 
                }
                let userRemovePosition = roleToRemove.position - interaction.member.roles.highest.position;
                let botRemovePosition = roleToRemove.position - interaction.guild.me.roles.highest.position;
                if (roleToRemove.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerID) {
                    return await interaction.reply({
                        content: `That role is ${userRemovePosition === 0 ? 'equal to your highest role' : `\`${userRemovePosition}\` places higher than your highest role`}`,
                        ephemeral: true
                    }) 
                }
                if (roleToRemove.position >= interaction.guild.me.roles.highest.position) {
                    return await interaction.reply({
                        content: `That role is ${botRemovePosition === 0 ? 'equal to my highest role' : `\`${botRemovePosition}\` places higher than my highest role`}`,
                        ephemeral: true
                    })
                }
                if (roleToRemove.managed) {
                    return await interaction.reply({
                        content: 'Unable to remove integrated bot roles',
                        ephemeral: true
                    })
                }
                try {
                    memberToRemove.roles.remove(roleToRemove.id, `Role removed from ${userToRemove.username} by ${interaction.user.username}`)
                    let removedEmbed = client.util.embed()
                        .setTitle('Role removed')
                        .setColor(client.misc.color)
                        .setDescription(`The role **${roleToRemove.name}** has been removed from \`${userToRemove.tag}\``)
                    return await interaction.reply({
                        embeds: [removedEmbed]
                    })
                } catch (e) {
                    return await interaction.reply({
                        content: e.message,
                        ephemeral: true
                    })
                }
            break;
        }
    },
    generateHex() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }
};