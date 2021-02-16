const { setNewRoster } = require('./../jobs');

module.exports = {
    name: '/roster',
    description: 'Roster!',
    execute(msg, args, botState) {
        setNewRoster(msg.client);
        msg.delete();
    },
  };