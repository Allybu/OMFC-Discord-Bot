const Discord = require('discord.js');
const moment = require('moment');
const { setDungeonInvites, deleteDungeonInvites } = require('../jobs');

const guildId = process.env.GUILD_ID;

moment.locale('de');

const dungeons = [
    {
        short: 'nw',
        name: 'Necrotic Wake',
        image:
            'https://render-eu.worldofwarcraft.com/zones/the-necrotic-wake-small.jpg',
    },
    {
        short: 'mot',
        name: 'Mists of Tirna Scithe',
        image:
            'https://render-eu.worldofwarcraft.com/zones/mists-of-tirna-scithe-small.jpg',
    },
    {
        short: 'spa',
        name: 'Spires of Ascension',
        image:
            'https://render-eu.worldofwarcraft.com/zones/spires-of-ascension-small.jpg',
    },
    {
        short: 'hoa',
        name: 'Halls of Atonement',
        image:
            'https://render-eu.worldofwarcraft.com/zones/halls-of-atonement-small.jpg',
    },
    {
        short: 'pf',
        name: 'Plaguefall',
        image:
            'https://render-eu.worldofwarcraft.com/zones/plaguefall-small.jpg',
    },
    {
        short: 'sd',
        name: 'Sanguine Depths',
        image:
            'https://render-eu.worldofwarcraft.com/zones/sanguine-depths-small.jpg',
    },
    {
        short: 'dos',
        name: 'De Other Side',
        image:
            'https://render-eu.worldofwarcraft.com/zones/de-other-side-small.jpg',
    },
    {
        short: 'top',
        name: 'Theater of Pain',
        image:
            'https://render-eu.worldofwarcraft.com/zones/theater-of-pain-small.jpg',
    },
];

module.exports = {
    name: '/m+',
    description: 'M+ Runs!',
    execute: async (msg, args) => {
        // 1 /m+ Andere Beschreibung
        // 2 /m+ nw13
        // 3 /m+ nw13 22.02.2021 19:00
        // 4 /m+ nw13 22.02.2021 19:00 Optionale Beschreibung kann hier stehen.

        // User info
        const dateIcon = ':date:';
        const clockIcon = ':clock1:';
        const { user } = msg.member;
        const guild = msg.client.guilds.cache.get(guildId);
        // get discord member
        const discordGuildMember = await guild.members.cache.find((member) => {
            return member.user.id === user.id;
        });
        const username = discordGuildMember.nickname || user.username;
        const userImage = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

        // parse command
        if (args.length > 0) {
            // check if delete
            if (args[0] === 'delete') {
                const title = args.splice(1, args.length + 1).join(' ');
                deleteDungeonInvites(msg.client, title, username);
            } else {
                // Get Dungeon
                const dungeon = dungeons.find((d) =>
                    args[0].toLowerCase().includes(d.short)
                );
                let embed;
                if (!dungeon) {
                    // simple mode
                    embed = new Discord.MessageEmbed()
                        .setColor('#fb8554')
                        .setTitle(args.splice(1, args.length + 1).join(' '))
                        .setAuthor(username, userImage)
                        .setFooter('Mythic+ invite')
                        .setThumbnail('https://i.imgur.com/ycqGUMQ.jpg');
                } else {
                    // complex mode
                    const plus =
                        args[0].split(dungeon.short).length > 1
                            ? args[0].split(dungeon.short)[1]
                            : '';
                    const dungeonName = `${dungeon.name} +${plus}`;
                    const dungeonImage = dungeon.image;

                    embed = new Discord.MessageEmbed()
                        .setColor('#fb8554')
                        .setTitle(dungeonName)
                        .setAuthor(username, userImage)
                        .setFooter('Mythic+ invite')
                        .setThumbnail(dungeonImage);

                    let description = '';
                    if (args.length > 3) {
                        description = `${args
                            .splice(3, args.length + 1)
                            .join(' ')}\n\n`;
                    }
                    if (args.length > 2) {
                        const dateParsed = moment(
                            `${args[1]}-${args[2]}`,
                            'DD.MM.YYYY-hh:mm'
                        );
                        const day = dateParsed.format('dddd');
                        description += `${dateIcon} ${day}, ${args[1]}\n${clockIcon} ${args[2]} Uhr`;
                    } else if (args.length > 1) {
                        const dateParsed = moment(args[1], 'DD.MM.YYYY');
                        const day = dateParsed.format('dddd');
                        description += `${dateIcon} ${day}, ${args[1]}`;
                    }
                    if (description) {
                        embed.setDescription(description);
                    }
                }

                setDungeonInvites(msg.client, embed);
            }
        } else {
            // Print info about command
        }

        msg.delete();
    },
};
