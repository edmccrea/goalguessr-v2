import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { goals } from '$lib/server/db/schema';
import { and, eq, like } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	// Require authenticated user
	if (!locals.user) {
		return json({ error: 'You must be logged in to check for duplicates' }, { status: 401 });
	}

	const team = url.searchParams.get('team')?.trim();
	const scorer = url.searchParams.get('scorer')?.trim();
	const yearParam = url.searchParams.get('year');
	const year = yearParam ? parseInt(yearParam, 10) : null;

	if (!team || !scorer || !year) {
		return json({ error: 'Team, scorer, and year are required' }, { status: 400 });
	}

	try {
		// Search for goals with matching team, scorer, and year (case-insensitive)
		const existingGoals = await db
			.select({
				id: goals.id,
				team: goals.team,
				scorer: goals.scorer,
				year: goals.year,
				competition: goals.competition,
				opponent: goals.opponent,
				status: goals.status,
				submittedByUsername: goals.submittedByUsername
			})
			.from(goals)
			.where(
				and(
					like(goals.team, team),
					like(goals.scorer, scorer),
					eq(goals.year, year)
				)
			)
			.limit(10);

		if (existingGoals.length > 0) {
			return json({
				exists: true,
				matches: existingGoals,
				message: `Found ${existingGoals.length} existing goal(s) with similar details`
			});
		}

		return json({
			exists: false,
			matches: [],
			message: 'No matching goals found - this appears to be unique!'
		});
	} catch (error) {
		console.error('Duplicate check error:', error instanceof Error ? error.message : 'Unknown error');
		return json({ error: 'Failed to check for duplicates' }, { status: 500 });
	}
};
