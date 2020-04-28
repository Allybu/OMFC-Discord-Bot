resolve = require('path').resolve
module.exports = {
    name: '/turnamentinfo',
    description: 'Turnament Info',
    execute(msg, args) {

        msg.channel.send('Turnier Info', {
            files: [
                resolve("test.jpg")
            ]
        });
        
    },
};