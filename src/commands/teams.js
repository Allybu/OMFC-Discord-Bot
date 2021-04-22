const Discord = require('discord.js');

const lanMode = false;

async function createTeams(message, max, remove, callback) {
    const originChannel = message.member.voice.channel;

    if (!originChannel && !remove && callback) {
        callback('novoice');
        return;
    }

    console.log(`Channel: ${originChannel.id}`);

    // Getting Roles

    const roleNames = [
        'Blaues Team',
        'Rotes Team',
        'Grünes Team',
        'Gelbes Team',
    ];
    const allRoles = [];
    const roles = [];
    let count = 0;
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const roleId in roleNames) {
        const roleName = roleNames[roleId];

        const role = message.guild.roles.cache.find((r) => r.name === roleName);

        if (role) {
            allRoles.push(role);
            if (count < max) {
                roles.push({
                    role,
                    counter: 0,
                    members: [],
                });
                count += 1;
            }
        } else {
            console.warn(`Role ${roleName} does not exist!`);
        }
    }

    console.log(roles);

    const { members } = originChannel;

    const memberSize = members.size;

    const maxSizePerTeam = Math.ceil(memberSize / count);

    const memberAssignments = [];
    function assignRandomRole(member) {
        const availableRoles = roles.filter(
            (role) => role.counter < maxSizePerTeam
        );
        if (availableRoles.length > 0) {
            const randomRole =
                availableRoles[
                    Math.floor(Math.random() * availableRoles.length)
                ];
            randomRole.counter += 1;
            memberAssignments.push({
                member,
                role: randomRole.role,
            });
            randomRole.members.push(member);
            // member.roles.add(randomRole);
        }
    }

    function removeAllRoles(member) {
        return new Promise((resolve, reject) => {
            const promiseArray = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const role of allRoles) {
                promiseArray.push(member.roles.remove(role));
            }
            Promise.all(promiseArray)
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    // const removeAllRolesArray = [];
    // eslint-disable-next-line no-restricted-syntax,no-unused-vars
    for (const [memberID, member] of members) {
        assignRandomRole(member);
        // eslint-disable-next-line no-await-in-loop
        await removeAllRoles(member);
    }

    console.log('finished');

    if (!remove) {
        // eslint-disable-next-line no-restricted-syntax
        for (const roleAssigment of memberAssignments) {
            roleAssigment.member.roles.add(roleAssigment.role);
        }

        if (callback) {
            callback(roles);
        }
    }

    // Getting Members of channel
}

// /team random
// Verteilt alle Spieler im derzeitigen Voice-Channel auf die 4 Teams.

// /team random X
// Verteilt alle Spieler im derzeitigen Voice-Channel auf X Teams. (Maximal 4)

// /team clear
// Entfert die Team-Zuweisungen

module.exports = {
    name: '/team',
    description:
        'Mit diesem Befehl kann man den Spielern im aktuallen Voice chat in random-teams einteilen. /team random (X)',
    showInHelp: true,
    execute(msg, args) {
        console.log(args);

        if (lanMode) {
            if (args.length > 0) {
                // eslint-disable-next-line default-case
                switch (args[0]) {
                    case 'clear':
                    case 'remove':
                        createTeams(msg, 0, true);
                        break;
                    case 'random':
                        createTeams(
                            msg,
                            args[2] ? args[2] : 4,
                            false,
                            (roles) => {
                                if (roles === 'novoice') {
                                    msg.reply(
                                        'Du musst dich zunächst in einen Voice-Channel begeben.'
                                    );
                                } else {
                                    // eslint-disable-next-line no-restricted-syntax
                                    for (const roleObject of roles) {
                                        if (roleObject.counter > 0) {
                                            const roleName =
                                                roleObject.role.name;
                                            const { color } = roleObject.role;
                                            const memerList =
                                                roleObject.members;

                                            let description = '';

                                            // eslint-disable-next-line no-restricted-syntax
                                            for (const member of memerList) {
                                                description += `${member.displayName}\n`;
                                            }

                                            const embed = new Discord.MessageEmbed()
                                                .setTitle(roleName)
                                                .setDescription(description)
                                                .setColor(color);

                                            msg.channel.send(['Liste:', embed]);
                                        }
                                    }
                                }
                            }
                        );
                        break;
                }
            }
        } else {
            msg.channel.send(
                'Diese Funktion steht zur Zeit nicht zur verfügung. 😥'
            );
        }

        msg.delete();
    },
};
