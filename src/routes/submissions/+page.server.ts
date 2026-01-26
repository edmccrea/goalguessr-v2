import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { goals } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login?redirect=/submissions');
	}

	const submissions = await db
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
			rejectionReason: goals.rejectionReason,
			createdAt: goals.createdAt
		})
		.from(goals)
		.where(eq(goals.submittedBy, locals.user.id))
		.orderBy(desc(goals.createdAt));

	return {
		submissions
	};
};
