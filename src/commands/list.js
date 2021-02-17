const Discord = require('discord.js');

const games = require('./games');

module.exports = {
    name: '/list',
    description: 'List!',
    execute(msg, args) {
        console.log(args);

        const embed = new Discord.MessageEmbed()
            .setTitle('Spieleliste')
            .setDescription('Folgende Spiele stehen auf der Liste:')
            .setThumbnail('https://i.imgur.com/YaSVaiE.jpg');

        // eslint-disable-next-line no-restricted-syntax
        for (const [code, game] of Object.entries(games)) {
            embed.addField(code, game.title);
        }

        msg.channel.send(['Liste:', embed]);
    },
};
