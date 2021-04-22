const Discord = require('discord.js');
const botCommands = require('../commands');

module.exports = {
    name: '/help',
    description: 'Gibt die möglichen Befehle aus.',
    showInHelp: true,
    execute(msg, args) {
        console.log(args);

        let description = '';
        Object.keys(botCommands).forEach((key) => {
            console.log(key, botCommands[key]);
            if (botCommands[key].showInHelp) {
                description += `\n• \`${botCommands[key].name}\`: ${botCommands[key].description}`;
            }
        });

        const embed = new Discord.MessageEmbed()
            .setTitle('Eine Liste aller nützlichen Befehle')
            .setThumbnail('https://i.imgur.com/WWUOKde.jpg')
            .setDescription(description);

        msg.channel.send(['Info:', embed]);

        msg.delete();
    },
};
