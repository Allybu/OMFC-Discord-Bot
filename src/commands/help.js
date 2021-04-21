const Discord = require('discord.js');

module.exports = {
    name: '/help',
    description: 'Gibt die möglichen Befehle aus.',
    showInHelp: true,
    execute(msg, args) {
        console.log(args);

        const botCommands = require('../commands');

        let description = '';
        for (const [key, value] of Object.entries(botCommands)) {
            console.log(key, value);
            if (value.showInHelp) {
                description += `\n• \`${value.name}\`: ${value.description}`;
            }
        }

        const embed = new Discord.MessageEmbed()
            .setTitle('Eine Liste aller nützlichen Befehle')
            .setThumbnail('https://i.imgur.com/WWUOKde.jpg')
            .setDescription(description);

        msg.channel.send(['Info:', embed]);

        msg.delete();
    },
};