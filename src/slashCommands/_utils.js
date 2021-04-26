const Discord = require('discord.js');
const axios = require('axios');

const appId = process.env.APP_ID;
// const discordUrl = ' https://discord.com';

const createMessageData = async (client, response, interaction) => {
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
    return data;
};

const loading = (client, interaction) => {
    return client.api
        .interactions(interaction.id, interaction.token)
        .callback.post({
            data: {
                type: 5,
            },
        });
};

const editInteraction = async (client, interaction, response) => {
    const data =
        typeof response === 'object'
            ? { embeds: [response] }
            : { content: response };
    const channel = await client.channels.resolve(interaction.channel_id);
    return axios
        .patch(
            `https://discord.com/api/v8/webhooks/${appId}/${interaction.token}/messages/@original`,
            data
        )
        .then((returnData) => channel.messages.fetch(returnData.data.id));
};

const followUpMessage = async (client, interaction, response) => {
    const data =
        typeof response === 'object'
            ? { embeds: [response] }
            : { content: response };
    const channel = await client.channels.resolve(interaction.channel_id);
    return axios
        .post(
            `https://discord.com/api/v8/webhooks/${appId}/${interaction.token}`,
            data
        )
        .then((returnData) => channel.messages.fetch(returnData.data.id));
};

const deleteMessage = async (client, interaction) => {
    const channel = await client.channels.resolve(interaction.channel_id);
    return axios
        .delete(
            `https://discord.com/api/v8/webhooks/${appId}/${interaction.token}/messages/@original`
        )
        .then((returnData) => channel.messages.fetch(returnData.data.id));
};

const replyInteraction = async (client, interaction, response) => {
    const data =
        typeof response === 'object'
            ? { embeds: [response] }
            : { content: response };
    const channel = await client.channels.resolve(interaction.channel_id);
    axios
        .post(
            `https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`,
            {
                type: 4,
                data,
            }
        )
        .then((returnData) => {
            console.log(returnData.data.id);
            channel.messages.fetch(returnData.data.id);
        });
};

const reply = async (client, interaction, response) => {
    const data = await createMessageData(client, response, interaction);
    return client.api
        .interactions(interaction.id, interaction.token)
        .callback.post({
            data: {
                type: 4,
                data,
            },
        });
};

const getChannel = (client, interaction) => {
    return client.channels.cache.find((c) => c.id === interaction.channel_id);
};

module.exports = {
    reply,
    loading,
    editInteraction,
    replyInteraction,
    followUpMessage,
    deleteMessage,
    getChannel,
};
