import axios from "axios"
import dotnev from 'dotenv';
dotnev.config()
export const problems = []
const baseUrl = process.env.CF_API
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const getTeamProblems = async function (members, limit, difficulty) {
	let teamProblems = problems
	if (!limit) limit = 12;
	if (!difficulty) difficulty = 1000;
	for (const user of members) {
		try {
			const response = await axios.get(baseUrl + 'user.status?handle=' + user);
			const data = await response.data.result;
			data.forEach(submission => {
				if (submission.verdict === 'OK') {
					teamProblems = teamProblems.filter(item => item.contestId !== submission.problem.contestId);
				}
			});
		} catch (error) {
			console.log('ERROR finding problems for specified users: ' + error.message);
			process.exit(1);
		}
	}

	teamProblems = teamProblems.filter((problem) => {
		if (!problem.rating) return false;
		return Math.abs(problem.rating - difficulty) <= 200;
	}).slice(0, Math.min(teamProblems.length, limit));

	return teamProblems;
}

export const readProblemSet = async function () {
	try {
		const response = await (await axios.get(baseUrl + 'problemset.problems')).data;
		response.result.problems.forEach(problem => {
			problems.push(problem)
		})
	} catch (error) {
		console.log(`ERROR Fetching the problem set: ${error.message}`)
		process.exit(1)
	}
	return problems
}

export const getProblemUpdates = async function (members, problem) {
	let teamProblems = problems
	members = new Set(members);

	for (const user of members) {
		try {
			await delay(2500);
			const response = await axios.get(baseUrl + 'user.status?handle=' + user);
			const data = await response.data.result;
			data.forEach(submission => {
				if (submission.verdict === 'OK') {
					teamProblems = teamProblems.filter(item => item.contestId !== submission.problem.contestId);
				}
			});
		} catch (error) {
			console.log('ERROR finding problems for specified users: ' + error);
			process.exit(1);
		}
	}

	let isSolved = true;
	teamProblems.forEach(current => {
		if (problem.contestId === current.contestId) {
			isSolved = false;
			return;
		}
	})

	return isSolved;
}