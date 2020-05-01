const Discord = require("discord.js");

const games = require("./games");

module.exports = {
    name: '/info',
    description: 'Info!',
    execute(msg, args) {
        console.log(args);

        const user = msg.member.user;
        const username = user.username;
        const userImage = "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png";

        if(args.length > 0){
            //Game poll

            const game = games[args[0]];

            if (game) {
                console.log(game);

    
                const title = (game ? game.title : args[0]);
                const thumbnail = game ? game.thumb : "https://i.imgur.com/YaSVaiE.jpg";
                const url = game ? game.link : "";
                const color = game ? game.color : 0x00AE86;
                const info = game ? game.info : "...";
    
    
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
            } else {
                msg.channel.send("Dieses Spiel existiert nicht in der Datenbank. Benutzt den Befehl **/list**, um eine Liste aller Spiele zu sehen.");
            }


            //msg.delete({ timeout: 10000 });
        }else{
            msg.delete({ timeout: 1000 });
        }
    },
  };
  