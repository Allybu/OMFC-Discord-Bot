/* eslint-disable no-async-promise-executor */
// const Discord = require('discord.js');
require('dotenv').config();

const {
    // reply,
    loading,
    editInteraction,
    // replyInteraction,
    // followUpMessage,
    deleteMessage,
    getChannel,
    getMultipleGameData,
    // getGameRequest,
    // getNumberEmoji,
    // getEmojiNumber,
    // getGameEmbedById,
    getGameEmbedsByIds,
} = require('./_utils');

const lanGames = require('../../config/langames.json');

module.exports = {
    config: {
        name: 'lan',
        description: 'Alles rund um LAN Party',
        default_permission: true,
        options: [
            {
                type: 1,
                name: 'join',
                description: 'Mach mit :D',
            },
            {
                type: 1,
                name: 'leave',
                description: 'Tschüss :(',
            },
            {
                type: 1,
                name: 'listGames',
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
        ],
    },
    showInHelp: false,
    // eslint-disable-next-line consistent-return
    async execute(client, options, interaction) {
        const subCommand = options[0].name;
        const subCommandOptions = options[0].options;

        const channel = await getChannel(client, interaction);

        if (subCommand === 'listgames') {
            await loading(client, interaction, true);

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

                return editInteraction(client, interaction, description, true);
            }

            // await editInteraction(client, interaction, 'List:');

            // await followUpMessage(client, interaction, 'test');

            // await followUpMessage(client, interaction, 'ok');

            // lanGames.forEach((game) => {

            // })
        }
    },
};
