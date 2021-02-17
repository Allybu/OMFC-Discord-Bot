const Discord = require('discord.js');
const roster = require('./roster').Roster;

const guildId = '699595758239875152';

const setNewRoster = async (client) => {
    const channel = client.channels.cache.find((c) =>
        c.name.includes('roster')
    );
    if (channel) {
        // get guild
        const guild = client.guilds.cache.get(guildId);

        // fetch new roster data
        const members = await roster.getMembers(guild);
        const tableArray = await roster.getRosterTable(members);

        // delete old messages
        await channel.messages.fetch().then((messages) => {
            channel.bulkDelete(messages);
        });

        // send Table
        channel.send('**OMFC ROSTER**');
        tableArray.forEach((table) => {
            channel
                .send({
                    content: `\`\`\`\n${table}\`\`\``,
                })
                .catch((e) => console.error(e));
        });

        // send individual embeds

        const classData = [
            {
                name: 'Death Knight',
                color: '#C41E3A',
                emoji: '<:c_deathknight:755713345235189840>',
            },
            {
                name: 'Demon Hunter',
                color: '#A330C9',
                emoji: '<:c_demonhunter:755712896985464888>',
            },

            {
                name: 'Druid',
                color: '#FF7C0A',
                emoji: '<:c_druid:755711708852518912>',
            },
            {
                name: 'Hunter',
                color: '#AAD372',
                emoji: '<:c_hunter:755711709120823358>',
            },
            {
                name: 'Mage',
                color: '#3FC7EB',
                emoji: '<:c_mage:755711709292920832>',
            },
            {
                name: 'Monk',
                color: '#00FF98',
                emoji: '<:c_monk:755713344966623233>',
            },
            {
                name: 'Paladin',
                color: '#F48CBA',
                emoji: '<:c_paladin:755711709397909567>',
            },
            {
                name: 'Priest',
                color: '#FFFFF1',
                emoji: '<:c_priest:755711709368287262>',
            },
            {
                name: 'Rogue',
                color: '#FFF468',
                emoji: '<:c_rogue:755711709380870144>',
            },
            {
                name: 'Shaman',
                color: '#0070DD',
                emoji: '<:c_shaman:755711709469081631>',
            },
            {
                name: 'Warlock',
                color: '#8788EE',
                emoji: '<:c_warlock:755711709049651202>',
            },
            {
                name: 'Warrior',
                color: '#C69B6D',
                emoji: '<:c_warrior:755711709192126465>',
            },
        ];

        const getColorByClass = (className) => {
            return classData.find((c) => c.name === className).color;
        };

        const getEmojiByClass = (className) => {
            return classData.find((c) => c.name === className).emoji;
        };

        const getInline = (text) => {
            return `\`${text}\``;
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

        members.forEach((member) => {
            const user = member.discordGuildMember
                ? member.discordGuildMember.user
                : null;
            const discordImage = user
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                : null;

            let mythicScore = '';
            if (
                member.mythicRanks.class_tank &&
                member.mythicRanks.class_tank.realm > 0
            ) {
                mythicScore += ` <:roletank:748830899541639188>${getInline(
                    member.mythicRanks.class_tank.realm
                )}`;
            }
            if (
                member.mythicRanks.class_dps &&
                member.mythicRanks.class_dps.realm > 0
            ) {
                mythicScore += ` <:roledd:748831003954511872>${getInline(
                    member.mythicRanks.class_dps.realm
                )}`;
            }
            if (
                member.mythicRanks.class_healer &&
                member.mythicRanks.class_healer.realm > 0
            ) {
                mythicScore += ` <:roleheal:748830972086059088>${getInline(
                    member.mythicRanks.class_healer.realm
                )}`;
            }

            let warcraftLogsRankings = '';
            // let warcraftLogsAllstar = '';
            if (member.warcraftLogs) {
                const encounterOrder = [];

                // für jeden spec
                const encounters = [];
                const allStars = [];
                member.warcraftLogs.forEach((specLogs) => {
                    specLogs.data.zoneRankings.rankings.forEach((r) => {
                        const { name } = r.encounter;
                        if (!encounterOrder.find((e) => e === name)) {
                            encounterOrder.push(name);
                        }
                        if (r.rankPercent && r.spec) {
                            if (!encounters[name]) encounters[name] = [];
                            encounters[name].push({
                                spec: r.spec,
                                percent: Math.round(r.rankPercent * 10) / 10,
                            });
                        }
                    });

                    allStars.push({
                        spec: specLogs.spec,
                        percent:
                            Math.round(
                                specLogs.data.zoneRankings
                                    .bestPerformanceAverage * 10
                            ) / 10,
                    });
                });

                console.log(encounters);

                // if (allStars.length) {
                //     const maxAllPercent = Math.max.apply(
                //         Math,
                //         allStars.map((r) => r.percent)
                //     );
                //     const maxAllRanking = allStars.find(
                //         (r) => r.percent === maxAllPercent
                //     );
                //     warcraftLogsAllstar = `${getLogColor(
                //         maxAllRanking.percent
                //     )}${getInline(maxAllRanking.percent)}`;
                // }

                // TODO: Just use the best ranking if multiple
                encounterOrder.forEach((e) => {
                    if (encounters[e]) {
                        const rankings = encounters[e];

                        // eslint-disable-next-line prefer-spread
                        const maxPercent = Math.max.apply(
                            Math,
                            rankings.map((r) => r.percent)
                        );
                        const maxRanking = rankings.find(
                            (r) => r.percent === maxPercent
                        );

                        warcraftLogsRankings += `\n${e}: ${getLogColor(
                            maxRanking.percent
                        )}${getInline(maxRanking.percent)} (${
                            maxRanking.spec
                        })`;
                    }
                });
            }

            try {
                const description = `${getEmojiByClass(member.className)} ${
                    member.race
                } ${member.spec} ${member.className}`;

                const embed = new Discord.MessageEmbed()
                    .setColor(getColorByClass(member.className))
                    .setTitle(`${member.name}`)
                    .setDescription(description)
                    .setURL(member.profileUrl)
                    // .setThumbnail(member.image)
                    .setImage(member.bigImage)
                    .addField(
                        'iLvl',
                        `${getInline(member.itemLevelCombined)}`,
                        true
                    )
                    .addField(
                        'M+ Score',
                        `${getInline(member.mythicScore)}`,
                        true
                    );

                // if (warcraftLogsAllStar.length) {
                //     embed.addField('Log Rank', warcraftLogsAllStar, true);
                // }

                if (
                    member.covenant &&
                    member.covenant.level &&
                    member.covenant.name
                ) {
                    embed.addField(
                        'Covenant',
                        `${member.covenant.name} (${member.covenant.level})`,
                        true
                    );
                }

                embed
                    .addField('Progress', member.raidSummery, true)
                    .addField('Archievements', member.archievements, true);

                if (mythicScore.length) {
                    embed.addField(
                        `Mythic+ Class Realm Rank`,
                        mythicScore,
                        false
                    );
                }

                if (warcraftLogsRankings.length) {
                    embed.addField(
                        'Encounter Rankings (Heroic)',
                        warcraftLogsRankings,
                        false
                    );
                }

                if (user && discordImage && member.realName) {
                    embed.setAuthor(member.realName, discordImage);
                }

                /*
                if (user) {
                    embed.addField('Discord', `<@${user.id}>`);
                }
                */

                channel.send([embed]);
            } catch (err) {
                console.error(`Error creating embed for ${member.name}`, err);
            }
        });
    }
};

const printRole = (roleName) => {
    if (roleName === 'roletank') {
        return '<:roletank:748830899541639188>';
    }
    if (roleName === 'roleheal') {
        return '<:roleheal:748830972086059088>';
    }
    if (roleName === 'roledd') {
        return '<:roledd:748831003954511872>';
    }
    return '';
};

const inviteChannel = 'anmeldung';
const invitelogs = 'invitelog';

// const inviteChannel = 'setup';
// const invitelogs = 'invitechannel';

const setInvites = async (client, message) => {
    const channel = client.channels.cache.find((c) =>
        c.name.includes(inviteChannel)
    );
    if (channel) {
        channel
            .send(message)
            .then((msg) => {
                msg.react('748830972086059088');
                msg.react('748831003954511872');
                msg.react('748830899541639188');
                msg.react('❌');
            })
            .catch((err) => console.error(err));
    }
};

const sendInviteLog = async (options) => {
    const { content } = options.originalMessage;
    if (content.includes(':clock')) {
        // get guild
        const guild = options.client.guilds.cache.get(guildId);

        const firstLines = content.split('\n').splice(0, 3).join('\n');

        const dateString = content.split('\n')[1].trim();

        // get discord member
        const discordGuildMember = await guild.members.cache.find((member) => {
            return member.user.id === options.user.id;
        });
        // Log Message
        const role = printRole(options.reaction.emoji.name);
        let roleString = `${
            options.state ? '**abgemeldet**.' : 'die Abmeldung zurückgenommen.'
        }`;
        if (role) {
            roleString = `als ${printRole(options.reaction.emoji.name)} ${
                options.state ? 'angemeldet' : '**abgemeldet**'
            }.`;
        }
        const logMessage = `${discordGuildMember.nickname} hat sich für ${dateString} ${roleString}`;
        options.logChannel.send(logMessage);

        // Print roster:
        const delimiter = '--------------------------------';
        let rosterString = '';
        const promises = [];
        options.originalMessage.reactions.cache.each((r) => {
            promises.push(
                new Promise((resolve) => {
                    r.users.fetch().then((a) => {
                        resolve(a);
                    });
                })
            );
        });
        await Promise.all(promises);
        options.originalMessage.reactions.cache.each((r) => {
            const roleName = printRole(r.emoji.name);
            if (roleName) {
                r.users.cache
                    .filter((u) => !u.bot)
                    .each((u) => {
                        const guildMember = guild.members.cache.find(
                            (member) => {
                                return member.user.id === u.id;
                            }
                        );
                        if (guildMember.nickname) {
                            rosterString += `${roleName} ${guildMember.nickname}\n`;
                        }
                    });
            }
        });
        if (roster.length === 0) {
            rosterString = '*Keine Anmeldung*\n';
        }
        const newContent = `${firstLines}\n${delimiter}\n${rosterString}${delimiter}`;
        options.originalMessage.edit(newContent).catch((e) => {
            console.error('Cant edit message', e);
        });
    }
};

const listenForInviteReactions = async (client) => {
    const channel = client.channels.cache.find((c) =>
        c.name.includes(inviteChannel)
    );
    const logChannel = client.channels.cache.find((c) =>
        c.name.includes(invitelogs)
    );
    if (channel && logChannel) {
        await channel.messages.fetch();
        client.on('messageReactionAdd', async (reaction, user) => {
            if (
                !user.bot &&
                reaction.message.channel.name.includes(inviteChannel)
            ) {
                sendInviteLog({
                    originalMessage: reaction.message,
                    logChannel,
                    user,
                    reaction,
                    state: true,
                    client,
                });
            }
        });
        client.on('messageReactionRemove', async (reaction, user) => {
            if (
                !user.bot &&
                reaction.message.channel.name.includes(inviteChannel)
            ) {
                sendInviteLog({
                    originalMessage: reaction.message,
                    logChannel,
                    user,
                    reaction,
                    state: false,
                    client,
                });
            }
        });
    }
};

module.exports = {
    setNewRoster,
    setInvites,
    listenForInviteReactions,
};
