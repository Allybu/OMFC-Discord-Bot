module.exports = {
    name: '/info',
    description: 'Info!',
    execute(msg, args) {
        console.log(args);
        msg.channel.send(`This server's name is: ${msg.guild.name}`);
    },
  };
  