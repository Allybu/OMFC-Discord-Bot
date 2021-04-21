const { setNewRoster } = require('../jobs');

module.exports = {
    name: '/roster',
    showInHelp: false,
    description: 'Roster!',
    execute(msg) {
        setNewRoster(msg.client);
        msg.delete();
    },
};
