const Discord = require("discord.js");

const games = require("./games");

let printUrls = false;

module.exports = {
    name: '/play',
    description: 'Play!',
    execute(msg, args, botState) {
        console.log(args);

        const user = msg.member.user;
        const username = user.username;
        const userImage = "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png";

        if(args.length > 0){
            //Game poll

            const game = games[args[0].toLowerCase()];
            let message = 'Gib einen Daumen hoch, wenn du dabei bist.';
            if (args.length > 1) {
                args.shift();
                message = args.join(' ');
            }

            if (game) {
                console.log(game);

    
                const title = (game ? game.title : args[0]) + "?";
                const thumbnail = game ? game.thumb : "https://i.imgur.com/YaSVaiE.jpg";
                const url = game ? game.link : "";
                const color = game ? game.color : 0x00AE86;

                const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setTitle(title)
                .setAuthor(username, userImage)
                .setDescription(message)
                .setFooter("Abstimmung")
                .setThumbnail(thumbnail)
                .setTimestamp()
                

                if(url.length > 0 && printUrls){
                    embed.addField("Link:", url, true);
                }
                
                /*const printTime = '22:31';
                if(printTime){
                    let date = new Date();
                    let [hours, minutes, seconds] = printTime.split(':');
                    date.setHours(+hours);
                    date.setMinutes(minutes);
                    date.setSeconds(0);
                    embed.setTimestamp(date);
                }*/
    
                msg.channel.send(["Abstimmung:", embed]).then(messageReaction => {
                    messageReaction.react("👎");
                    messageReaction.react("👍");
                });
            } else {
                msg.channel.send("Dieses Spiel existiert nicht in der Datenbank. Benutzt den Befehl **/list**, um eine Liste aller Spiele zu sehen.");
            }

            msg.delete();
        }else{
            msg.channel.send(`**${username}** hat langeweile. Starte jetzt einen Spielevorschlag.`);
            msg.delete();
        }
        
    },
  };