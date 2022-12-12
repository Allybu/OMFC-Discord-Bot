/* eslint-disable no-async-promise-executor */
const Discord = require('discord.js');
const moment = require('moment');

moment.locale('de');

require('dotenv').config();
// const rs = require('rocket-store');

const {
    // reply,
    loading,
    // editInteraction,
    // replyInteraction,
    followUpMessage,
    deleteMessage,
    getChannel,
    // getMultipleGameData,
    // getGameRequest,
    // getNumberEmoji,
    // getEmojiNumber,
    // getGameEmbedById,
    // getStatusColor,
    // getGameEmbedsByIds,
} = require('./_utils');

const name = 'wow';

const getIdentifier = (key) => `${name}:${key}`;

const createRaidEmbed = (subCommandOptions, updated) => {
    const date = subCommandOptions[0].options[0].value;
    const time = subCommandOptions[0].options[1].value;
    let title = subCommandOptions[0].options[2].value;

    if (updated) {
        title = `UPDATED: ${title}`;
    }

    // Parse Date
    const dateRaw = `${date} ${time}`;
    const dateParsed = moment(dateRaw, 'DD.MM.YYYY hh:mm');
    const day = dateParsed.format('dddd');

    const wowIcon = '<:WorldOfWarcraft:713094112026427522>';
    const dateIcon = ':date:';
    const clockIcon = ':clock1:';

    const message =
        'Melde dich hier an, indem du auf diese Nachricht mit deiner Hauptrolle reagierst.';

    const description = `${message}\n\n${dateIcon} ${day}, ${date}\n${clockIcon} ${time} Uhr`;

    // await deleteMessage(client, interaction);
    return new Discord.MessageEmbed()
        .setTitle(`${wowIcon} ${title}`)
        .setDescription(description)
        .setFooter(getIdentifier('raid'));
};

// /raid 14.12.2022 19:30 Vault of the Incarnates

module.exports = {
    identifier: name,
    channelNames: ['invitechannel'],
    config: {
        name,
        description: 'Alles rund um WOW',
        default_permission: true,
        options: [
            {
                type: 2,
                name: 'raid',
                description: 'Erstelle und verwalte Raid invites',
                options: [
                    {
                        type: 1,
                        name: 'add',
                        description: 'Erstelle eine neue Raid Karte',
                        options: [
                            {
                                type: 3,
                                name: 'date',
                                description: 'Datum',
                                required: true,
                            },
                            {
                                type: 3,
                                name: 'time',
                                description: 'Zeit',
                                required: true,
                            },
                            {
                                type: 3,
                                name: 'titel',
                                description: 'Raid Titel',
                                required: true,
                            },
                        ],
                    },
                    {
                        type: 1,
                        name: 'edit',
                        description: 'Editiere den Inhalt einer Raid Karte',
                        options: [
                            {
                                type: 3,
                                name: 'date',
                                description: 'Datum',
                                required: true,
                            },
                            {
                                type: 3,
                                name: 'time',
                                description: 'Zeit',
                                required: true,
                            },
                            {
                                type: 3,
                                name: 'titel',
                                description: 'Raid Titel',
                                required: true,
                            },
                            {
                                type: 3,
                                name: 'id',
                                description: 'Id der Karte',
                                required: true,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    showInHelp: true,
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
        } else if (data.key === 'raid') {
            const fieldName = 'Teilnehmer:';
            const embed = data.reaction.message.embeds[0];
            const field = embed.fields.find((f) => f.name === fieldName);

            const { result, rosterString } = data.roster;

            const value = `${rosterString}\n -------- \n${result}`;

            if (field) {
                field.value = value;
            } else {
                embed.addField(fieldName, value);
            }
            data.reaction.message.edit(embed);
        }
    },
    // eslint-disable-next-line consistent-return
    async execute(client, options, interaction) {
        const subCommand = options[0].name;
        const subCommandOptions = options[0].options;

        if (subCommand === 'raid') {
            if (subCommandOptions[0].name === 'add') {
                await loading(client, interaction);

                const embed = createRaidEmbed(subCommandOptions);

                followUpMessage(client, interaction, embed).then(
                    (messageReaction) => {
                        messageReaction.react('<:roleheal:748830899541639188>');
                        messageReaction.react('<:roledd:748831003954511872>');
                        messageReaction.react('<:roletank:748830972086059088>');
                    }
                );
            } else if (subCommandOptions[0].name === 'edit') {
                await loading(client, interaction);

                const embed = createRaidEmbed(subCommandOptions, true);
                const messageId = subCommandOptions[0].options[3].value;

                const channel = await getChannel(client, interaction);

                await channel.messages.fetch();

                const msgToEdit = channel.messages.cache.find((msg) => {
                    return msg.id === messageId;
                });

                await msgToEdit.edit(embed).catch((e) => {
                    console.error('Cant edit message', e);
                });

                await deleteMessage(client, interaction);
            }
        }
    },
};
