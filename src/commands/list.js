const Discord = require('discord.js');

const games = require('./games');

module.exports = {
    name: '/list',
    description: 'Gibt eine Liste aller Spiele mit dazugehörigem Kürzel aus.',
    showInHelp: true,
    execute(msg, args) {
        console.log(args);

        let description = 'Folgende Spiele stehen auf der Liste:\n';
        // eslint-disable-next-line no-restricted-syntax
        for (const [code, game] of Object.entries(games)) {
            description += `\n• ${game.title} \`${code}\``;
        }

        description += `\n\n Mit dem Command \`/help\` kannst du sehen, was man mit dem Gamecode machen kann.`;

        const embed = new Discord.MessageEmbed()
            .setTitle('Spieleliste')
            .setDescription(description)
            .setThumbnail('https://i.imgur.com/WWUOKde.jpg');

        msg.channel.send(['Liste:', embed]);
    },
};
