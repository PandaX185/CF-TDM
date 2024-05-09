import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { addTeam, listTeams, deleteTeam, matchTeams } from "./handlers.js";
import { readProblemSet, getProblemUpdates } from "./problemset.js";
import { CronJob } from 'cron';
import { Redis } from "ioredis";
import express from 'express';
import './commands.js';

await readProblemSet();
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
})
const redis = new Redis(process.env.REDIS_URL)

const app = express();

app.get('/', (req, res) => {
	z
	res.send('Hello World!')
})

client.login(process.env.BOT_TOKEN);


function urlBuilder(problem) {
	return 'https://codeforces.com/problemset/problem/' + problem.contestId + '/' + problem.index
}

function orderProblems(problems) {
	let index = 'A'
	return problems.map((problem) => {
		problem = urlBuilder(problem);
		const result = `Problem ${index}: ${problem}`
		index = String.fromCharCode(index.charCodeAt(0) + 1)
		return result
	}).join('\n')
}

client.on(Events.InteractionCreate, async function (interaction) {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'add-team') {
		const serverName = interaction.guild.name;
		const teamName = interaction.options.getString('team-name')
		const members = interaction.options.getString('members').split(' ')
		await addTeam(serverName, teamName, members)
		await interaction.reply({ content: `Team  added successfully`, ephemeral: true })
	}
	if (interaction.commandName === 'list-teams') {
		const serverName = interaction.guild.name;
		const teams = await listTeams(serverName)
		if (teams.length > 0)
			await interaction.reply({ content: teams, ephemeral: true })
		else
			await interaction.reply({ content: `No teams registered`, ephemeral: true })
	}
	if (interaction.commandName === 'del-team') {
		const serverName = interaction.guild.name;
		const teamName = interaction.options.getString('team-name')
		await deleteTeam(serverName, teamName)
		await interaction.reply({ content: `Team  deleted successfully`, ephemeral: true })
	}

	if (interaction.commandName === 'train') {
		const team = interaction.options.getString('team')
		const problemNumbers = interaction.options.getInteger('problem-numbers')
		const difficulty = interaction.options.getInteger('difficulty')
		await interaction.reply({ content: "Gathering problems...", ephemeral: false });
		const match = await matchTeams(team, "", problemNumbers, difficulty)

		if (match) {
			await interaction.editReply({ content: orderProblems(match) });
		}
		else {
			await interaction.editReply(`No training found`);
		}

		let time = 5;

		function countdown() {
			if (time != 0) {
				interaction.followUp({ content: "Remaining hours: " + time-- });
				setTimeout(countdown, 60 * 60 * 1000);
			}
		}

		countdown();

	}

	if (interaction.commandName === 'match') {
		const firstTeam = interaction.options.getString('first-team')
		const secondTeam = interaction.options.getString('second-team')
		const problemNumbers = interaction.options.getInteger('problem-numbers')
		const difficulty = interaction.options.getInteger('difficulty')
		await interaction.reply({ content: "Gathering problems...", ephemeral: false });
		const match = await matchTeams(firstTeam, secondTeam, problemNumbers, difficulty)
		const firstTeamMembers = await redis.lrange(firstTeam, 0, -1);
		const secondTeamMembers = await redis.lrange(secondTeam, 0, -1);

		if (match) {
			await interaction.editReply({ content: orderProblems(match) });
		}
		else {
			await interaction.editReply(`No match found`);
		}

		let firstScore = 0, secondScore = 0;
		// new CronJob(
		// 	'1 * * * * *',
		// 	async function () {
		// 		console.log('Cron job started');
		// 		let i = 0;
		// 		for (i = 0; i < match.length; i++) {
		// 			if (await getProblemUpdates(firstTeamMembers, match[i])) {
		// 				let problemNumber = String.fromCharCode(65 + i);
		// 				interaction.followUp({ content: `Team ${firstTeam} solved problem ${problemNumber} ✅` });
		// 				firstScore++;
		// 			}
		// 			if (await getProblemUpdates(secondTeamMembers, match[i])) {
		// 				let problemNumber = String.fromCharCode(65 + i);
		// 				interaction.followUp({ content: `Team ${secondTeam} solved problem ${problemNumber} ✅` });
		// 				secondScore++;
		// 			}
		// 		}
		// 		match.splice(i, 1);
		// 	},
		// 	null,
		// 	true,
		// 	'Africa/Cairo'
		// );
	}
});

app.listen(8080, () => {
	console.log("Server started");
})
