const Discord = require('discord.js');

module.exports = {
    name: '/help',
    description: 'Help!',
    execute(msg, args) {
        console.log(args);

        const embed = new Discord.MessageEmbed()
            .setTitle('Eine Liste aller nützlichen Befehle')
            .setThumbnail('https://i.imgur.com/YaSVaiE.jpg')
            .addField(
                '/list',
                'Gibt eine Liste aller Spiele mit dazugehörigem Kürzel aus.'
            )
            .addField('/info KÜRZEL', 'Gibt Infos über das angegebe Spiel aus.')
            .addField(
                '/play KÜRZEL',
                'Startet ein Voting für das angegebene Spiel.'
            )
            .addField(
                '/play KÜRZEL TEXT',
                'Startet ein Voting für das angegebene Spiel mit eigenem Text.'
            )
            .addField(
                '/team random',
                'Verteilt alle Spieler im derzeitigen Voice-Channel auf die 4 Teams.'
            )
            .addField(
                '/team random X',
                'Verteilt alle Spieler im derzeitigen Voice-Channel auf X Teams. (Maximal 4)'
            )
            .addField('/team clear', 'Entfert die Team-Zuweisungen')
            .addField(
                '/server KÜRZEL IP',
                'Erstellt eine Info-Karte über den Server.'
            );

        msg.channel.send(['Info:', embed]);
    },
};
