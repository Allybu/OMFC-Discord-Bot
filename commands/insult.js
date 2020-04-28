const insultList = [
    "Idtiot",
    "Arschloch",
    "Pissnelke",
    "Wixkind"
];

function getRandomInsult(){
    return insultList[Math.floor(Math.random() * insultList.length)];
}

module.exports = {
    name: '/insult',
    description: 'Insult!',
    execute(msg, args) {

        if (msg.mentions.users.size) {
            const taggedUser = msg.mentions.users.first();
            msg.channel.send(`${taggedUser.username}, du ${getRandomInsult()}!`);
        } else {
            msg.reply('Please tag a valid user!');
        }
        
    },
};