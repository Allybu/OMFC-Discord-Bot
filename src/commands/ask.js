const Discord = require('discord.js');

module.exports = {
    name: '/ask',
    description: 'Ask!',
    showInHelp: false,
    execute(msg, args) {
        console.log(args);

        const { user } = msg.member;
        const { username } = user;
        const userImage = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

        if (args.length > 0) {
            // poll

            // /ask Das ist eine Frage? 🤓 🎤 ♟

            const joinedArgs = args.join(' ');
            const question = `${joinedArgs.split('?')[0]}?`;
            const reactions = joinedArgs.split('?')[1].trim().split(' ');

            const embed = new Discord.MessageEmbed()
                .setTitle(question)
                .setAuthor(username, userImage)
                .setFooter('Abstimmung')
                .setTimestamp();

            msg.channel.send(embed).then((messageReaction) => {
                reactions.forEach((r) => {
                    messageReaction.react(r);
                });
            });
        }
        msg.delete();
    },
};
