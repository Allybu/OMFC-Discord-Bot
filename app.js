var express = require("express");
require("dotenv").config();
var cron = require('node-cron');

const { setNewRoster, listenForInviteReactions } = require('./jobs');

// Discord Bot Setup
const Discord = require("discord.js");
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
bot.commands = new Discord.Collection();
const botCommands = require("./commands");

Object.keys(botCommands).map(key => {
	bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

let botState = {
	servers: {}
};

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  bot.user.setActivity('Diablo IV');
  //bot.user.setActivity('Wird gerade entwickelt.');
  listenForInviteReactions(bot);
});

bot.on('message', msg => {

	const taggedUser = msg.mentions.users.first();

	if(taggedUser && taggedUser.bot && taggedUser.id === bot.user.id){
		console.log("Bot was tagged!");
		bot.commands.get("/marvinsaysomething").execute(msg, null, null);
	}

	const args = msg.content.split(/ +/);
	const command = args.shift().toLowerCase();
	console.info(`Called command: ${command.toLowerCase()}`);

	if (!bot.commands.has(command)) return;

	try {
		bot.commands.get(command).execute(msg, args, botState);
	} catch (error) {
		console.error(error);
		msg.reply('Ich kann leider nicht verstehen, was du sagst.');
		msg.delete();
	}
});

bot.on('guildMemberAdd', member => {

	// Public Message
	member.setNickname(`${member.user.username} (New)`)

	const welcomeEmbed = new Discord.MessageEmbed()
		.setColor('#55abf0')
		.setTitle('Willkommen **' + member.user.username + '**!')
		.setDescription(`Willkommen auf unserem OFMC Discord Server, **${member.user.username}**! 😃 Du bist Mitglied Nummer ${member.guild.memberCount}!`)
		.addField("GLHF!", "Und denk dran: Immer effizient spielen!")
		.setThumbnail(member.user.avatarURL())
		.setFooter(`${member.user.username} joined`)
		.setTimestamp()

	member.guild.channels.cache.find(i => i.name === 'willkommen').send(welcomeEmbed)
	

	// Private Message
	const getMembersWithRole = (role) => {
		const roleObj = member.guild.roles.cache.find(r => r.name == role);
        const members = member.guild.members.cache.filter(m => m.roles.cache.find(r => r == roleObj)).map(mem => mem.nickname);
        return members;
	}

	const welcomePrivate = new Discord.MessageEmbed()
		.setColor('#55abf0')
		.setTitle('Willkommen **' + member.user.username + '**!')
		.setDescription(`Hi, ich bin Marvin, der Bot dieses Servers, und sende dir hier ein paar nützliche Infos 🤖.`)
		.addField("Nickname", "Bitte passe deinen Server-Nickname an, sodass es dem Format entspricht: 'Charaktername (Vorname)'. Vorname steht hier für den Namen, mit dem du gerne angesprochen werden möchstest 🙂 Zum Beispiel: 'Allybu (Alex)'")
		.addField("Rechte", "Zunächst hast du nur eingeschränkten Zugriff auf den Server. Wenn dir Rechte fehlen, um die Channel zu sehen, dann wende dich an einen der unten aufgelisteten Ansprechpartner.")
		.addField("Ansprechpartner", getMembersWithRole('OP').join("\n"))
		.addField("GLHF!", "Und denk dran: Immer effizient spielen!")
		.setThumbnail(member.user.avatarURL())
		.setFooter(`${member.user.username} joined`)
		.setTimestamp()

	member.send(welcomePrivate);
})

// # 		┌────────────── second (optional)
// # 		│ ┌──────────── minute
// # 		│ │ ┌────────── hour
// # 		│ │ │ ┌──────── day of month
// # 		│ │ │ │ ┌────── month
// # 		│ │ │ │ │ ┌──── day of week
// # 		│ │ │ │ │ │
// # 		│ │ │ │ │ │
// # 		* * * * * *
cron.schedule('0 0 5 * * *', () => {
	setNewRoster(bot);
});