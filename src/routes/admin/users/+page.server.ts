import { db } from '$lib/server/db';
import { users, gameResults, sessions } from '$lib/server/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// Get all users with stats
	const allUsers = await db
		.select({
			id: users.id,
			username: users.username,
			email: users.email,
			createdAt: users.createdAt,
			isAdmin: users.isAdmin
		})
		.from(users)
		.orderBy(desc(users.createdAt));

	// Get game stats for each user
	const userStats = await Promise.all(
		allUsers.map(async (user) => {
			// Get sessions for this user
			const userSessions = await db
				.select({ id: sessions.id })
				.from(sessions)
				.where(eq(sessions.userId, user.id));

			const sessionIds = userSessions.map((s) => s.id);

			if (sessionIds.length === 0) {
				return {
					...user,
					gamesPlayed: 0,
					totalScore: 0,
					averageScore: 0
				};
			}

			// Get game results for those sessions
			const results = await db
				.select({
					gamesPlayed: sql<number>`count(*)`,
					totalScore: sql<number>`coalesce(sum(${gameResults.totalScore}), 0)`,
					averageScore: sql<number>`coalesce(avg(${gameResults.totalScore}), 0)`
				})
				.from(gameResults)
				.where(sql`${gameResults.sessionId} IN (${sql.join(sessionIds.map((id) => sql`${id}`), sql`, `)})`)
				.get();

			return {
				...user,
				gamesPlayed: results?.gamesPlayed ?? 0,
				totalScore: results?.totalScore ?? 0,
				averageScore: Math.round(results?.averageScore ?? 0)
			};
		})
	);

	return {
		users: userStats
	};
};

export const actions: Actions = {
	toggleAdmin: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) {
			return fail(400, { error: 'User ID required' });
		}

		// Prevent removing own admin status
		if (userId === locals.user?.id) {
			return fail(400, { error: 'Cannot modify your own admin status' });
		}

		// Get current status
		const user = await db.select().from(users).where(eq(users.id, userId)).get();

		if (!user) {
			return fail(404, { error: 'User not found' });
		}

		// Toggle admin status
		await db
			.update(users)
			.set({ isAdmin: !user.isAdmin })
			.where(eq(users.id, userId));

		return { success: true, action: user.isAdmin ? 'removed' : 'granted' };
	}
};
