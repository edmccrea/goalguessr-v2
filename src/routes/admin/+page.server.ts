import { db } from '$lib/server/db';
import { goals, users, dailyGames, gameResults, goalQueue } from '$lib/server/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Get counts for dashboard stats
	const [pendingCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(goals)
		.where(eq(goals.status, 'pending'));

	const [approvedCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(goals)
		.where(eq(goals.status, 'approved'));

	const [totalGoals] = await db.select({ count: sql<number>`count(*)` }).from(goals);

	const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);

	const [totalGamesPlayed] = await db.select({ count: sql<number>`count(*)` }).from(gameResults);

	// Get today's date
	const today = new Date().toISOString().split('T')[0];

	// Check if today has a daily game
	const todayGame = await db
		.select()
		.from(dailyGames)
		.where(eq(dailyGames.date, today))
		.get();

	// Get upcoming scheduled daily games count (excluding today)
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const tomorrowStr = tomorrow.toISOString().split('T')[0];

	const [scheduledCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(dailyGames)
		.where(gte(dailyGames.date, tomorrowStr));

	// Get recent submissions (last 5)
	const recentSubmissions = await db
		.select({
			id: goals.id,
			team: goals.team,
			scorer: goals.scorer,
			year: goals.year,
			status: goals.status,
			createdAt: goals.createdAt
		})
		.from(goals)
		.orderBy(sql`${goals.createdAt} DESC`)
		.limit(5);

	return {
		stats: {
			pendingReviews: pendingCount?.count ?? 0,
			approvedGoals: approvedCount?.count ?? 0,
			totalGoals: totalGoals?.count ?? 0,
			totalUsers: totalUsers?.count ?? 0,
			totalGamesPlayed: totalGamesPlayed?.count ?? 0,
			scheduledGoals: scheduledCount?.count ?? 0,
			hasTodayGame: !!todayGame
		},
		recentSubmissions
	};
};
