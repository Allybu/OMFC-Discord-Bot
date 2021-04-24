const Discord = require('discord.js');

const reply = async (client, interaction, response) => {
    const createAPIMessage = async (content) => {
        const { data, files } = await Discord.APIMessage.create(
            client.channels.resolve(interaction.channel_id),
            content
        )
            .resolveData()
            .resolveFiles();
        return { ...data, files };
    };

    let data = {
        content: response,
    };

    if (typeof response === 'object') {
        data = await createAPIMessage(response);
    }

    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data,
        },
    });
};

module.exports = {
    reply,
};
