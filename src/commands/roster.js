const { setNewRoster } = require('../jobs');

module.exports = {
    name: '/roster',
    description: 'Roster!',
    execute(msg) {
        setNewRoster(msg.client);
        msg.delete();
    },
};
