const Discord = require('discord.js');

const games = require('./games');

module.exports = {
    name: '/info',
    description: 'Gibt Infos über das angegebe Spiel aus. /info KÜRZEL',
    showInHelp: true,
    execute(msg, args) {
        console.log(args);

        if (args.length > 0) {
            // Game poll

            const game = games[args[0]];

            if (game) {
                console.log(game);

                const title = game ? game.title : args[0];
                const thumbnail = game
                    ? game.thumb
                    : 'https://i.imgur.com/WWUOKde.jpg';
                const url = game ? game.link : '';
                const color = game ? game.color : 0x00ae86;
                const info = game ? game.info : '...';
                const image = game ? game.image : null;

                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle(title)
                    .setDescription(info)
                    .setThumbnail(thumbnail)
                    .setImage(image)
                    .addField('Code:', args[0], true);

                if (url.length > 0) {
                    embed.addField('Link:', url, true);
                }

                msg.channel.send(['Info:', embed]);
            } else {
                msg.channel.send(
                    'Dieses Spiel existiert nicht in der Datenbank. Benutzt den Befehl **/list**, um eine Liste aller Spiele zu sehen.'
                );
            }

            // msg.delete({ timeout: 10000 });
        } else {
            msg.delete({ timeout: 1000 });
        }
    },
};
