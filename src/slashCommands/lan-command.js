/* eslint-disable no-async-promise-executor */
const Discord = require('discord.js');
require('dotenv').config();
const rs = require('rocket-store');

const {
    // reply,
    loading,
    editInteraction,
    // replyInteraction,
    // followUpMessage,
    deleteMessage,
    getChannel,
    getMultipleGameData,
    getGameRequest,
    // getNumberEmoji,
    // getEmojiNumber,
    getGameEmbedById,
    getStatusColor,
    getGameEmbedsByIds,
} = require('./_utils');

const name = 'lan';

const lanGames = require('../../config/langames.json');

const getLanMembers = async () => {
    const membersRaw = await rs.get(name, 'members');
    return membersRaw.result || [];
};

const addMemberToLan = async (member) => {
    // const members = await getLanMembers();
    // members.push(member);
    rs.post(name, 'members', member);
};

const getIdentifier = (key) => `${name}:${key}`;

module.exports = {
    identifier: name,
    channelNames: ['überblick', 'games'],
    config: {
        name,
        description: 'Alles rund um LAN Party',
        default_permission: true,
        options: [
            // {
            //     type: 1,
            //     name: 'join',
            //     description: 'Mach mit :D',
            // },
            // {
            //     type: 1,
            //     name: 'leave',
            //     description: 'Tschüss :(',
            // },
            // {
            //     type: 1,
            //     name: 'listmembers',
            //     description: 'Listet alle auf, die sich angemeldet haben.',
            // },
            {
                type: 1,
                name: 'server',
                description:
                    'Erstelle eine Karte für einen Server, damit andere leichter joinen können.',
                options: [
                    {
                        type: 4,
                        name: 'id',
                        description: 'Id des Spiels',
                        required: true,
                    },
                    {
                        type: 3,
                        name: 'ip',
                        description: 'Server IP Adresse',
                        required: true,
                    },
                    {
                        type: 3,
                        name: 'description',
                        description: 'Beschreibung',
                        required: false,
                    },
                ],
            },
            {
                type: 2,
                name: 'admin',
                description: 'Admin commands',
                options: [
                    {
                        type: 1,
                        name: 'printinvitebox',
                        description: 'Invite Box',
                        required: false,
                    },
                    {
                        type: 1,
                        name: 'printgame',
                        description: 'Game Box',
                        required: false,
                        options: [
                            {
                                type: 3,
                                name: 'id',
                                description: 'Game ID',
                                required: true,
                            },
                        ],
                    },
                ],
            },
            // {
            //     type: 1,
            //     name: 'game',
            //     description: 'Gibt eine Karte mit Infos über das Spiel aus.',
            //     options: [
            //         {
            //             type: 4,
            //             name: 'id',
            //             description: 'Id des Spiels',
            //             required: true,
            //         },
            //     ],
            // },
            {
                type: 1,
                name: 'games',
                description: 'Liste aller Lan Spiele.',
                // options: [
                //     {
                //         type: 5,
                //         name: 'displayAsCards',
                //         description:
                //             'Wenn ja, werden alle Spiele als einzelne Kästchen ausgegeben.',
                //         required: false,
                //     },
                // ],
            },
        ],
    },
    showInHelp: false,
    async reaction(data) {
        if (data.key === 'game') {
            const fieldName = 'Im Besitz von:';
            const embed = data.reaction.message.embeds[0];
            const field = embed.fields.find((f) => f.name === fieldName);
            if (field) {
                field.value = data.roster.rosterString;
            } else {
                embed.addField(fieldName, data.roster.rosterString);
            }
            data.reaction.message.edit(embed);
        } else if (data.key === 'invite') {
            const fieldName = 'Liste:';
            const embed = data.reaction.message.embeds[0];
            const field = embed.fields.find((f) => f.name === fieldName);
            if (field) {
                field.value = data.roster.rosterString;
            } else {
                embed.addField(fieldName, data.roster.rosterString);
            }
            data.reaction.message.edit(embed);
        }
    },
    // eslint-disable-next-line consistent-return
    async execute(client, options, interaction) {
        const subCommand = options[0].name;
        const subCommandOptions = options[0].options;

        const channel = await getChannel(client, interaction);

        if (subCommand === 'games') {
            const detailed =
                subCommandOptions && subCommandOptions.length
                    ? subCommandOptions[0].value || false
                    : false;

            if (detailed) {
                await loading(client, interaction, false);
                const embeds = await getGameEmbedsByIds(
                    Object.keys(lanGames),
                    getIdentifier('game')
                );
                await deleteMessage(client, interaction);
                embeds.forEach((embed) => {
                    channel.send(embed).then((messageReaction) => {
                        messageReaction.react('<:mine:836270884536057926> ');
                    });
                });
            } else {
                await loading(client, interaction, true);

                const gameDatas = await getMultipleGameData(
                    Object.keys(lanGames)
                );

                let description = 'Folgende Spiele stehen auf der Liste:\n';

                gameDatas
                    .sort((a, b) => {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    })
                    .forEach((gameData) => {
                        description += `\n• ${gameData.name} \`${gameData.id}\``;
                    });

                return editInteraction(client, interaction, description, true);
            }

            // await editInteraction(client, interaction, 'List:');

            // await followUpMessage(client, interaction, 'test');

            // await followUpMessage(client, interaction, 'ok');

            // lanGames.forEach((game) => {

            // })
        } else if (subCommand === 'join') {
            await loading(client, interaction, true);

            await addMemberToLan({
                nick: interaction.member.nick,
                userId: interaction.member.user.id,
                games: [],
            });

            const description = `Willkommen bei der LAN ${interaction.member.nick}!`;

            return editInteraction(client, interaction, description, true);
        } else if (subCommand === 'listmembers') {
            await loading(client, interaction, true);
            const members = await getLanMembers();

            console.log('members', members);

            const membersWithOnlineState = await Promise.all(
                members.map(
                    (member) =>
                        new Promise(async (res) => {
                            const user = client.users.cache.get(member.userId);
                            const memberWithOnlineState = member;
                            memberWithOnlineState.status = {
                                name: user.presence.status,
                                icon: getStatusColor(user.presence.status),
                            };
                            res(memberWithOnlineState);
                        })
                )
            );

            let description = '';

            membersWithOnlineState.forEach((m) => {
                description += `\n${m.nick} ${m.status.icon}`;
            });

            return editInteraction(client, interaction, description, true);
        } else if (subCommand === 'admin') {
            if (subCommandOptions[0].name === 'printinvitebox') {
                await loading(client, interaction);
                await deleteMessage(client, interaction);
                const embed = new Discord.MessageEmbed()
                    .setTitle('Anmeldung')
                    .setDescription(
                        'Melde dich hier an, indem du auf diese Nachricht mit einer OMFC- oder Standard-Emoji-Reaktion deiner Wahl reagierst.'
                    )
                    .setFooter(getIdentifier('invite'));
                channel.send(embed);
            }
            if (subCommandOptions[0].name === 'printgame') {
                await loading(client, interaction);
                const gameId = subCommandOptions[0].options[0].value;
                const embed = await getGameEmbedById(
                    gameId,
                    getIdentifier('game')
                );
                await deleteMessage(client, interaction);
                channel.send(embed).then((messageReaction) => {
                    messageReaction.react('<:mine:836270884536057926> ');
                });
            }
        } else if (subCommand === 'server') {
            await loading(client, interaction);

            const gameId = subCommandOptions.find((s) => s.name === 'id').value;
            const serverIp = subCommandOptions.find((s) => s.name === 'ip')
                .value;

            const description = subCommandOptions.find(
                (s) => s.name === 'description'
            )
                ? subCommandOptions.find((s) => s.name === 'description').value
                : 'Ein neuer Server wurde gestartet.';

            const gameData = await getGameRequest(`games/${gameId}`);

            if (gameData) {
                const lanData = lanGames[gameId];
                const embed = new Discord.MessageEmbed();
                if (gameData.name) {
                    embed.setTitle(gameData.name);
                }
                if (gameData.background_image) {
                    embed.setThumbnail(gameData.background_image);
                }
                if (lanData && lanData.color) {
                    embed.setColor(lanData.color);
                } else if (gameData.dominant_color) {
                    embed.setColor(gameData.dominant_color);
                }
                if (gameData.website) {
                    embed.setURL(gameData.website);
                }
                // if (gameData.id) {
                //     embed.addField('Id', gameData.id, true);
                // }
                embed.addField('Server-IP', `\`${serverIp}\``);

                embed.setDescription(description);
                return editInteraction(client, interaction, embed, false);
            }
            // if (subCommandOptions[0].name === 'printinvitebox') {
            //     await loading(client, interaction);
            //     const embed = new Discord.MessageEmbed()
            //         .setTitle('Anmeldung')
            //         .setDescription(
            //             'Melde dich hier an, indem du mit <:_Check:778760038109544448> reagierst.'
            //         )
            //         .setFooter(getIdentifier('invite'));
            //
            //     channel.send(embed);
            // }
        }
    },
};
