/* eslint-disable no-async-promise-executor */

const Discord = require('discord.js');
const axios = require('axios');
const Querystring = require('querystring');

const appId = process.env.APP_ID;
// const discordUrl = ' https://discord.com';
const lanGames = require('../../config/langames.json');
// const { lang } = require('moment');

const apiKey = process.env.RAWG_API_KEY;
const rawgUrl = 'https://api.rawg.io/api';

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

const loading = (client, interaction, ephemeral) => {
    return client.api
        .interactions(interaction.id, interaction.token)
        .callback.post({
            data: {
                type: 5,
                data: {
                    // eslint-disable-next-line no-bitwise
                    flags: ephemeral ? 1 << 6 : null,
                },
            },
        });
};

const editInteraction = async (client, interaction, response, ephemeral) => {
    const data =
        typeof response === 'object'
            ? { embeds: [response] }
            : { content: response };
    if (ephemeral) {
        // eslint-disable-next-line no-bitwise
        data.flags = 1 << 6;
        data.embed = response;
    }
    // data.content = 'ok';

    return client.api
        .webhooks(client.user.id, interaction.token)
        .messages('@original')
        .patch({ data })
        .catch((e) => {
            console.error(e);
        });
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

const getGameRequest = async (path, data) => {
    const requestData = data || {};
    requestData.key = apiKey;
    const queryString = Querystring.stringify(requestData);
    return (
        axios
            .get(`${rawgUrl}/${path}?${queryString}`)
            // eslint-disable-next-line consistent-return
            .then((returnData) => {
                if (returnData.data && returnData.data.results) {
                    return returnData.data.results;
                }
                if (returnData.data) {
                    return returnData.data;
                }
            })
            .catch((error) => error)
    );
};

const getMultipleGameData = async (idList) => {
    return Promise.all(
        idList.map(
            (gameId) =>
                new Promise(async (res) => {
                    res(getGameRequest(`games/${gameId}`));
                })
        )
    );
};

const getLogColor = (number) => {
    if (number < 25) {
        return '<:log0:806849315778723850>'; // grau
    }
    if (number < 50) {
        return '<:log1:806849315289038880>'; // grün
    }
    if (number < 75) {
        return '<:log2:806849315191914508>'; // blau
    }
    if (number < 95) {
        return '<:log3:806849315262824459>'; // lila
    }
    if (number < 100) {
        return '<:log4:806849315821191189>'; // orange
    }
    return '<:log4:806849315821191189>'; // orange TODO: gold?
};

const getNumberEmoji = (id, emoji) => {
    switch (id) {
        case 0:
            return emoji ? '1️⃣' : ':one:';
        case 1:
            return emoji ? '2️⃣' : ':two:';
        case 2:
            return emoji ? '3️⃣' : ':three:';
        case 3:
            return emoji ? '4️⃣' : ':four:';
        case 4:
            return emoji ? '5️⃣' : ':five:';
        default:
            return '';
    }
};

const getEmojiNumber = (emoji) => {
    switch (emoji) {
        case '1️⃣':
            return 0;
        case '2️⃣':
            return 1;
        case '3️⃣':
            return 2;
        case '4️⃣':
            return 3;
        case '5️⃣':
            return 4;
        default:
            return null;
    }
};

const getGameEmbedById = async (gameId) => {
    const gameData = await getGameRequest(`games/${gameId}`);

    if (gameData) {
        console.log(gameData);

        const lanData = lanGames[gameId];

        const embed = new Discord.MessageEmbed();
        if (gameData.name) {
            embed.setTitle(gameData.name);
        }
        if (gameData.background_image) {
            embed.setImage(gameData.background_image);
        }

        if (lanData.color || gameData.dominant_color) {
            embed.setColor(lanData.color || gameData.dominant_color);
        }
        // if (gameData.publishers[0]) {
        //     const pubName = gameData.publishers[0].name;
        //     // const pubImage = gameData.publishers[0].image_background;
        //     embed.setFooter(pubName);
        // }
        if (gameData.released) {
            embed.setTimestamp(gameData.released);
        }
        if (gameData.website) {
            embed.setURL(gameData.website);
        }
        if (gameData.id) {
            embed.setFooter(`ID: ${gameData.id}`);
        }
        if (gameData.alternative_names && gameData.alternative_names.length) {
            embed.addField('Alt', gameData.alternative_names.join(', '), true);
        }
        if (gameData.metacritic) {
            embed.addField(
                'Metascore',
                `${getLogColor(gameData.metacritic)} ${gameData.metacritic}`,
                true
            );
        }
        if (gameData.genres && gameData.genres.length) {
            const genName = gameData.genres.map((g) => g.name).join(', ');
            // const genImage = gameData.genres[0].image_background;
            embed.addField('Genre', genName, true);
        }

        // Description
        let description = '';
        if (gameData.description_raw) {
            description = `${gameData.description_raw.split('.')[0]}.${
                gameData.description_raw.split('.')[1]
            }.`;
        }

        if (description.length) {
            embed.setDescription(description);
        }

        return embed;
    }
    return null;
};

const getGameEmbedsByIds = async (idList) => {
    return Promise.all(
        idList.map(
            (gameId) =>
                new Promise(async (res) => {
                    res(getGameEmbedById(gameId));
                })
        )
    );
};

module.exports = {
    reply,
    loading,
    editInteraction,
    replyInteraction,
    followUpMessage,
    deleteMessage,
    getChannel,
    getMultipleGameData,
    getGameRequest,
    getLogColor,
    getNumberEmoji,
    getEmojiNumber,
    getGameEmbedById,
    getGameEmbedsByIds,
};
