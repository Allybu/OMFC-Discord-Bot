const Discord = require("discord.js");
const axios = require('axios');


module.exports = {
    name: '/stats',
    description: 'Stats!',
    execute(msg, args, botState) {
        console.log(args);

        if (args[0]) {
            console.log('Get stats for:', args[0]);

            axios.get(`https://raider.io/api/v1/characters/profile?region=EU&realm=malygos&name=${args[0]}&fields=gear,guild,raid_progression,mythic_plus_ranks,mythic_plus_scores_by_season:current`)
                .then(response => {

                    const data = response.data;

                    const name = data.name;
                    const race = data.race;
                    const spec = data.active_spec_name;
                    const className = data.class;
                    const archievements = data.achievement_points;
                    const image = data.thumbnail_url;
                    const profileUrl = data.profile_url;
                    const itemLevel = data.gear.item_level_equipped

                    console.log(data.mythic_plus_scores_by_season);

                    const mythicScore = data.mythic_plus_scores_by_season[0].scores.all
                    /*
                    const rankRealmDPS = data.mythic_plus_ranks.class_dps.realm;
                    const rankRealmHeal = data.mythic_plus_ranks.class_healer.realm;
                    const rankRealmTank = data.mythic_plus_ranks.class_tank.realm;
                    */

                    const raidSummery = data.raid_progression["castle-nathria"].summary

                    const embed = new Discord.MessageEmbed()
                        .setColor('#a330c9')
                        .setTitle(name)
                        .addField(name, `${spec} ${className}`)
                        .addField("Gear", `Itemlevel: ${itemLevel}`)
                        .addField("Score", `Mythic+ Score: ${mythicScore}, Castle Nathria: ${raidSummery}`)
                        //.addField("Mythic+ Rank Realm", `TANK: ${rankRealmTank}, DPS: ${rankRealmDPS}, HEAL: ${rankRealmHeal}`)
                        .setFooter("Raider.io stats")
                        .addField("Profil", profileUrl, true)
                        .setThumbnail(image)

                    msg.channel.send([embed]);

                    msg.delete();
                })
                .catch(error => {
                    console.log(error);
                });

        } else {
            console.log('Get stats for OFMC');
        }

    },
  };