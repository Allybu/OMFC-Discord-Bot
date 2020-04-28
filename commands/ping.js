module.exports = {
  name: '/ping',
  description: 'Ping!',
  execute(msg, args) {
    console.log("Execute...");
    msg.reply('pong');
    msg.channel.send('pong');
  },
};