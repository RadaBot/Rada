const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('todolist')
        .setDescription('Create, delete and manage your to do list')
        .addSubcommand((subcommand) => subcommand
            .setName('add')
            .setDescription('Add a to do list task')
            .addStringOption((option) => option
                .setName('task')
                .setDescription('What do you want the task to be?')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('delete')
            .setDescription('Delete a to do list task')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The task ID of the task you want to delete')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('view')
            .setDescription('View your to do list')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The task ID of the task you want to view')
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('edit')
            .setDescription('Edit a to do list task')
            .addStringOption((option) => option
                .setName('id')
                .setDescription('The task ID of the task you want to edit')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('newtask')
                .setDescription('The new task content')
                .setRequired(true)
            )
        ),
    category: 'Utility',
    description: 'Create, delete and manage your to do list',
    permissions: [],
    thumbnail: 'https://i.br4d.vip/cXwSd_KM.png',
    async execute(interaction, client) {
        let subcommand = interaction.options.getSubcommand();
        let member = interaction.member;
        switch (subcommand) {

            case 'view':
                let id = interaction.options.getString('id');
                let todolist = client.settings.get(member.id, 'todolist', []);
                if (!id) { // Show all
                    return await interaction.reply({
                        embeds: [await this.generateTDL(client, member)],
                        ephemeral: true
                    })
                } else { //show specific
                    if (todolist.filter(entry => entry.id === id.toUpperCase()).length < 1) {
                        return await interaction.reply({
                            content: `The unique to do list ID \`${id}\` was not found`,
                            ephemeral: true
                        })
                    }
                    let task = todolist.filter(task => task.id === id)[0];
                    let embed = client.util.embed()
                        .setTitle(interaction.user.username)
                        .setColor(client.misc.color)
                        .setThumbnail(this.thumbnail)
                        .addField('ID', task.id, true)
                        .addField('Content', task.text)
                    if (task.edited) {
                        embed.setFooter('Edited').setTimestamp(task.edited)
                    } else {
                        embed.setFooter('Created').setTimestamp(task.created)
                    }
                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                }
            break;

            case 'add':
                let task = interaction.options.getString('task');
                const item = {
                    id: client.Util.generateID(),
                    created: new Date(),
                    text: task,
                }
                await client.databaseHandler.addToDoListTask(member, item);
                let embed = client.util.embed()
                    .setTitle('To do list')
                    .setColor(client.misc.color)
                    .setDescription(`Added a task:\n    • ${item.text}\nThe unique ID is \`${item.id}\`\n*Want to see your to do list? Use the buttons below*`)
                let embed2 = await this.generateTDL(client, member)
                await client.buttonConfirmer.start([embed, embed2], interaction)
            break;

            case 'edit':
                let editId = interaction.options.getString('id')
                let editTask = interaction.options.getString('newtask');
                let current = client.settings.get(member.id, 'todolist', []);
                if (current.filter(entry => entry.id === editId.toUpperCase()).length < 1) {
                    return await interaction.reply({
                        content: `The unique to do list ID \`${editId}\` was not found`,
                        ephemeral: true
                    })
                }
                let filtered =  current.filter(warning => warning.id !== editId.toUpperCase());
                let toEdit =  current.filter(warning => warning.id === editId.toUpperCase());
                let toEditID = toEdit[0].id;
                let toEditText = toEdit[0].text;
                const newItem = {
                    id: toEditID,
                    created: new Date(),
                    text: editTask,
                    edited: new Date()
                }
                await client.settings.set(member.id, 'todolist', filtered);
                await client.databaseHandler.addToDoListTask(member, newItem);
                let editedEmbed1 = client.util.embed()
                    .setTitle('To do list')
                    .setColor(client.misc.color)
                    .setDescription(`Edited task \`${newItem.id}\`:\n    • \`Before:\` ${toEditText}\n    • \`After:\` ${editTask}\n*Want to see your to do list? Use the buttons below*`)
                let editedEmbed2 = await this.generateTDL(client, member)
                await client.buttonConfirmer.start([editedEmbed1, editedEmbed2], interaction)
            break;

            case 'delete':
                let toDeleteId = interaction.options.getString('id');
                let toDeleteList = client.settings.get(member.id, 'todolist', []);
                if (toDeleteList.filter(entry => entry.id === toDeleteId.toUpperCase()).length < 1) {
                    return await interaction.reply({
                        content: `The unique to do list ID \`${toDeleteId}\` was not found`,
                        ephemeral: true
                    })
                }
                let deleteFiltered = toDeleteList.filter(warning => warning.id !== toDeleteId.toUpperCase());
                let deleted = toDeleteList.filter(warning => warning.id === toDeleteId.toUpperCase());
                let deletedText = deleted[0].text;
                let deletedId = deleted[0].id;
                await client.settings.set(member.id, 'todolist', deleteFiltered);
                let deletedEmbed1 = client.util.embed()
                    .setTitle('To do list')
                    .setColor(client.misc.color)
                    .setDescription(`Deleted task \`${deletedId}\`:\n    • ${deletedText}\n*Want to see your to do list? Use the buttons below*`)
                let deletedEmbed2 = await this.generateTDL(client, member)
                await client.buttonConfirmer.start([deletedEmbed1, deletedEmbed2], interaction)
            break;

        }
    },
    async generateTDL(client, member) {
        let db = await client.settings.get(member.id, 'todolist', []);
        let embed = client.util.embed()
            .setTitle(`To do list | ${member.user.username}`)
            .setColor(client.misc.color)
            .setThumbnail(this.thumbnail)
            .setTimestamp()
        if (db.length < 1) {
            embed.setDescription('Your to do list is empty');
            return embed;
        }
        for (let i = 0; i < db.length; i++) {
            let items = db.map((e) => `\`${e.id}\` | ${e.text}`);
            embed.setDescription(items.join('\n') + `\n\n*Get more info with \`/todolist view <ID>\`*`);
        }
        return embed;
    }
};