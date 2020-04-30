const Discord = require("discord.js");

async function createTeams(message, max, remove, callback){

    
    let originChannel = message.member.voice.channel;

    if(!originChannel && !remove && callback){
        callback("novoice");
        return;
    }

    console.log("Channel: " + originChannel.id);

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
        await removeAllRoles(member);
    }

    console.log("finished");

    if(!remove){
        for (const roleAssigment of memberAssignments){
            roleAssigment.member.roles.add(roleAssigment.role);
        }

        if(callback){
            callback(roles);
        }

    }







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

                        if(roles == "novoice"){
                            msg.reply("Du musst dich zunächst in einen Voice-Channel begeben.");
                        }else{
                            for(let roleObject of roles){

                                if (roleObject.counter > 0) {
                                    const roleName = roleObject.role.name;
                                    const color = roleObject.role.color;
                                    const memerList = roleObject.members;
    
                                    let description = "";
    
                                    for (const member of memerList) {
                                        description += (member.displayName + "\n");
                                    }
    
                                    const embed = new Discord.MessageEmbed()
                                    .setTitle(roleName)
                                    .setDescription(description)
                                    .setColor(color);
            
                                    msg.channel.send(["Liste:", embed]);
    
                                    
                                }
    
                                
    
                            }
                        }
                    
                        

                    });
                    break;
            }

        }else{

            // Print generall info...

            //Testig::




            
        }
        
    },
  };