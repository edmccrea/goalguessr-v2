import { db } from '$lib/server/db';
import { goals, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import {
	checkMissingEntities,
	processGoalEntitiesWithData,
	type MissingEntities,
	type TeamData,
	type PlayerData,
	type CompetitionData
} from '$lib/server/sync';
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
	approve: async ({ params, locals, request }) => {
		if (!locals.user?.isAdmin) return fail(403, { error: 'Unauthorized' });

		const goal = await db.select().from(goals).where(eq(goals.id, params.id)).get();

		if (!goal) {
			return fail(404, { error: 'Goal not found' });
		}

		const formData = await request.formData();
		const entityDataJson = formData.get('entityData');

		// If no entity data provided, check for missing entities first
		if (!entityDataJson) {
			const missing = await checkMissingEntities({
				team: goal.team,
				scorer: goal.scorer,
				opponent: goal.opponent,
				competition: goal.competition
			});

			// If there are missing entities, return them to the frontend
			if (Object.keys(missing).length > 0) {
				return {
					needsEntityData: true,
					missingEntities: missing as MissingEntities
				};
			}
		}

		// Parse entity data if provided
		let entityData: {
			team?: TeamData;
			player?: PlayerData;
			opponent?: TeamData;
			competition?: CompetitionData;
		} = {};

		if (entityDataJson && typeof entityDataJson === 'string') {
			try {
				entityData = JSON.parse(entityDataJson);
			} catch {
				return fail(400, { error: 'Invalid entity data format' });
			}
		}

		// Process entities with provided data
		await processGoalEntitiesWithData(
			{
				team: goal.team,
				scorer: goal.scorer,
				opponent: goal.opponent,
				competition: goal.competition
			},
			entityData
		);

		await db
			.update(goals)
			.set({
				status: 'approved',
				reviewedBy: locals.user?.id
			})
			.where(eq(goals.id, params.id));

		return { success: true, action: 'approved' };
	},

	reject: async ({ params, locals, request }) => {
		if (!locals.user?.isAdmin) return fail(403, { error: 'Unauthorized' });

		const goal = await db.select().from(goals).where(eq(goals.id, params.id)).get();

		if (!goal) {
			return fail(404, { error: 'Goal not found' });
		}

		const formData = await request.formData();
		const rejectionReason = formData.get('rejectionReason') as string | null;

		await db
			.update(goals)
			.set({
				status: 'rejected',
				rejectionReason: rejectionReason || null,
				reviewedBy: locals.user?.id
			})
			.where(eq(goals.id, params.id));

		return { success: true, action: 'rejected' };
	}
};
