const insultList = [
    'Idtiot',
    'Arschloch',
    'Pissnelke',
    'Wixxkind',
    'Hurensohn',
    'Schweineprister',
    'dummes Kind',
    'Sohn eines Esels, der eine Ente gefickt hat',
    'Missgestalt',
    'Missgeburt',
    'Hundesohn',
    'Noob',
    'Witzfigur',
    'Vogel',
    'Knoten',
];

function getRandomInsult() {
    return insultList[Math.floor(Math.random() * insultList.length)];
}

module.exports = {
    name: '/insult',
    description: 'Insult!',
    showInHelp: false,
    execute(msg) {
        if (msg.mentions.users.size) {
            const taggedUser = msg.mentions.users.first();
            msg.channel.send(
                `${taggedUser.username}, du ${getRandomInsult()}!`
            );
        } else {
            msg.reply('Du musst jemanden taggen!');
        }
    },
};
