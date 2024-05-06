import { Redis } from "ioredis"
import dotenv from "dotenv";
import { getTeamProblems } from "./problemset.js";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL)

export const listTeams = async function (serverName) {
	const teams = await redis.lrange(serverName, 0, -1)
	const teamMembers = await Promise.all(teams.map(async (team) => {
		const members = await redis.lrange(team, 0, -1)
		return members.join(', ')
	}))
	teams.forEach((team, index) => {
		teams[index] = `${team}: ${teamMembers[index]}`
	})
	return teams.join('\n')
}

export const addTeam = async function (serverName, teamName, members) {
	if (await redis.exists(teamName)) {
		await redis.del(teamName)
		await redis.rpush(teamName, members)
		return
	}
	await redis.rpush(serverName, teamName)
	await redis.rpush(teamName, members)
}

export const deleteTeam = async function (serverName, teamName) {
	await redis.del(teamName)
	await redis.lrem(serverName, 0, teamName)
}

export const matchTeams = async function (firstTeam, secondTeam, problemNumbers, difficulty) {
	const teamMembers = (await redis.lrange(firstTeam, 0, -1)).concat(await redis.lrange(secondTeam, 0, -1));
	const contestProblems = (await getTeamProblems(teamMembers, problemNumbers, difficulty));
	return contestProblems;
}