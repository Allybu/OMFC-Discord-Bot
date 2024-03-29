/* eslint-disable no-async-promise-executor */

const Discord = require('discord.js');
const axios = require('axios');
const Querystring = require('querystring');

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

const getMsgObject = async (client, msg) => {
    const channel = client.channels.cache.find((c) => c.id === msg.channel_id);

    await channel.messages.fetch();

    return channel.messages.cache.find((message) => {
        return message.id === msg.id;
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
    const msg = await client.api
        .webhooks(client.user.id, interaction.token)
        .messages('@original')
        .patch({ data })
        .catch((e) => {
            console.error(e);
        });

    const message = await getMsgObject(client, msg);
    console.log(message);
    return message;
};

const followUpMessage = async (client, interaction, response, ephemeral) => {
    const data =
        typeof response === 'object'
            ? { embeds: [response] }
            : { content: response };
    if (ephemeral) {
        // eslint-disable-next-line no-bitwise
        data.flags = 1 << 6;
        data.embed = response;
    }
    const msg = await client.api
        .webhooks(client.user.id, interaction.token)
        .post({ data })
        .catch((e) => {
            console.error(e);
        });
    const message = await getMsgObject(client, msg);
    return message;
};

const deleteMessage = async (client, interaction) => {
    return client.api
        .webhooks(client.user.id, interaction.token)
        .messages('@original')
        .delete()
        .catch((e) => {
            console.error(e);
        });
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

const getStatusColor = (status) => {
    if (status === 'online' || status === 'dnd') {
        return '<:log1:806849315289038880>'; // grün
    }
    if (status === 'idle') {
        return '<:log4:806849315821191189>'; // orange
    }
    return '<:log0:806849315778723850>'; // grau
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

const getGameEmbedById = async (gameId, identifier) => {
    const gameData = await getGameRequest(`games/${gameId}`);

    if (gameData) {
        console.log(gameData);

        const lanData = lanGames[gameId];

        const embed = new Discord.MessageEmbed();

        if (identifier) {
            embed.setFooter(identifier);
        }
        if (gameData.name) {
            embed.setTitle(gameData.name);
        }
        if (gameData.background_image) {
            embed.setImage(gameData.background_image);
        }

        if (lanData && lanData.color) {
            embed.setColor(lanData.color);
        } else if (gameData.dominant_color) {
            embed.setColor(gameData.dominant_color);
        }
        if (gameData.released) {
            embed.setTimestamp(gameData.released);
        }
        if (gameData.website) {
            embed.setURL(gameData.website);
        }
        if (gameData.id) {
            embed.addField('Id', gameData.id, true);
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
        if (gameData.publishers && gameData.publishers.length) {
            embed.addField(
                'Publisher',
                gameData.publishers.map((p) => p.name).join('\n'),
                true
            );
        }
        if (gameData.developers && gameData.developers.length) {
            embed.addField(
                'Developer',
                gameData.developers.map((p) => p.name).join('\n'),
                true
            );
        }
        if (gameData.stores && gameData.stores.length) {
            embed.addField(
                'Stores',
                gameData.stores
                    .map((p) => `[${p.store.name}](https://${p.store.domain})`)
                    .join('\n'),
                true
            );
        }

        // Description
        let description = '';
        if (gameData.description_raw) {
            description = `${gameData.description_raw.split('.')[0]}.${
                gameData.description_raw.split('.')[1]
            }.`;
            if (description.length > 200) {
                description = `${description.substr(0, 200)}...`;
            }
        }

        if (description.length) {
            embed.setDescription(description);
        }

        return embed;
    }
    return null;
};

const getGameEmbedsByIds = async (idList, identifier) => {
    return Promise.all(
        idList.map(
            (gameId) =>
                new Promise(async (res) => {
                    res(getGameEmbedById(gameId, identifier));
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
    getStatusColor,
};
