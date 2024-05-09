import { ApplicationCommandOptionType, REST, Routes } from "discord.js";

export const commands = [
	{
		name: 'list-teams',
		description: 'Lists all teams in the server',
	},
	{
		name: 'add-team',
		description: 'Adds/Updates a team to the server',
		options: [
			{
				name: 'team-name',
				description: 'The name of the team',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'members',
				description: 'The members of the team',
				type: ApplicationCommandOptionType.String,
				required: true,
			}
		]
	},
	{
		name: 'del-team',
		description: 'Deletes a team from the server',
		options: [
			{
				name: 'team-name',
				description: 'The name of the team',
				type: ApplicationCommandOptionType.String,
				required: true,
			}
		],
	},
	{
		name: 'train',
		description: 'Train a team',
		options: [
			{
				name: 'team',
				description: 'The name of the team',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'problem-numbers',
				description: 'The problem numbers in the match',
				type: ApplicationCommandOptionType.Integer,
				required: false,
			},
			{
				name: 'difficulty',
				description: 'The difficulty of the match',
				type: ApplicationCommandOptionType.Integer,
				required: false,
			}
		],
	},
	{
		name: 'match',
		description: 'Matches a team with another team',
		options: [
			{
				name: 'first-team',
				description: 'The name of the first team',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'second-team',
				description: 'The name of the second team',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'problem-numbers',
				description: 'The problem numbers in the match',
				type: ApplicationCommandOptionType.Integer,
				required: false,
			},
			{
				name: 'difficulty',
				description: 'The difficulty of the match',
				type: ApplicationCommandOptionType.Integer,
				required: false,
			}
		],
	}
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
(async () => {
	const guilds = process.env.GUILDS.replace('[', '').replace(']', '').split(',');
	for (const guild of guilds) {
		try {
			await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, guild),
				{ body: commands }
			);
			console.log("Successfully registered application commands.");
		} catch (error) {
			console.error(error);
		}
	}
})();