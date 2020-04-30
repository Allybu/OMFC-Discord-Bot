var express = require("express");
require("dotenv").config();

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
});

bot.on('message', msg => {

	const taggedUser = msg.mentions.users.first();

	if(taggedUser && taggedUser.bot && taggedUser.id === bot.user.id){
		console.log("Bot was tagged!");
		bot.commands.get("/marvinsaysomething").execute(msg, null, null);
	}

	const args = msg.content.toLowerCase().split(/ +/);
	const command = args.shift().toLowerCase();
	console.info(`Called command: ${command}`);

	if (!bot.commands.has(command)) return;

	try {
		bot.commands.get(command).execute(msg, args, botState);
	} catch (error) {
		console.error(error);
		msg.reply('Ich kann leider nicht verstehen, was du sagst.');
		msg.delete();
	}
});

/*
bot.on('messageReactionAdd', async (reaction, user) => {
	// When we receive a reaction we check if the reaction is partial or not
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
	// Now the message has been cached and is fully available
	console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
	// The reaction is now also fully available and the properties will be reflected accurately:
	console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
});
*/
