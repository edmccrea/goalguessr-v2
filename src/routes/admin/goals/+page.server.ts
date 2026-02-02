import { db } from '$lib/server/db';
import { goals, users, dailyGames, goalQueue, guesses } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { processGoalEntities } from '$lib/server/sync';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const allGoals = await db
		.select({
			id: goals.id,
			team: goals.team,
			year: goals.year,
			scorer: goals.scorer,
			competition: goals.competition,
			opponent: goals.opponent,
			matchContext: goals.matchContext,
			videoUrl: goals.videoUrl,
			isInternational: goals.isInternational,
			status: goals.status,
			createdAt: goals.createdAt,
			submittedBy: goals.submittedBy,
			submittedByUsername: users.username
		})
		.from(goals)
		.leftJoin(users, eq(goals.submittedBy, users.id))
		.orderBy(desc(goals.createdAt));

	// Get counts by status
	const statusCounts = await db
		.select({
			status: goals.status,
			count: sql<number>`count(*)`
		})
		.from(goals)
		.groupBy(goals.status);

	const counts = {
		pending: 0,
		approved: 0,
		rejected: 0,
		total: 0
	};

	for (const row of statusCounts) {
		if (row.status === 'pending') counts.pending = row.count;
		else if (row.status === 'approved') counts.approved = row.count;
		else if (row.status === 'rejected') counts.rejected = row.count;
		counts.total += row.count;
	}

	return {
		goals: allGoals,
		counts
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) return fail(403, { error: 'Unauthorized' });

		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;

		if (!goalId) {
			return fail(400, { error: 'Goal ID required' });
		}

		// Remove from goal queue if present
		await db.delete(goalQueue).where(eq(goalQueue.goalId, goalId));

		// Remove guesses referencing this goal
		await db.delete(guesses).where(eq(guesses.goalId, goalId));

		// Null out references in daily games
		await db
			.update(dailyGames)
			.set({ goal1Id: null })
			.where(eq(dailyGames.goal1Id, goalId));
		await db
			.update(dailyGames)
			.set({ goal2Id: null })
			.where(eq(dailyGames.goal2Id, goalId));
		await db
			.update(dailyGames)
			.set({ goal3Id: null })
			.where(eq(dailyGames.goal3Id, goalId));

		// Delete the goal
		await db.delete(goals).where(eq(goals.id, goalId));

		return { success: true, action: 'deleted' };
	},

	updateStatus: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) return fail(403, { error: 'Unauthorized' });

		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;
		const status = formData.get('status') as 'pending' | 'approved' | 'rejected';

		if (!goalId || !status) {
			return fail(400, { error: 'Goal ID and status required' });
		}

		if (!['pending', 'approved', 'rejected'].includes(status)) {
			return fail(400, { error: 'Invalid status' });
		}

		// If approving, add any missing teams/players/competitions to the database
		if (status === 'approved') {
			const goal = await db
				.select({
					team: goals.team,
					scorer: goals.scorer,
					opponent: goals.opponent,
					competition: goals.competition
				})
				.from(goals)
				.where(eq(goals.id, goalId))
				.get();

			if (goal) {
				await processGoalEntities(goal);
			}
		}

		await db
			.update(goals)
			.set({ status })
			.where(eq(goals.id, goalId));

		return { success: true, action: `status updated to ${status}` };
	}
};
