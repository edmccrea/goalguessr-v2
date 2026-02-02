import { db } from '$lib/server/db';
import { goals, users } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { processGoalEntities } from '$lib/server/sync';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	// Get all pending goals with submitter info
	const pendingGoals = await db
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
			animationData: goals.animationData,
			status: goals.status,
			createdAt: goals.createdAt,
			submittedByUsername: users.username
		})
		.from(goals)
		.leftJoin(users, eq(goals.submittedBy, users.id))
		.where(eq(goals.status, 'pending'))
		.orderBy(sql`${goals.createdAt} ASC`);

	// Also get recently reviewed goals
	const recentlyReviewed = await db
		.select({
			id: goals.id,
			team: goals.team,
			year: goals.year,
			scorer: goals.scorer,
			status: goals.status,
			createdAt: goals.createdAt
		})
		.from(goals)
		.where(sql`${goals.status} != 'pending'`)
		.orderBy(sql`${goals.createdAt} DESC`)
		.limit(10);

	return {
		pendingGoals,
		recentlyReviewed
	};
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) return fail(403, { error: 'Unauthorized' });

		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;

		if (!goalId) {
			return fail(400, { error: 'Goal ID required' });
		}

		// Fetch the goal data to process entities
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

		if (!goal) {
			return fail(404, { error: 'Goal not found' });
		}

		// Add any missing teams, players, or competitions to the database
		await processGoalEntities(goal);

		await db
			.update(goals)
			.set({
				status: 'approved',
				reviewedBy: locals.user?.id
			})
			.where(eq(goals.id, goalId));

		return { success: true, action: 'approved' };
	},

	reject: async ({ request, locals }) => {
		if (!locals.user?.isAdmin) return fail(403, { error: 'Unauthorized' });

		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;
		const rejectionReason = formData.get('rejectionReason') as string | null;

		if (!goalId) {
			return fail(400, { error: 'Goal ID required' });
		}

		await db
			.update(goals)
			.set({
				status: 'rejected',
				rejectionReason: rejectionReason || null,
				reviewedBy: locals.user?.id
			})
			.where(eq(goals.id, goalId));

		return { success: true, action: 'rejected' };
	}
};
