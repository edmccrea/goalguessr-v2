import { db } from '$lib/server/db';
import { goals, gameResults, dailyGames, sessions } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { PUBLIC_FEATURE_STATS } from '$env/static/public';
import type { PageServerLoad } from './$types';

async function loadStats() {
	// Count approved goals
	const [goalsCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(goals)
		.where(eq(goals.status, 'approved'));

	// Count unique players (unique session IDs that have played)
	const [playersCount] = await db
		.select({ count: sql<number>`count(distinct ${gameResults.sessionId})` })
		.from(gameResults);

	// Get first daily game date to calculate days running
	const firstGame = await db
		.select({ date: dailyGames.date })
		.from(dailyGames)
		.orderBy(dailyGames.date)
		.limit(1)
		.get();

	let daysRunning = 0;
	if (firstGame?.date) {
		const firstDate = new Date(firstGame.date);
		const today = new Date();
		daysRunning = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
	}

	return {
		goalsCount: goalsCount?.count ?? 0,
		playersCount: playersCount?.count ?? 0,
		daysRunning
	};
}

export const load: PageServerLoad = async () => {
	if (PUBLIC_FEATURE_STATS !== 'true') {
		return { stats: null };
	}

	// Return promise for streaming - the page will render immediately
	// and the stats will stream in when ready
	return {
		stats: loadStats()
	};
};
