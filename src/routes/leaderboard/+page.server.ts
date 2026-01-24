import { db } from '$lib/server/db';
import { gameResults, dailyGames, sessions, users } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

function getToday(): string {
	return new Date().toISOString().split('T')[0];
}

export const load: PageServerLoad = async () => {
	const today = getToday();

	// Get today's daily game
	const todayGame = await db
		.select()
		.from(dailyGames)
		.where(eq(dailyGames.date, today))
		.get();

	// Daily leaderboard - scores for today's game
	let dailyLeaderboard: Array<{
		rank: number;
		username: string;
		totalScore: number;
		round1Score: number;
		round2Score: number;
		round3Score: number;
	}> = [];

	if (todayGame) {
		const dailyResults = await db
			.select({
				totalScore: gameResults.totalScore,
				round1Score: gameResults.round1Score,
				round2Score: gameResults.round2Score,
				round3Score: gameResults.round3Score,
				sessionId: gameResults.sessionId,
				username: users.username
			})
			.from(gameResults)
			.leftJoin(sessions, eq(gameResults.sessionId, sessions.id))
			.leftJoin(users, eq(sessions.userId, users.id))
			.where(eq(gameResults.dailyGameId, todayGame.id))
			.orderBy(desc(gameResults.totalScore))
			.limit(50)
			.all();

		dailyLeaderboard = dailyResults.map((result, index) => ({
			rank: index + 1,
			username: result.username ?? `Player ${result.sessionId?.slice(0, 6) ?? 'Unknown'}`,
			totalScore: result.totalScore ?? 0,
			round1Score: result.round1Score ?? 0,
			round2Score: result.round2Score ?? 0,
			round3Score: result.round3Score ?? 0
		}));
	}

	// All-time leaderboard - aggregate scores across all games
	// First, get registered users' aggregate scores
	const registeredUserScores = await db
		.select({
			userId: users.id,
			username: users.username,
			totalScore: sql<number>`sum(${gameResults.totalScore})`.as('total_score'),
			gamesPlayed: sql<number>`count(distinct ${gameResults.dailyGameId})`.as('games_played')
		})
		.from(gameResults)
		.innerJoin(sessions, eq(gameResults.sessionId, sessions.id))
		.innerJoin(users, eq(sessions.userId, users.id))
		.groupBy(users.id)
		.orderBy(desc(sql`total_score`))
		.limit(50)
		.all();

	const allTimeLeaderboard = registeredUserScores.map((result, index) => ({
		rank: index + 1,
		username: result.username ?? 'Unknown',
		totalScore: result.totalScore ?? 0,
		gamesPlayed: result.gamesPlayed ?? 0,
		averageScore: result.gamesPlayed > 0
			? Math.round((result.totalScore ?? 0) / result.gamesPlayed)
			: 0
	}));

	return {
		dailyLeaderboard,
		allTimeLeaderboard,
		todayDate: today
	};
};
