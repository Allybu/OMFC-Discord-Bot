/* eslint-disable no-async-promise-executor */
// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const axios = require('axios');
const Querystring = require('querystring');

const {
    // reply,
    loading,
    editInteraction,
    // replyInteraction,
    // followUpMessage,
    deleteMessage,
    getChannel,
} = require('./_utils');

require('dotenv').config();

const lanGames = require('../../config/langames.json');
// const { lang } = require('moment');

const apiKey = process.env.RAWG_API_KEY;
const rawgUrl = 'https://api.rawg.io/api';

const getRequest = async (path, data) => {
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
                    res(getRequest(`games/${gameId}`));
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
    const gameData = await getRequest(`games/${gameId}`);

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
    config: {
        name: 'game',
        description: 'Search for games and print informations about them.',
        default_permission: true,
        options: [
            {
                type: 1,
                name: 'print',
                description:
                    'Lass Marvin eine Info-Karte zu dem Spiel ausgeben.',
                options: [
                    {
                        type: 4,
                        name: 'id',
                        description: 'Game Id',
                        required: true,
                    },
                ],
            },
            {
                type: 1,
                name: 'list',
                description: 'Liste aller Lan Spiele.',
                options: [
                    {
                        type: 5,
                        name: 'displayAsCards',
                        description:
                            'Wenn ja, werden alle Spiele als einzelne Kästchen ausgegeben.',
                        required: false,
                    },
                ],
            },
            {
                type: 1,
                name: 'search',
                description: 'Marvin hilft dir, die ID eines Spiels zu finden.',
                options: [
                    {
                        type: 3,
                        name: 'title',
                        description: 'Search for a game by title.',
                        required: true,
                    },
                ],
            },
        ],
    },
    showInHelp: false,
    // eslint-disable-next-line consistent-return
    async execute(client, options, interaction) {
        const subCommand = options[0].name;
        const subCommandOptions = options[0].options;

        await loading(client, interaction);

        const channel = await getChannel(client, interaction);

        if (subCommand === 'search') {
            const search = subCommandOptions[0].value;

            const games = await getRequest(`games`, {
                search,
                search_precise: true,
                search_exact: true,
                page: 1,
                page_size: 5,
            });

            console.log(games);

            if (games && games.length) {
                let description = `**${games.length} Entries:**`;

                games.forEach((game, id) => {
                    description += `\n${getNumberEmoji(id)} ${game.name} \`${
                        game.id
                    }\``;
                });

                const embed = new Discord.MessageEmbed().setTitle(
                    'Game Search'
                );

                if (description.length) {
                    embed.setDescription(description);
                }

                // return replyInteraction(interaction, embed);

                const msg = await editInteraction(client, interaction, embed);

                games.forEach((game, id) => {
                    msg.react(getNumberEmoji(id, true));
                });

                const collector = msg.createReactionCollector(
                    (r, u) => !u.bot,
                    { time: 60000 }
                );
                collector.on('collect', async (r) => {
                    const id = getEmojiNumber(r.emoji.name);
                    if (id) {
                        const newEmbed = await getGameEmbedById(games[id].id);
                        msg.edit(newEmbed);
                        // TODO: Remove reactions!
                    }
                });

                // try {
                //     const test = await reply(client, interaction, embed, true);
                //     console.log("test??", test);
                // } catch(e) {
                //     console.error(e);
                // }
            }
        } else if (subCommand === 'print') {
            const gameId = subCommandOptions[0].value;
            const embed = await getGameEmbedById(gameId);
            return editInteraction(client, interaction, embed);
        } else if (subCommand === 'list') {
            const detailed =
                subCommandOptions && subCommandOptions.length
                    ? subCommandOptions[0].value || false
                    : false;

            if (detailed) {
                await deleteMessage(client, interaction);
                const embeds = await getGameEmbedsByIds(Object.keys(lanGames));
                embeds.forEach((embed) => {
                    channel.send(embed);
                });
            } else {
                const gameDatas = await getMultipleGameData(
                    Object.keys(lanGames)
                );

                let description = 'Folgende Spiele stehen auf der Liste:\n';

                gameDatas.forEach((gameData) => {
                    description += `\n• ${gameData.name} \`${gameData.id}\``;
                });

                const embed = new Discord.MessageEmbed()
                    .setTitle('Lan Party Spieleliste')
                    .setDescription(description)
                    .setThumbnail('https://i.imgur.com/WWUOKde.jpg');

                return editInteraction(client, interaction, embed);
            }

            // await editInteraction(client, interaction, 'List:');

            // await followUpMessage(client, interaction, 'test');

            // await followUpMessage(client, interaction, 'ok');

            // lanGames.forEach((game) => {

            // })
        }

        // if (args.length > 0) {
        //     if (args[0] === 'search') {
        //         const search = args.splice(1, args.length + 1).join(' ');
        //
        //         const games = await getRequest(`games`, {
        //             search,
        //             search_precise: true,
        //             search_exact: true,
        //             page: 1,
        //             page_size: 5,
        //         });
        //
        //         console.log(games);
        //
        //         if (games && games.length) {
        //             let description = `**${games.length} Entries:**`;
        //
        //             games.forEach((game, id) => {
        //                 description += `\n${getNumberEmoji(id)} ${
        //                     game.name
        //                 } \`${game.id}\``;
        //             });
        //
        //             const embed = new Discord.MessageEmbed().setTitle(
        //                 'Game Search'
        //             );
        //
        //             if (description.length) {
        //                 embed.setDescription(description);
        //             }
        //
        //             msg.channel.send(['Info:', embed]);
        //         }
        //     } else {
        //         const id = args[0];
        //
        //         const gameData = await getRequest(`games/${id}`);
        //
        //         if (gameData) {
        //             console.log(gameData);
        //
        //             const embed = new Discord.MessageEmbed();
        //             if (gameData.name) {
        //                 embed.setTitle(gameData.name);
        //             }
        //             if (gameData.background_image) {
        //                 embed.setThumbnail(gameData.background_image);
        //             }
        //             if (gameData.dominant_color) {
        //                 embed.setColor(gameData.dominant_color);
        //             }
        //             // if (gameData.publishers[0]) {
        //             //     const pubName = gameData.publishers[0].name;
        //             //     // const pubImage = gameData.publishers[0].image_background;
        //             //     embed.setFooter(pubName);
        //             // }
        //             if (gameData.released) {
        //                 embed.setTimestamp(gameData.released);
        //             }
        //             if (gameData.website) {
        //                 embed.setURL(gameData.website);
        //             }
        //             if (gameData.id) {
        //                 embed.setFooter(`ID: ${gameData.id}`);
        //             }
        //             if (
        //                 gameData.alternative_names &&
        //                 gameData.alternative_names.length
        //             ) {
        //                 embed.addField(
        //                     'Alt',
        //                     gameData.alternative_names.join(', '),
        //                     true
        //                 );
        //             }
        //             if (gameData.metacritic) {
        //                 embed.addField(
        //                     'Metascore',
        //                     `${getLogColor(gameData.metacritic)} ${
        //                         gameData.metacritic
        //                     }`,
        //                     true
        //                 );
        //             }
        //             if (gameData.genres && gameData.genres.length) {
        //                 const genName = gameData.genres[0].name;
        //                 // const genImage = gameData.genres[0].image_background;
        //                 embed.addField('Genre', genName, true);
        //             }
        //
        //             // Description
        //             let description = '';
        //             if (gameData.description_raw) {
        //                 description = `${
        //                     gameData.description_raw.split('.')[0]
        //                 }.${gameData.description_raw.split('.')[1]}.`;
        //             }
        //
        //             if (description.length) {
        //                 embed.setDescription(description);
        //             }
        //
        //             msg.channel.send(['Info:', embed]);
        //         } else {
        //             msg.channel.send(
        //                 'Dieses Spiel existiert nicht in der Datenbank. Benutzt den Befehl **/list**, um eine Liste aller Spiele zu sehen.'
        //             );
        //         }
        //     }
        //
        //     // msg.delete({ timeout: 10000 });
        // } else {
        //     msg.delete({ timeout: 1000 });
        // }
    },
};
