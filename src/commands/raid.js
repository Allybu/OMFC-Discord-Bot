const moment = require('moment');
const { setInvites, editInvites } = require('../jobs');

moment.locale('de');

module.exports = {
    name: '/raid',
    description: 'Add raid date for invite channel.',
    execute(msg, args) {
        // /raid 22.02.2021 19:00 Castle Nathria HC

        let editMode = false;
        let id = 0;
        if (args[0] === 'edit') {
            // edit mode
            // eslint-disable-next-line prefer-destructuring
            id = args[1];
            editMode = true;
        }
        const args0Id = editMode ? 2 : 0;
        const args1Id = editMode ? 3 : 1;
        const argsSplitLength = editMode ? 4 : 2;

        const dateRaw = `${args[args0Id]} ${args[args1Id]}`;

        const dateParsed = moment(dateRaw, 'DD.MM.YYYY hh:mm');

        const day = dateParsed.format('dddd');
        const dateString = args[args0Id];
        const timeString = args[args1Id];

        let message = '';
        if (args.length > argsSplitLength) {
            message = args.splice(argsSplitLength, args.length + 1).join(' ');
        }

        const wowIcon = '<:WorldOfWarcraft:713094112026427522>';
        const dateIcon = ':date:';
        const clockIcon = ':clock1:';

        const raidTitle = `${wowIcon} **${message}**\n${dateIcon} ${day}, ${dateString}\n${clockIcon} ${timeString} Uhr`;

        if (editMode) {
            editInvites(msg.client, id, raidTitle);
        } else {
            setInvites(msg.client, raidTitle);
        }
        msg.delete();
    },
};
