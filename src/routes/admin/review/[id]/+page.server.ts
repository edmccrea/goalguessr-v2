import { db } from '$lib/server/db';
import { goals, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const goal = await db
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
		.where(eq(goals.id, params.id))
		.get();

	if (!goal) {
		throw error(404, 'Goal not found');
	}

	return { goal };
};

export const actions: Actions = {
	approve: async ({ params, locals }) => {
		const goal = await db.select().from(goals).where(eq(goals.id, params.id)).get();

		if (!goal) {
			return fail(404, { error: 'Goal not found' });
		}

		await db
			.update(goals)
			.set({
				status: 'approved',
				reviewedBy: locals.user?.id
			})
			.where(eq(goals.id, params.id));

		return { success: true, action: 'approved' };
	},

	reject: async ({ params, locals }) => {
		const goal = await db.select().from(goals).where(eq(goals.id, params.id)).get();

		if (!goal) {
			return fail(404, { error: 'Goal not found' });
		}

		await db
			.update(goals)
			.set({
				status: 'rejected',
				reviewedBy: locals.user?.id
			})
			.where(eq(goals.id, params.id));

		return { success: true, action: 'rejected' };
	}
};
