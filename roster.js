const WowApi = require('./wowApi').WowApi;
const axios = require('axios');
var AsciiTable = require('ascii-table')

WowApi.init();

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

let wlToken = null;
let wlTokenExpireTime = 0;

async function getWarcraftLogsToken() {
    const token = `${process.env.WL_USERNAME}:${process.env.WL_PASSWORD}`;
    const encodedToken = Buffer.from(token).toString('base64');

    const { data } = await axios.post(
        'https://www.warcraftlogs.com/oauth/token',
        {
            grant_type: 'client_credentials',
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + encodedToken,
            },
        },
    );

    wlToken = data.access_token;
    wlTokenExpireTime = data.expires_in + new Date().getTime();
}

exports.Roster = {
    getRaiderIoForChar: async (character, realm) => {
        try {
            const { data } = await axios.get(`https://raider.io/api/v1/characters/profile?region=EU&realm=${realm}&name=${character}&fields=gear,guild,raid_progression,mythic_plus_ranks,mythic_plus_scores_by_season:current`);
            return data;
        } catch (error) {
            console.error(Object.keys(error), error.message); 
        }
        return null;
    },
    getWarcraftlogsData: async (character, realm, specName, metric, difficulty) => {
        console.log(`Get Warcraftlogs Data For: ${character} - ${specName} - ${difficulty}`);

        if (wlToken && wlTokenExpireTime >= (new Date().getTime() + 3000)) {
            console.log('Token exists');

        } else {
            console.log('Token expired');
            await getWarcraftLogsToken();
        }

        const body = {
            query: `{
                characterData {
                    character(
                        name: "${character}"
                        serverSlug: "${realm}"
                        serverRegion: "EU"
                    ){
                        id
                        zoneRankings(metric: ${metric}, difficulty: ${difficulty}, specName: "${specName}")
                    }
                }
            }`,
          };
        try {
            const { data } = await axios.post(
                'https://www.warcraftlogs.com/api/v2/client',
                body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + wlToken,
                    },
                },
            );
            return data.data.characterData.character;
        } catch (error) {
            console.error(Object.keys(error), error.message);
        }
        return null;
    },
    getMembers: async (guild) => {
        const roster = [];

        const members = await WowApi.getRoster();
        if (members) {

            await asyncForEach(members, async (m) => {
                if (m.rank <= 2) {
                    const char = m.character;
                    if (!char) {
                        return;
                    }

                    // get discord member
                    const discordGuildMember = await guild.members.cache.find(member => {
                        return member.nickname ? member.nickname.includes(char.name) : false;
                    });

                    let realName = '';
                    if (discordGuildMember) {
                        try {
                            realName = discordGuildMember.nickname.split('(')[1].split(')')[0];
                        }catch(e) {
                            console.warn(e);
                        }
                    }

                    const warcraftLogs = [];
                    await asyncForEach(m.specs, async (spec) => {
                        const metric = spec.role === 'HEALER' ? 'hps' : 'dps';
                        const specName = spec.name;
                        const warcraftLogsData = await this.Roster.getWarcraftlogsData(char.name, char.realm.slug, specName, metric, 4);
                        warcraftLogs.push({
                            data:warcraftLogsData,
                            spec: specName,
                        });
                    });

                    const raiderIoData = await this.Roster.getRaiderIoForChar(char.name, char.realm.slug);
                    if (!raiderIoData) {
                        return;
                    }

                    const character = await WowApi.getCharacter(char.name, char.realm.slug);
                    const characterMedia = await WowApi.getCharacterMedia(char.name, char.realm.slug);
                    console.log(character);

                    const race = character.race.name;
                    const className = character.character_class.name;
                    const spec = character.active_spec.name;
                    const archievements = character.achievement_points;
                    const lastLogin = character.last_login_timestamp;
                    const image = characterMedia.assets.find(a => a.key === 'avatar').value;
                    const bigImage = characterMedia.assets.find(a => a.key === 'inset').value;
                    const itemLevel = character.equipped_item_level;
                    const itemLevelCombined = `${character.equipped_item_level} (${character.average_item_level})`;
                    
                    const covenant = { level: 0, name: '', };
                    if (character.covenant_progress) {
                        covenant.level = character.covenant_progress.renown_level;
                        covenant.name = character.covenant_progress.chosen_covenant.name;
                    }

                    /*
                    let title = '';
                    if (!warcraftlogsData.gameData.error && warcraftlogsData.gameData.global.active_title) {
                        title = warcraftlogsData.gameData.global.active_title.display_string.replace('{name}', char.name);
                    }
                    let covenant = '';
                    let covenantLevel = '';
                    if (!warcraftlogsData.gameData.error && warcraftlogsData.gameData.global.covenant_progress) {
                        covenant = warcraftlogsData.gameData.global.covenant_progress.chosen_covenant.name;
                        covenantLevel = warcraftlogsData.gameData.global.covenant_progress.renown_level;
                    }
                    */

                    const getDifficulty = (number) => {
                        if (number === 1) {
                            return 'Normal'
                        }
                        if (number === 4) {
                            return 'Heroic'
                        }
                        // TODO: Check numbers
                        if (number === 6) {
                            return 'Mythic'
                        }
                        return '';
                    }
                    // wlRankings

                    

                    roster.push({
                        rank: m.rank,
                        id: char.id,
                        level: char.level,
                        name: char.name,
                        realm: char.realm.slug,
                        race,
                        spec,
                        className,
                        archievements,
                        image,
                        profileUrl: raiderIoData.profile_url,
                        itemLevel,
                        itemLevelCombined,
                        mythicScore: raiderIoData.mythic_plus_scores_by_season[0].scores.all,
                        mythicRanks: raiderIoData.mythic_plus_ranks,
                        raidSummery: raiderIoData.raid_progression["castle-nathria"] ? raiderIoData.raid_progression["castle-nathria"].summary : null,
                        raiderIo: raiderIoData,
                        discordGuildMember,
                        realName,
                        warcraftLogs,
                        lastLogin,
                        covenant,
                        bigImage,
                    });
                }
            });

            return roster.sort((a, b) => {
                return b.itemLevel - a.itemLevel
            })
        }
        return roster;
    },
    getRosterTable: async (members) => {
        const membersMutable = [...members];
        const memberChunks = [];
        while (membersMutable.length > 0) {
            memberChunks.push(membersMutable.splice(0, 10));
        }
        const tables = [];
        let first = true;
        let line = 1;
        memberChunks.forEach(memberChunk => {
            var table = new AsciiTable()
            if (first) {
                table.setHeading('', 'Name', 'Real', 'Class', 'Spec', 'M+ Score', 'Progress', 'iLvl');
                first = false;
            }
            memberChunk.forEach(m => {
                table.addRow(
                    line,
                    m.name,
                    m.realName,
                    m.className,
                    m.spec,
                    m.mythicScore,
                    m.raidSummery,
                    m.itemLevel,
                );
                line += 1;
            });
            tables.push(table.toString());
        });
        return tables;        
    }
}