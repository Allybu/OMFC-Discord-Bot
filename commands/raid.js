const { setInvites } = require('../jobs');

const moment = require('moment');
moment.locale('de');

module.exports = {
    name: '/raid',
    description: 'Add raid date for invite channel.',
    execute(msg, args) {

        // /raid 22.02.2021 19:00 Castle Nathria HC

        const dateRaw = `${args[0]} ${args[1]}`;

        var dateParsed = moment(dateRaw, 'DD.MM.YYYY hh:mm');

        const day = dateParsed.format('dddd');
        const dateString = args[0];
        const timeString = args[1];

        let message = '';
        if (args.length > 2) {
            message = args.splice(2, args.length + 1).join(' ');
        }

        const wowIcon = '<:WorldOfWarcraft:713094112026427522>';
        const dateIcon = ':date:';
        const clockIcon = ':clock1:';

        setInvites(msg.client, `${wowIcon} **${message}**\n${dateIcon} ${day}, ${dateString}\n${clockIcon} ${timeString} Uhr`);
        msg.delete();


        /*
        const user = msg.member.user;
        const username = user.username;
        const userImage = "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png";

        msg.channel.send('test').then(messageReaction => {
            messageReaction.react('748830899541639188');
            messageReaction.react('748831003954511872');
            messageReaction.react('748830972086059088');
        }).then(msgReaction => createCollectorMessage(msgReaction.message));
        */

        /*
        if(args.length > 0){
            //Game poll

            const game = games[args[0]];

            const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setDescription(info)
            .setThumbnail(thumbnail)
            .setFooter("Info")
            .addField("Code:", args[0], true);

            if(url.length > 0){
                embed.addField("Link:", url, true);
            }
        
            msg.channel.send(["Info:", embed]);

            //msg.delete({ timeout: 10000 });
        }else{
            msg.delete({ timeout: 1000 });
        }
        */
    },
  };
  