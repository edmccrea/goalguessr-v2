import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { goals, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/register?redirect=/editor');
	}

	const resubmitId = url.searchParams.get('resubmit');
	let resubmitGoal = null;

	if (resubmitId) {
		// Load the goal to resubmit - must be owned by user and rejected
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
				rejectionReason: goals.rejectionReason
			})
			.from(goals)
			.where(
				and(
					eq(goals.id, resubmitId),
					eq(goals.submittedBy, locals.user.id),
					eq(goals.status, 'rejected')
				)
			)
			.get();

		if (goal) {
			resubmitGoal = goal;
		}
	}

	return {
		user: locals.user,
		resubmitGoal
	};
};

export const actions: Actions = {
	markTutorialSeen: async ({ locals }) => {
		if (!locals.user) {
			return { error: 'Not authenticated' };
		}

		await db
			.update(users)
			.set({ hasSeenEditorTutorial: true })
			.where(eq(users.id, locals.user.id));

		return { success: true };
	}
};
