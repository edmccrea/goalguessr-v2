import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { gameResults, guesses, sessions } from '$lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Get all sessions for this user (or just current session if anonymous)
	let sessionIds: string[] = [locals.sessionId];

	if (locals.user) {
		// Get all sessions linked to this user
		const userSessions = await db
			.select({ id: sessions.id })
			.from(sessions)
			.where(eq(sessions.userId, locals.user.id));
		sessionIds = userSessions.map((s) => s.id);
	}

	// Get aggregate stats from game_results
	const statsQuery = await db
		.select({
			gamesPlayed: sql<number>`count(*)`,
			totalScore: sql<number>`coalesce(sum(${gameResults.totalScore}), 0)`,
			avgScore: sql<number>`coalesce(avg(${gameResults.totalScore}), 0)`
		})
		.from(gameResults)
		.where(sql`${gameResults.sessionId} IN (${sql.join(sessionIds.map(id => sql`${id}`), sql`, `)})`)
		.get();

	// Get guess accuracy
	const guessStats = await db
		.select({
			totalGuesses: sql<number>`count(*)`,
			teamCorrect: sql<number>`sum(case when ${guesses.teamCorrect} = 1 then 1 else 0 end)`,
			yearCorrect: sql<number>`sum(case when ${guesses.yearCorrect} = 1 then 1 else 0 end)`,
			scorerCorrect: sql<number>`sum(case when ${guesses.scorerCorrect} = 1 then 1 else 0 end)`
		})
		.from(guesses)
		.innerJoin(gameResults, eq(guesses.gameResultId, gameResults.id))
		.where(sql`${gameResults.sessionId} IN (${sql.join(sessionIds.map(id => sql`${id}`), sql`, `)})`)
		.get();

	const totalGuesses = guessStats?.totalGuesses ?? 0;
	const correctGuesses =
		(guessStats?.teamCorrect ?? 0) +
		(guessStats?.yearCorrect ?? 0) +
		(guessStats?.scorerCorrect ?? 0);
	const totalPossible = totalGuesses * 3; // 3 categories per guess

	// Get recent games
	const recentGames = await db
		.select({
			id: gameResults.id,
			totalScore: gameResults.totalScore,
			round1Score: gameResults.round1Score,
			round2Score: gameResults.round2Score,
			round3Score: gameResults.round3Score,
			createdAt: gameResults.createdAt
		})
		.from(gameResults)
		.where(sql`${gameResults.sessionId} IN (${sql.join(sessionIds.map(id => sql`${id}`), sql`, `)})`)
		.orderBy(sql`${gameResults.createdAt} DESC`)
		.limit(10);

	return {
		stats: {
			gamesPlayed: statsQuery?.gamesPlayed ?? 0,
			totalScore: statsQuery?.totalScore ?? 0,
			avgScore: Math.round(statsQuery?.avgScore ?? 0),
			accuracy: totalPossible > 0 ? Math.round((correctGuesses / totalPossible) * 100) : 0,
			teamAccuracy:
				totalGuesses > 0 ? Math.round(((guessStats?.teamCorrect ?? 0) / totalGuesses) * 100) : 0,
			yearAccuracy:
				totalGuesses > 0 ? Math.round(((guessStats?.yearCorrect ?? 0) / totalGuesses) * 100) : 0,
			scorerAccuracy:
				totalGuesses > 0 ? Math.round(((guessStats?.scorerCorrect ?? 0) / totalGuesses) * 100) : 0
		},
		recentGames
	};
};
