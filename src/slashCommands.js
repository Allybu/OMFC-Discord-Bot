/* eslint-disable global-require */
const interactions = require('discord-slash-commands-client');

const guildCommands = true;

const commands = {
    game: require('./slashCommands/game-command'),
    lan: require('./slashCommands/lan-command'),
};

const sendReaction = async (client, reaction, user, action) => {
    if (
        !user.bot &&
        reaction.message &&
        reaction.message.embeds &&
        reaction.message.embeds[0] &&
        reaction.message.embeds[0].footer &&
        reaction.message.embeds[0].footer.text
    ) {
        const identifierRaw = reaction.message.embeds[0].footer.text;
        let identifier = null;
        let key = null;
        if (identifierRaw.includes(':')) {
            const idenfifierParts = identifierRaw.split(':');
            [identifier, key] = idenfifierParts;
        } else {
            identifier = identifierRaw;
        }
        if (
            identifier &&
            commands[identifier] &&
            commands[identifier].reaction
        ) {
            const guildMemberSender = await reaction.message.guild.members.cache.find(
                (member) => {
                    return member.user.id === user.id;
                }
            );

            const promises = [];
            reaction.message.reactions.cache.each((r) => {
                promises.push(
                    new Promise((resolve) => {
                        r.users.fetch().then((a) => {
                            resolve(a);
                        });
                    })
                );
            });

            const delimiter = '--------------------------------';
            let rosterString = '';
            const stats = [];
            let count = 0;
            await Promise.all(promises);
            reaction.message.reactions.cache.each((r) => {
                const emojiPrint = `<:${r.emoji.identifier}>`;
                if (emojiPrint) {
                    const stat = { emoji: emojiPrint, count: 0 };
                    r.users.cache
                        .filter((u) => !u.bot)
                        .each((u) => {
                            const guildMember = reaction.message.guild.members.cache.find(
                                (member) => {
                                    return member.user.id === u.id;
                                }
                            );
                            if (guildMember.nickname) {
                                rosterString += `${emojiPrint} ${guildMember.nickname}\n`;
                                count += 1;
                                stat.count += 1;
                            }
                        });
                    stats.push(stat);
                }
            });
            let result = '';
            if (rosterString.length === 0) {
                rosterString = '*Leer*\n';
            } else {
                stats.forEach((s) => {
                    result += `${s.count} ${s.emoji} `;
                });
                result += `(${count})`;
            }

            const roster = {
                delimiter,
                rosterString,
                result,
            };

            // const newContent = `${firstLines}\n${delimiter}\n${rosterString}${delimiter}\n${result}\n${delimiter}`;

            return commands[identifier].reaction({
                client,
                reaction,
                key,
                user,
                guildMemberSender,
                action,
                roster,
            });
        }
    }
    return null;
};

const fetchMessages = async (client, channelName) => {
    const channel = client.channels.cache.find((c) =>
        c.name.includes(channelName)
    );
    return channel.messages.fetch();
};

const listenForCommands = async (client) => {
    const interactionClient = new interactions.Client(
        process.env.DISCORD_TOKEN,
        client.user.id
    );

    // list all your existing commands.
    // interactionClient.getCommands().then(commands => console.log(JSON.stringify(commands, null, ' '))).catch(console.error);

    // Delete guild command
    // interactionClient
    //     .deleteCommand('834742935450943509', process.env.GUILD_ID)
    //     .then(console.log)
    //     .catch(console.error);

    // Delete command
    // interactionClient
    //     .deleteCommand('835952705772060678')
    //     .then(console.log)
    //     .catch(console.error);

    // Create / update all slash commands
    Object.keys(commands).forEach((commandKey) => {
        const command = commands[commandKey];

        if (command.channelNames) {
            command.channelNames.forEach((channelName) =>
                fetchMessages(client, channelName)
            );
        }

        interactionClient
            .createCommand(
                command.config,
                !guildCommands ? null : process.env.GUILD_ID
            )
            .then((c) =>
                console.log('Registered/updated slash command:', commandKey, c)
            )
            .catch(console.error);
    });

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const command = interaction.data.name.toLowerCase();
        const { options } = interaction.data;

        if (commands[command]) {
            return commands[command].execute(client, options, interaction);
        }
        return client.api
            .interactions(interaction.id, interaction.token)
            .callback.post({
                data: {
                    type: 3,
                    data: {
                        content:
                            'Dieser Befehl wurde noch nicht implementiert... 🙁',
                    },
                },
            });

        // const channel = getChannelById(client, interaction.channel_id);
        //
        // console.log(channel);
        //
        // channel.send('ok');

        // if (command === 'game') {
        //     // here you could do anything. in this sample
        //     // i reply with an api interaction
        //     client.interaction(interaction.id, interaction.token)
        //         .callback.post({
        //             data: {
        //                 type: 4,
        //                 data: {
        //                     content: 'hello world!!!',
        //                 },
        //             },
        //         });
        // }
    });

    client.on('messageReactionAdd', async (reaction, user) => {
        sendReaction(client, reaction, user, true);
    });
    client.on('messageReactionRemove', async (reaction, user) => {
        sendReaction(client, reaction, user, false);
    });
};

module.exports = {
    listenForCommands,
};
