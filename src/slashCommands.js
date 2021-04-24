/* eslint-disable global-require */
const commands = {
    game: require('./slashCommands/game'),
};

const listenForCommands = async (client) => {
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
