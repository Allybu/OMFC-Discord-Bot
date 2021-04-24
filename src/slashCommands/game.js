// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const axios = require('axios');
const Querystring = require('querystring');

const { reply } = require('./_utils');

require('dotenv').config();

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

// eslint-disable-next-line consistent-return,no-unused-vars
const getNumberEmoji = (id) => {
    // eslint-disable-next-line default-case
    switch (id) {
        case 0:
            return ':one:';
        case 1:
            return ':two:';
        case 2:
            return ':three:';
        case 3:
            return ':four:';
        case 4:
            return ':five:';
    }
};

module.exports = {
    commandConfig: '/game',
    showInHelp: false,
    // eslint-disable-next-line consistent-return
    async execute(client, options, interaction) {
        const subCommand = options[0].name;
        const subCommandOptions = options[0].options;

        if (subCommand === 'search') {
            // todo:
        } else if (subCommand === 'print') {
            const gameId = subCommandOptions[0].value;

            const gameData = await getRequest(`games/${gameId}`);

            if (gameData) {
                console.log(gameData);

                const embed = new Discord.MessageEmbed();
                if (gameData.name) {
                    embed.setTitle(gameData.name);
                }
                if (gameData.background_image) {
                    embed.setThumbnail(gameData.background_image);
                }
                if (gameData.dominant_color) {
                    embed.setColor(gameData.dominant_color);
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
                if (
                    gameData.alternative_names &&
                    gameData.alternative_names.length
                ) {
                    embed.addField(
                        'Alt',
                        gameData.alternative_names.join(', '),
                        true
                    );
                }
                if (gameData.metacritic) {
                    embed.addField(
                        'Metascore',
                        `${getLogColor(gameData.metacritic)} ${
                            gameData.metacritic
                        }`,
                        true
                    );
                }
                if (gameData.genres && gameData.genres.length) {
                    const genName = gameData.genres[0].name;
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

                return reply(client, interaction, embed);
            }
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
