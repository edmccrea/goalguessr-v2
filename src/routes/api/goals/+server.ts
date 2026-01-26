import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { goals } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { AnimationData } from '$lib/server/db/schema';

interface GoalSubmission {
	team: string;
	year: number;
	scorer: string;
	competition?: string;
	opponent?: string;
	matchContext?: string;
	videoUrl?: string;
	isInternational?: boolean;
	animationData: AnimationData;
	resubmitId?: string;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	// Require authenticated user
	if (!locals.user) {
		return json({ error: 'You must be logged in to submit a goal' }, { status: 401 });
	}

	try {
		const body = (await request.json()) as GoalSubmission;

		// Validate required fields
		if (!body.team?.trim()) {
			return json({ error: 'Team is required' }, { status: 400 });
		}

		if (!body.scorer?.trim()) {
			return json({ error: 'Scorer is required' }, { status: 400 });
		}

		if (!body.year || body.year < 1900 || body.year > new Date().getFullYear() + 1) {
			return json({ error: 'Invalid year' }, { status: 400 });
		}

		if (!body.animationData) {
			return json({ error: 'Animation data is required' }, { status: 400 });
		}

		// Validate animation data structure
		const anim = body.animationData;
		if (!anim.players || anim.players.length === 0) {
			return json({ error: 'Animation must have at least one player' }, { status: 400 });
		}

		if (!anim.keyframes || anim.keyframes.length < 2) {
			return json({ error: 'Animation must have at least 2 keyframes' }, { status: 400 });
		}

		if (!anim.events?.some((e) => e.type === 'shot')) {
			return json({ error: 'Animation must have a shot event' }, { status: 400 });
		}

		// Handle resubmission of rejected goal
		if (body.resubmitId) {
			// Verify the goal exists, is owned by the user, and is rejected
			const existingGoal = await db
				.select({ id: goals.id, status: goals.status })
				.from(goals)
				.where(
					and(
						eq(goals.id, body.resubmitId),
						eq(goals.submittedBy, locals.user.id)
					)
				)
				.get();

			if (!existingGoal) {
				return json({ error: 'Goal not found' }, { status: 404 });
			}

			if (existingGoal.status !== 'rejected') {
				return json({ error: 'Only rejected goals can be resubmitted' }, { status: 400 });
			}

			// Update the existing goal
			await db.update(goals)
				.set({
					team: body.team.trim(),
					year: body.year,
					scorer: body.scorer.trim(),
					competition: body.competition?.trim() || null,
					opponent: body.opponent?.trim() || null,
					matchContext: body.matchContext?.trim() || null,
					videoUrl: body.videoUrl?.trim() || null,
					isInternational: body.isInternational ?? false,
					animationData: body.animationData,
					status: 'pending',
					rejectionReason: null,
					reviewedBy: null
				})
				.where(eq(goals.id, body.resubmitId));

			return json({ success: true, id: body.resubmitId, resubmitted: true }, { status: 200 });
		}

		// Create new goal
		const id = crypto.randomUUID();

		await db.insert(goals).values({
			id,
			team: body.team.trim(),
			year: body.year,
			scorer: body.scorer.trim(),
			competition: body.competition?.trim() || null,
			opponent: body.opponent?.trim() || null,
			matchContext: body.matchContext?.trim() || null,
			videoUrl: body.videoUrl?.trim() || null,
			isInternational: body.isInternational ?? false,
			animationData: body.animationData,
			status: 'pending',
			submittedBy: locals.user.id,
			submittedByUsername: locals.user.username
		});

		return json({ success: true, id }, { status: 201 });
	} catch (error) {
		console.error('Goal submission error:', error);
		return json({ error: 'Failed to submit goal' }, { status: 500 });
	}
};
