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
    // getGameRequest,
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
                name: 'listmembers',
                description: 'Listet alle auf, die sich angemeldet haben.',
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
                    },
                ],
            },
            {
                type: 1,
                name: 'printgame',
                description: 'Gibt eine Karte eines Spiels aus.',
                options: [
                    {
                        type: 4,
                        name: 'id',
                        description: 'Id des Spiels',
                        required: true,
                    },
                ],
            },
            {
                type: 1,
                name: 'listgames',
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

        if (subCommand === 'listgames') {
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
        } else if (subCommand === 'printgame') {
            await loading(client, interaction);
            const gameId = subCommandOptions[0].value;
            const embed = await getGameEmbedById(gameId, getIdentifier('game'));
            await deleteMessage(client, interaction);
            channel.send(embed).then((messageReaction) => {
                messageReaction.react('<:mine:836270884536057926> ');
            });
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
            console.log('ok');
            if (subCommandOptions[0].name === 'printinvitebox') {
                await loading(client, interaction);
                await deleteMessage(client, interaction);
                const embed = new Discord.MessageEmbed()
                    .setTitle('Anmeldung')
                    .setDescription(
                        'Melde dich hier an, indem du auf diese Nachricht mit einer Reaktion deiner Wahl reagierst.'
                    )
                    .setFooter(getIdentifier('invite'));
                channel.send(embed);
                // channel.send(embed).then((messageReaction) => {
                //     messageReaction.react('<:_Check:778760038109544448> ');
                // });
            }
        }
    },
};
