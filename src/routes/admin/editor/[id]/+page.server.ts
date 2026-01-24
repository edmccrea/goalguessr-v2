import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { goals } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const goal = await db.query.goals.findFirst({
		where: eq(goals.id, params.id)
	});

	if (!goal) {
		throw error(404, 'Goal not found');
	}

	return {
		goal
	};
};
