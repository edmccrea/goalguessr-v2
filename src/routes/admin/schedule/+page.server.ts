import { db } from '$lib/server/db';
import { goals, dailyGames, goalQueue } from '$lib/server/db/schema';
import { eq, sql, gte, and, notInArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function generateId(): string {
	return crypto.randomUUID();
}

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().split('T')[0];

	// Get upcoming scheduled games (next 14 days)
	const upcomingDates: string[] = [];
	for (let i = 0; i < 14; i++) {
		const date = new Date();
		date.setDate(date.getDate() + i);
		upcomingDates.push(date.toISOString().split('T')[0]);
	}

	// Get existing daily games for these dates
	const existingGames = await db
		.select({
			id: dailyGames.id,
			date: dailyGames.date,
			goal1Id: dailyGames.goal1Id,
			goal2Id: dailyGames.goal2Id,
			goal3Id: dailyGames.goal3Id
		})
		.from(dailyGames)
		.where(gte(dailyGames.date, today));

	// Get queued goals
	const queuedGoals = await db
		.select({
			id: goalQueue.id,
			goalId: goalQueue.goalId,
			scheduledDate: goalQueue.scheduledDate,
			position: goalQueue.position,
			team: goals.team,
			scorer: goals.scorer,
			year: goals.year
		})
		.from(goalQueue)
		.innerJoin(goals, eq(goalQueue.goalId, goals.id))
		.where(gte(goalQueue.scheduledDate, today))
		.orderBy(goalQueue.scheduledDate, goalQueue.position);

	// Get available approved goals (not recently used)
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	// Get goal IDs used in recent daily games
	const recentGames = await db
		.select({
			goal1Id: dailyGames.goal1Id,
			goal2Id: dailyGames.goal2Id,
			goal3Id: dailyGames.goal3Id
		})
		.from(dailyGames)
		.where(gte(dailyGames.date, thirtyDaysAgo.toISOString().split('T')[0]));

	const recentGoalIds = new Set<string>();
	recentGames.forEach((game) => {
		if (game.goal1Id) recentGoalIds.add(game.goal1Id);
		if (game.goal2Id) recentGoalIds.add(game.goal2Id);
		if (game.goal3Id) recentGoalIds.add(game.goal3Id);
	});

	// Get all approved goals
	const approvedGoals = await db
		.select({
			id: goals.id,
			team: goals.team,
			scorer: goals.scorer,
			year: goals.year,
			competition: goals.competition
		})
		.from(goals)
		.where(eq(goals.status, 'approved'))
		.orderBy(sql`RANDOM()`);

	// Mark which goals were recently used
	const availableGoals = approvedGoals.map((goal) => ({
		...goal,
		recentlyUsed: recentGoalIds.has(goal.id)
	}));

	// Build schedule data for the next 14 days
	const schedule = upcomingDates.map((date) => {
		const existingGame = existingGames.find((g) => g.date === date);
		const queuedForDate = queuedGoals.filter((q) => q.scheduledDate === date);

		return {
			date,
			isToday: date === today,
			hasGame: !!existingGame,
			gameId: existingGame?.id,
			queuedGoals: queuedForDate,
			slots: [
				existingGame?.goal1Id || queuedForDate.find((q) => q.position === 1)?.goalId || null,
				existingGame?.goal2Id || queuedForDate.find((q) => q.position === 2)?.goalId || null,
				existingGame?.goal3Id || queuedForDate.find((q) => q.position === 3)?.goalId || null
			]
		};
	});

	return {
		schedule,
		availableGoals,
		queuedGoals
	};
};

export const actions: Actions = {
	scheduleGoal: async ({ request }) => {
		const formData = await request.formData();
		const goalId = formData.get('goalId') as string;
		const date = formData.get('date') as string;
		const position = parseInt(formData.get('position') as string);

		if (!goalId || !date || !position) {
			return fail(400, { error: 'Missing required fields' });
		}

		if (position < 1 || position > 3) {
			return fail(400, { error: 'Position must be 1, 2, or 3' });
		}

		// Check if slot is already taken
		const existing = await db
			.select()
			.from(goalQueue)
			.where(and(eq(goalQueue.scheduledDate, date), eq(goalQueue.position, position)))
			.get();

		if (existing) {
			// Update existing
			await db
				.update(goalQueue)
				.set({ goalId })
				.where(eq(goalQueue.id, existing.id));
		} else {
			// Insert new
			await db.insert(goalQueue).values({
				id: generateId(),
				goalId,
				scheduledDate: date,
				position
			});
		}

		return { success: true };
	},

	removeFromQueue: async ({ request }) => {
		const formData = await request.formData();
		const queueId = formData.get('queueId') as string;

		if (!queueId) {
			return fail(400, { error: 'Queue ID required' });
		}

		await db.delete(goalQueue).where(eq(goalQueue.id, queueId));

		return { success: true };
	},

	createDailyGame: async ({ request }) => {
		const formData = await request.formData();
		const date = formData.get('date') as string;

		if (!date) {
			return fail(400, { error: 'Date required' });
		}

		// Get queued goals for this date
		const queued = await db
			.select()
			.from(goalQueue)
			.innerJoin(goals, eq(goalQueue.goalId, goals.id))
			.where(eq(goalQueue.scheduledDate, date))
			.orderBy(goalQueue.position);

		const goal1 = queued.find((q) => q.goal_queue.position === 1)?.goal_queue.goalId;
		const goal2 = queued.find((q) => q.goal_queue.position === 2)?.goal_queue.goalId;
		const goal3 = queued.find((q) => q.goal_queue.position === 3)?.goal_queue.goalId;

		if (!goal1 || !goal2 || !goal3) {
			// Auto-fill missing slots with random approved goals
			const usedIds = [goal1, goal2, goal3].filter(Boolean) as string[];

			const availableForAutoFill = await db
				.select({ id: goals.id })
				.from(goals)
				.where(
					and(
						eq(goals.status, 'approved'),
						usedIds.length > 0 ? notInArray(goals.id, usedIds) : sql`1=1`
					)
				)
				.orderBy(sql`RANDOM()`)
				.limit(3 - usedIds.length);

			const autoFillIds = availableForAutoFill.map((g) => g.id);
			let autoFillIndex = 0;

			const finalGoal1 = goal1 || autoFillIds[autoFillIndex++];
			const finalGoal2 = goal2 || autoFillIds[autoFillIndex++];
			const finalGoal3 = goal3 || autoFillIds[autoFillIndex++];

			if (!finalGoal1 || !finalGoal2 || !finalGoal3) {
				return fail(400, { error: 'Not enough approved goals to create daily game' });
			}

			// Check if game already exists
			const existing = await db.select().from(dailyGames).where(eq(dailyGames.date, date)).get();

			if (existing) {
				await db
					.update(dailyGames)
					.set({
						goal1Id: finalGoal1,
						goal2Id: finalGoal2,
						goal3Id: finalGoal3
					})
					.where(eq(dailyGames.id, existing.id));
			} else {
				await db.insert(dailyGames).values({
					id: generateId(),
					date,
					goal1Id: finalGoal1,
					goal2Id: finalGoal2,
					goal3Id: finalGoal3
				});
			}

			// Clear the queue for this date
			await db.delete(goalQueue).where(eq(goalQueue.scheduledDate, date));

			return { success: true, autoFilled: true };
		}

		// Check if game already exists
		const existing = await db.select().from(dailyGames).where(eq(dailyGames.date, date)).get();

		if (existing) {
			await db
				.update(dailyGames)
				.set({
					goal1Id: goal1,
					goal2Id: goal2,
					goal3Id: goal3
				})
				.where(eq(dailyGames.id, existing.id));
		} else {
			await db.insert(dailyGames).values({
				id: generateId(),
				date,
				goal1Id: goal1,
				goal2Id: goal2,
				goal3Id: goal3
			});
		}

		// Clear the queue for this date
		await db.delete(goalQueue).where(eq(goalQueue.scheduledDate, date));

		return { success: true };
	}
};
