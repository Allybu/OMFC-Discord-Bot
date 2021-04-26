/* eslint-disable global-require */

const interactions = require('discord-slash-commands-client');

const guildCommands = true;

const commands = {
    game: require('./slashCommands/game'),
};

const listenForCommands = async (client) => {
    const interactionClient = new interactions.Client(
        process.env.DISCORD_TOKEN,
        client.user.id
    );

    // list all your existing commands.
    // interactionClient.getCommands().then(commands => console.log(JSON.stringify(commands, null, ' '))).catch(console.error);

    // Delete guild command
    // interactionClient
    //     .deleteCommand('834742935450943509', process.env.GUILD_ID)
    //     .then(console.log)
    //     .catch(console.error);

    // Delete command
    // interactionClient
    //     .deleteCommand('835952705772060678')
    //     .then(console.log)
    //     .catch(console.error);

    // Create / update all slash commands
    Object.keys(commands).forEach((commandKey) => {
        const command = commands[commandKey];
        interactionClient
            .createCommand(
                command.config,
                !guildCommands ? null : process.env.GUILD_ID
            )
            .then((c) =>
                console.log('Registered/updated slash command:', commandKey, c)
            )
            .catch(console.error);
    });

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const command = interaction.data.name.toLowerCase();
        const { options } = interaction.data;

        if (commands[command]) {
            return commands[command].execute(client, options, interaction);
        }
        return client.api
            .interactions(interaction.id, interaction.token)
            .callback.post({
                data: {
                    type: 3,
                    data: {
                        content:
                            'Dieser Befehl wurde noch nicht implementiert... 🙁',
                    },
                },
            });

        // const channel = getChannelById(client, interaction.channel_id);
        //
        // console.log(channel);
        //
        // channel.send('ok');

        // if (command === 'game') {
        //     // here you could do anything. in this sample
        //     // i reply with an api interaction
        //     client.interaction(interaction.id, interaction.token)
        //         .callback.post({
        //             data: {
        //                 type: 4,
        //                 data: {
        //                     content: 'hello world!!!',
        //                 },
        //             },
        //         });
        // }
    });
};

module.exports = {
    listenForCommands,
};
