const moment = require('moment');
const { setInvites } = require('../jobs');

moment.locale('de');

module.exports = {
    name: '/raid',
    description: 'Add raid date for invite channel.',
    execute(msg, args) {
        // /raid 22.02.2021 19:00 Castle Nathria HC

        const dateRaw = `${args[0]} ${args[1]}`;

        const dateParsed = moment(dateRaw, 'DD.MM.YYYY hh:mm');

        const day = dateParsed.format('dddd');
        const dateString = args[0];
        const timeString = args[1];

        let message = '';
        if (args.length > 2) {
            message = args.splice(2, args.length + 1).join(' ');
        }

        const wowIcon = '<:WorldOfWarcraft:713094112026427522>';
        const dateIcon = ':date:';
        const clockIcon = ':clock1:';

        setInvites(
            msg.client,
            `${wowIcon} **${message}**\n${dateIcon} ${day}, ${dateString}\n${clockIcon} ${timeString} Uhr`
        );
        msg.delete();
    },
};
