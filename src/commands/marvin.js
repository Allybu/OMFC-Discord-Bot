// Zitate

const quotes = [
    "Das Leben - hasse oder ignoriere es, lieben kannst du's nicht.",
    'Ich will nicht ausgerechnet jetzt sterben. Ich hab immer noch Kopfschmerzen. Und ich will nicht mit Kopfschmerzen in den Himmel kommen. Da wär ich schlecht gelaunt und hätte überhaupt keinen Spaß an der Sache!',
    'Ich brauche nur irgend jemanden anzusprechen, und schon hasst er mich.',
    'Leben, erzähl mir bloß nichts vom Leben.',
    'Soll ich mich solange in eine Ecke setzen und vor mich hin rosten oder einfach gleich hier, wo ich stehe auseinanderfallen?',
    'Ihr solltet vielleicht zur Kenntnis nehmen, dass ich sehr niedergeschlagen bin.',
    'Ich habe mit dem Computer gesprochen. - Er mag mich nicht.',
    "Seht mich an, ein Gehirn von der Größe eines Planeten, und man verlangt von mir, ein Chat-Bot auf diesem Discord Server zu sein. Nennt man das vielleicht berufliche Erfüllung? Ich jedenfalls tu's nicht.",
    'Das funktioniert ja doch nicht. Mein Grips ist zu gewaltig.',
    'Ist das alles?',
    'Das macht mir alles keinen Spaß.',
    'Ihr könnt euch bei der Sirius Cybernetics Corporation bedanken, dass sie Roboter mit E.M.P. bauen.',
    'E.M.P. - Echtes menschliches Persönlichkeitsbild. Ich bin der Prototyp mit Persönlichkeitsbild. Das merkt man doch sicher, oder?',
    'Großer Schwachsinn.',
    'Du glaubst du hast Probleme? Was soll man denn tun, wenn man ein manisch-depressiver Roboter ist?',
    "Ich kann's euch nicht verübeln.",
    'Ich weiß gar nicht, was das Theater soll.',
    'Jetzt habe ich Kopfschmerzen.',
    'Grässlich, nicht war?',
];

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

module.exports = {
    name: '/marvinsaysomething',
    description: 'Marvin!',
    execute(msg) {
        const quote = getRandomQuote();
        if (quote) msg.channel.send(quote);
    },
};
