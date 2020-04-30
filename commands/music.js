const ytdl = require('ytdl-core');

function addToQueue(msg, url, botState) {

    console.log(botState.servers)

    if(!botState.servers[msg.guild.id])  botState.servers[msg.guild.id] = {
        queue: []
    }

    let server = botState.servers[msg.guild.id];

    ytdl.getInfo(url, (err, info) => {
        if (err) throw err;

        server.queue.push({
            url: url,
            title: info.title
        });

    });

    

    console.log(botState);

}

function play(botState){

    

}

module.exports = {
    name: '/music',
    description: 'Music!',
    execute(msg, args, botState) {
        console.log(args);

        if(args.length > 0){
    
            switch(args[0]){
                case "add":
                    if (args[1]) {
                        addToQueue(msg, args[1], botState);
                        msg.delete();
                    } else {
                        msg.reply("So funktioniert das nicht.");
                        msg.delete();
                    }
                    break;
                case "play":
                    if (
                        botState.servers[msg.guild.id] &&
                        botState.servers[msg.guild.id].queue &&
                        botState.servers[msg.guild.id].queue.length > 0
                    ) {
                        play(botState);
                    } else {
                        msg.channel.send("Die Wiedergabeliste ist leer.");
                        msg.delete();
                    }
                    break;
                case "list":
                    if (
                        botState.servers[msg.guild.id] &&
                        botState.servers[msg.guild.id].queue &&
                        botState.servers[msg.guild.id].queue.length > 0
                    ) {
                        let list = "Wiedergabeliste: \n";

                        for (queueEntry of botState.servers[msg.guild.id].queue) {
                            list += queueEntry.title + "\n";
                        }
                        msg.channel.send(list);
                    } else {
                        msg.channel.send("Die Wiedergabeliste ist leer.");
                        msg.delete();
                    }

                    
                    break;
            }

        }else{


            
        }
        
    },
  };