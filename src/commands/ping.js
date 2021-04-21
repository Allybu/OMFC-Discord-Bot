module.exports = {
    name: '/ping',
    description: 'Ping!',
    showInHelp: false,
    execute(msg) {
        console.log('Execute...');
        msg.reply('pong');
        msg.channel.send('pong');
    },
};
