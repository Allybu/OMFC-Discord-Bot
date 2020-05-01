const Discord = require("discord.js");

const games = require("./games");

module.exports = {
    name: '/server',
    description: 'Server!',
    execute(msg, args) {
        console.log(args);

        const user = msg.member.user;
        const username = user.username;
        const userImage = "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png";

        if(args.length == 2){
            //Game poll

            const game = games[args[0]];

            if (game) {
                console.log(game);

    
                const title = (game ? game.title : args[0]) + " Server";
                const thumbnail = game ? game.thumb : "https://i.imgur.com/YaSVaiE.jpg";
                const url = game ? game.link : "";
                const color = game ? game.color : 0x00AE86;
                const info = game ? game.info : "...";
    
    
                const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setAuthor(username, userImage)
                .setTitle(title)
                .setThumbnail(thumbnail)
                .addField("IP:", args[1]);

                
            
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
  