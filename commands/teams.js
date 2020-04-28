var async = require("async");

function createTeams(message, max, remove, callback){


    //Getting Roles

    let roleNames = ['Blaues Team', 'Rotes Team', 'Grünes Team', 'Gelbes Team'];
    let allRoles = [];
    let roles = [];
    let count = 0;
    for(let roleId in roleNames){
        let roleName = roleNames[roleId];

            let role = message.guild.roles.cache.find(role => role.name === roleName);
    
            if (role) {
                allRoles.push(role);
                if(count < max){
                    roles.push({
                        role: role,
                        counter: 0,
                        members: []
                    });
                    count += 1;
                }
            
            }else{
                console.warn("Role " + roleName + " does not exist!");
            }
    }

    console.log(roles);

    let authorId = message.author.id;
    let originChannel = null;

    const channels = message.guild.channels.cache.filter(c => c.type === 'voice' && c.members.size > 0);

    for (const [channelID, channel] of channels) {
        for (const [memberID, member] of channel.members) {

            if(memberID === authorId){
                console.log("This channel!");
                originChannel = channel;
            }

        }
    }

    console.log("Channel: " + originChannel.id);

    let members = originChannel.members;

    let memberSize = members.size;

    const maxSizePerTeam = Math.ceil(memberSize/count);


    let memberAssignments = [];
    function assignRandomRole(member){
        const availableRoles = roles.filter(role => role.counter < maxSizePerTeam);
        if(availableRoles.length > 0){
            const randomRole = availableRoles[Math.floor(Math.random()*availableRoles.length)];
            randomRole.counter += 1;
            memberAssignments.push({
                member: member,
                role: randomRole.role
            });
            randomRole.members.push(member);
            //member.roles.add(randomRole);
        }
    }

    function removeAllRoles(member){
        return new Promise((resolve, reject) => {
            let promiseArray = [];
            for (const role of allRoles) {
                promiseArray.push(member.roles.remove(role));
            }
            Promise.all(promiseArray).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            })
        });
    }



    let removeAllRolesArray = [];
    for (const [memberID, member] of members) {
        assignRandomRole(member);
        removeAllRolesArray.push(removeAllRoles(member));
    }
    Promise.all(removeAllRolesArray).then(()=>{


        if(!remove){
            for (const roleAssigment of memberAssignments){

                roleAssigment.member.roles.add(roleAssigment.role);
    
            }

            if(callback){
                callback(roles);
            }

        }

       


    })







    //Getting Members of channel






}

function getTeamInfo(message){

}

module.exports = {
    name: '/team',
    description: 'Team!',
    execute(msg, args) {
        console.log(args);

        if(args.length > 0){
    
            switch(args[0]){
                case "clear":
                case "remove":
                    createTeams(msg, 0, true);
                    break;
                case "random":
                    createTeams(msg, args[2] ? args[2] : 4, false, function(roles){

                        let teaminfo = "Neue Teams: \n";

                        for(let roleObject of roles){

                            let roleName = roleObject

                        }


                        msg.channel.send(teaminfo);

                    });
                    break;
            }

        }else{

            // Print generall info...

            //Testig::




            
        }
        
    },
  };