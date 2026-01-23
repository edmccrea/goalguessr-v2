import { db } from './db';
import { dailyGames, goals, gameResults, guesses } from './db/schema';
import { eq, and } from 'drizzle-orm';

function generateId(): string {
	return crypto.randomUUID();
}

function getToday(): string {
	return new Date().toISOString().split('T')[0];
}

/**
 * Get or create today's daily game
 * For now, uses sample goals. In production, would select from approved goals.
 */
export async function getTodaysDailyGame() {
	const today = getToday();

	// Check if today's game exists
	let dailyGame = await db.select().from(dailyGames).where(eq(dailyGames.date, today)).get();

	if (!dailyGame) {
		// Get approved goals (or create sample ones if none exist)
		let availableGoals = await db.select().from(goals).where(eq(goals.status, 'approved')).all();

		// If no approved goals, create sample goals for testing
		if (availableGoals.length < 3) {
			await createSampleGoals();
			availableGoals = await db.select().from(goals).where(eq(goals.status, 'approved')).all();
		}

		// Select 3 goals for today (just take first 3 for now)
		const selectedGoals = availableGoals.slice(0, 3);

		// Create daily game
		const dailyGameId = generateId();
		await db.insert(dailyGames).values({
			id: dailyGameId,
			date: today,
			goal1Id: selectedGoals[0]?.id ?? null,
			goal2Id: selectedGoals[1]?.id ?? null,
			goal3Id: selectedGoals[2]?.id ?? null
		});

		dailyGame = await db.select().from(dailyGames).where(eq(dailyGames.id, dailyGameId)).get();
	}

	return dailyGame!;
}

/**
 * Get the goal for a specific round of today's game
 */
export async function getGoalForRound(dailyGameId: string, roundNumber: number) {
	const dailyGame = await db.select().from(dailyGames).where(eq(dailyGames.id, dailyGameId)).get();

	if (!dailyGame) return null;

	const goalIds = [dailyGame.goal1Id, dailyGame.goal2Id, dailyGame.goal3Id];
	const goalId = goalIds[roundNumber - 1];

	if (!goalId) return null;

	return db.select().from(goals).where(eq(goals.id, goalId)).get();
}

/**
 * Get or create game result for a session and daily game
 */
export async function getOrCreateGameResult(sessionId: string, dailyGameId: string) {
	let result = await db
		.select()
		.from(gameResults)
		.where(and(eq(gameResults.sessionId, sessionId), eq(gameResults.dailyGameId, dailyGameId)))
		.get();

	if (!result) {
		const id = generateId();
		await db.insert(gameResults).values({
			id,
			sessionId,
			dailyGameId,
			round1Score: 0,
			round2Score: 0,
			round3Score: 0,
			totalScore: 0
		});
		result = await db.select().from(gameResults).where(eq(gameResults.id, id)).get();
	}

	return result!;
}

/**
 * Save a guess for a round
 */
export async function saveGuess(
	gameResultId: string,
	goalId: string,
	roundNumber: number,
	guess: {
		team: string;
		year: number;
		scorer: string;
	},
	results: {
		teamCorrect: boolean;
		yearCorrect: boolean;
		scorerCorrect: boolean;
		totalPoints: number;
		timeTakenMs: number;
	}
) {
	const guessId = generateId();

	await db.insert(guesses).values({
		id: guessId,
		gameResultId,
		goalId,
		roundNumber,
		guessedTeam: guess.team,
		guessedYear: guess.year,
		guessedScorer: guess.scorer,
		teamCorrect: results.teamCorrect,
		yearCorrect: results.yearCorrect,
		scorerCorrect: results.scorerCorrect,
		timeTakenMs: results.timeTakenMs
	});

	// Update game result with round score
	const scoreField =
		roundNumber === 1 ? 'round1Score' : roundNumber === 2 ? 'round2Score' : 'round3Score';

	const currentResult = await db
		.select()
		.from(gameResults)
		.where(eq(gameResults.id, gameResultId))
		.get();

	if (currentResult) {
		const updates: Record<string, number> = {
			[scoreField]: results.totalPoints,
			totalScore:
				(roundNumber === 1 ? results.totalPoints : currentResult.round1Score ?? 0) +
				(roundNumber === 2 ? results.totalPoints : currentResult.round2Score ?? 0) +
				(roundNumber === 3 ? results.totalPoints : currentResult.round3Score ?? 0)
		};

		await db.update(gameResults).set(updates).where(eq(gameResults.id, gameResultId));
	}

	return guessId;
}

/**
 * Get existing guesses for a game result
 */
export async function getGuessesForGame(gameResultId: string) {
	return db.select().from(guesses).where(eq(guesses.gameResultId, gameResultId)).all();
}

/**
 * Create sample goals for testing
 */
async function createSampleGoals() {
	const sampleGoalsData = [
		{
			id: generateId(),
			team: 'Manchester United',
			year: 1999,
			scorer: 'Ole Gunnar Solskjaer',
			competition: 'Champions League Final',
			opponent: 'Bayern Munich',
			matchContext: 'Injury time winner to complete the treble',
			status: 'approved' as const,
			animationData: {
				duration: 5000,
				pitch: { width: 100, height: 65 },
				players: [
					{ id: 'p1' },
					{ id: 'p2' },
					{ id: 'p3' },
					{ id: 'd1' },
					{ id: 'd2' },
					{ id: 'gk' }
				],
				keyframes: [
					{
						time: 0,
						positions: {
							p1: { x: 65, y: 20 },
							p2: { x: 70, y: 45 },
							p3: { x: 85, y: 35 },
							d1: { x: 88, y: 30 },
							d2: { x: 88, y: 40 },
							gk: { x: 96, y: 32 },
							ball: { x: 65, y: 20, holder: 'p1' }
						}
					},
					{
						time: 2000,
						positions: {
							p1: { x: 70, y: 15 },
							p2: { x: 78, y: 40 },
							p3: { x: 90, y: 32 },
							d1: { x: 90, y: 28 },
							d2: { x: 90, y: 38 },
							gk: { x: 97, y: 32 },
							ball: { x: 70, y: 15, holder: 'p1' }
						}
					},
					{
						time: 3500,
						positions: {
							p1: { x: 72, y: 12 },
							p2: { x: 80, y: 38 },
							p3: { x: 92, y: 32 },
							d1: { x: 91, y: 26 },
							d2: { x: 91, y: 36 },
							gk: { x: 97, y: 30 },
							ball: { x: 92, y: 32, holder: 'p3' }
						}
					},
					{
						time: 5000,
						positions: {
							p1: { x: 75, y: 10 },
							p2: { x: 82, y: 36 },
							p3: { x: 94, y: 32 },
							d1: { x: 92, y: 28 },
							d2: { x: 92, y: 38 },
							gk: { x: 98, y: 28 },
							ball: { x: 99, y: 32 }
						}
					}
				],
				events: [
					{ time: 3000, type: 'pass', from: 'p1', to: 'p3' },
					{ time: 4500, type: 'shot', from: 'p3', result: 'goal' }
				]
			}
		},
		{
			id: generateId(),
			team: 'Argentina',
			year: 1986,
			scorer: 'Diego Maradona',
			competition: 'World Cup Quarter-final',
			opponent: 'England',
			matchContext: 'Goal of the Century - solo run from own half',
			isInternational: true,
			status: 'approved' as const,
			animationData: {
				duration: 6000,
				pitch: { width: 100, height: 65 },
				players: [
					{ id: 'p1' },
					{ id: 'd1' },
					{ id: 'd2' },
					{ id: 'd3' },
					{ id: 'd4' },
					{ id: 'gk' }
				],
				keyframes: [
					{
						time: 0,
						positions: {
							p1: { x: 45, y: 32 },
							d1: { x: 55, y: 28 },
							d2: { x: 60, y: 38 },
							d3: { x: 75, y: 30 },
							d4: { x: 80, y: 35 },
							gk: { x: 95, y: 32 },
							ball: { x: 45, y: 32, holder: 'p1' }
						}
					},
					{
						time: 1500,
						positions: {
							p1: { x: 58, y: 30 },
							d1: { x: 56, y: 32 },
							d2: { x: 62, y: 35 },
							d3: { x: 75, y: 30 },
							d4: { x: 80, y: 35 },
							gk: { x: 95, y: 32 },
							ball: { x: 58, y: 30, holder: 'p1' }
						}
					},
					{
						time: 3000,
						positions: {
							p1: { x: 72, y: 28 },
							d1: { x: 65, y: 32 },
							d2: { x: 70, y: 35 },
							d3: { x: 78, y: 30 },
							d4: { x: 82, y: 33 },
							gk: { x: 95, y: 32 },
							ball: { x: 72, y: 28, holder: 'p1' }
						}
					},
					{
						time: 4500,
						positions: {
							p1: { x: 88, y: 32 },
							d1: { x: 80, y: 30 },
							d2: { x: 82, y: 35 },
							d3: { x: 86, y: 28 },
							d4: { x: 88, y: 36 },
							gk: { x: 96, y: 34 },
							ball: { x: 88, y: 32, holder: 'p1' }
						}
					},
					{
						time: 6000,
						positions: {
							p1: { x: 92, y: 32 },
							d1: { x: 85, y: 30 },
							d2: { x: 87, y: 35 },
							d3: { x: 90, y: 28 },
							d4: { x: 90, y: 36 },
							gk: { x: 97, y: 30 },
							ball: { x: 99, y: 32 }
						}
					}
				],
				events: [
					{ time: 1200, type: 'dribble', from: 'p1' },
					{ time: 2700, type: 'dribble', from: 'p1' },
					{ time: 4200, type: 'dribble', from: 'p1' },
					{ time: 5500, type: 'shot', from: 'p1', result: 'goal' }
				]
			}
		},
		{
			id: generateId(),
			team: 'Liverpool',
			year: 2005,
			scorer: 'Steven Gerrard',
			competition: 'Champions League Final',
			opponent: 'AC Milan',
			matchContext: 'Header to start the comeback from 3-0 down',
			status: 'approved' as const,
			animationData: {
				duration: 4000,
				pitch: { width: 100, height: 65 },
				players: [
					{ id: 'p1' },
					{ id: 'p2' },
					{ id: 'd1' },
					{ id: 'd2' },
					{ id: 'gk' }
				],
				keyframes: [
					{
						time: 0,
						positions: {
							p1: { x: 70, y: 10 },
							p2: { x: 85, y: 35 },
							d1: { x: 88, y: 28 },
							d2: { x: 88, y: 40 },
							gk: { x: 96, y: 32 },
							ball: { x: 70, y: 10, holder: 'p1' }
						}
					},
					{
						time: 2000,
						positions: {
							p1: { x: 75, y: 8 },
							p2: { x: 90, y: 32 },
							d1: { x: 90, y: 30 },
							d2: { x: 90, y: 38 },
							gk: { x: 96, y: 32 },
							ball: { x: 90, y: 32 }
						}
					},
					{
						time: 4000,
						positions: {
							p1: { x: 78, y: 8 },
							p2: { x: 92, y: 32 },
							d1: { x: 91, y: 30 },
							d2: { x: 91, y: 38 },
							gk: { x: 97, y: 35 },
							ball: { x: 99, y: 32 }
						}
					}
				],
				events: [
					{ time: 1500, type: 'pass', from: 'p1', to: 'p2' },
					{ time: 3500, type: 'shot', from: 'p2', result: 'goal' }
				]
			}
		}
	];

	for (const goalData of sampleGoalsData) {
		await db.insert(goals).values(goalData);
	}
}
