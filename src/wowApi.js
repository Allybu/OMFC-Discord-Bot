const axios = require('axios');
const Querystring = require('querystring');
const rs = require('rocket-store');
const fs = require('fs');

require('dotenv').config();

const loginUrl = 'https://eu.battle.net/oauth/token';

const blizzardApiUrl = 'https://eu.api.blizzard.com';

let token = null;

let tokenExpireDate = 0;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await callback(array[index], index, array);
    }
}

const dataCache = {};

const cacheData = async (id, data) => {
    console.log(`Save into cache: ${id}`);
    dataCache[id] = data;
    await rs.post('wowData', id, data);
};
const loadData = async (id) => {
    const idParsed = id.replace(/\//g, '');
    if (dataCache[idParsed]) {
        console.log(`Loading from cache: ${idParsed}`);
        return dataCache[idParsed];
    }

    const checkStorage = await rs.get('wowData', idParsed);
    if (checkStorage.count > 0) {
        console.log(`Loading from storage: ${idParsed}`);
        const restoredData = checkStorage.result[0];
        dataCache[idParsed] = restoredData;
        return restoredData;
    }

    console.log(`Fetching from Web: ${idParsed}`);
    const newData = await this.WowApi.blizzardApiCall(id, true);
    cacheData(idParsed, newData);
    return newData;
};

exports.WowApi = {
    init: async () => {
        const data = Querystring.stringify({
            grant_type: 'client_credentials',
        });
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: process.env.BNET_ID,
                password: process.env.BNET_SECRET,
            },
        };
        try {
            const response = await axios.post(loginUrl, data, config);

            console.log(`${response.status} - ${response.statusText}`);
            console.log(response.data);

            token = response.data.access_token;

            tokenExpireDate = new Date().getTime() + response.data.expires_in;
        } catch (error) {
            if (error.response) {
                console.error(
                    `${error.response.status} - ${error.response.statusText}`
                );
            } else {
                console.error(error);
            }
        }

        // init data
        const targetDir = './store';
        fs.mkdirSync(targetDir, { recursive: true });
        await rs.options({
            data_storage_area: targetDir,
            // eslint-disable-next-line no-underscore-dangle
            data_format: rs._FORMAT_JSON,
        });
    },
    blizzardApiCall: async (url, isStatic) => {
        if (!url.includes(blizzardApiUrl)) {
            // eslint-disable-next-line no-param-reassign
            url = `${blizzardApiUrl}${url}`;
        }

        const tokenExpired = new Date().getTime() >= tokenExpireDate;

        if (tokenExpired) {
            await this.WowApi.init();
        }

        const data = Querystring.stringify({
            locale: 'en_US',
            access_token: token,
            namespace: isStatic ? 'static-eu' : 'profile-eu',
        });
        try {
            const response = await axios.get(`${url}?${data}`);
            return response.data;
        } catch (error) {
            console.error(
                `${error.response.status} - ${error.response.statusText}`
            );
            return null;
        }
    },
    getCharacter: (name, realm) => {
        return this.WowApi.blizzardApiCall(
            `/profile/wow/character/${realm.toLowerCase()}/${name.toLowerCase()}`
        );
    },
    getCharacterMedia: (name, realm) => {
        return this.WowApi.blizzardApiCall(
            `/profile/wow/character/${realm.toLowerCase()}/${name.toLowerCase()}/character-media`
        );
    },
    getRace: async (id) => {
        const answer = await this.WowApi.blizzardApiCall(
            `/data/wow/playable-race/${id}`
        );
        console.log(answer);
    },
    getClassData: async (id) => {
        return loadData(`/data/wow/playable-class/${id}`);
    },
    getSpec: async (id) => {
        return loadData(`/data/wow/playable-specialization/${id}`);
    },
    getInfoByKey: async (key) => {
        return this.WowApi.blizzardApiCall(key);
    },
    getRoster: async () => {
        const answer = await this.WowApi.blizzardApiCall(
            `/data/wow/guild/malygos/on-malygos-for-centuries/roster`
        );
        if (answer && answer.members) {
            await asyncForEach(answer.members, async (m) => {
                const classData = await this.WowApi.getClassData(
                    m.character.playable_class.id
                );

                const specs = [];
                await asyncForEach(classData.specializations, async (s) => {
                    const specData = await this.WowApi.getSpec(s.id);
                    specs.push({
                        name: specData.name,
                        role: specData.role.type,
                    });
                });

                // eslint-disable-next-line no-param-reassign
                m.specs = specs;
                // eslint-disable-next-line no-param-reassign
                m.className = classData.name;
            });

            return answer.members;
        }
        return null;
    },
};
