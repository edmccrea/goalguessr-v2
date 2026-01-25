import { dev } from '$app/environment';
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
 * Returns null if no approved goals are available (production behavior)
 * In dev mode, creates sample goals if none exist
 */
export async function getTodaysDailyGame() {
	const today = getToday();

	// Check if today's game exists
	let dailyGame = await db.select().from(dailyGames).where(eq(dailyGames.date, today)).get();

	if (!dailyGame) {
		// Get approved goals
		let availableGoals = await db.select().from(goals).where(eq(goals.status, 'approved')).all();

		// In dev mode only, create sample goals if none exist
		if (dev && availableGoals.length < 3) {
			await createSampleGoals();
			availableGoals = await db.select().from(goals).where(eq(goals.status, 'approved')).all();
		}

		// If still no approved goals, return null (no game available)
		if (availableGoals.length === 0) {
			return null;
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

	return dailyGame ?? null;
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
 * Get or set the start time for a specific round.
 * If the round hasn't been started yet, records the current time.
 * Returns the round start timestamp.
 */
export async function getOrSetRoundStartTime(gameResultId: string, roundNumber: number): Promise<Date> {
	const result = await db
		.select()
		.from(gameResults)
		.where(eq(gameResults.id, gameResultId))
		.get();

	if (!result) {
		throw new Error('Game result not found');
	}

	const startTimeField = roundNumber === 1 ? 'round1StartedAt' : roundNumber === 2 ? 'round2StartedAt' : 'round3StartedAt';
	const existingStartTime = result[startTimeField];

	if (existingStartTime) {
		return existingStartTime;
	}

	// Round hasn't been started yet, set the start time
	const now = new Date();
	await db
		.update(gameResults)
		.set({ [startTimeField]: now })
		.where(eq(gameResults.id, gameResultId));

	return now;
}

/**
 * Clear all game data and goals (for dev/testing)
 */
export async function clearAllGameData() {
	// Delete in order due to foreign key constraints
	await db.delete(guesses);
	await db.delete(gameResults);
	await db.delete(dailyGames);
	await db.delete(goals);
}

/**
 * Create sample goals for testing
 */
async function createSampleGoals() {
	const sampleGoalsData = [
		// Aguero's title-winning goal - Manchester City vs QPR, 2012
		// De Jong (Netherlands) → Balotelli (Italy) → Aguero (Argentina) scores
		{
			id: generateId(),
			team: 'Manchester City',
			year: 2012,
			scorer: 'Sergio Aguero',
			competition: 'Premier League',
			opponent: 'QPR',
			matchContext: '93:20 - Title-winning goal on the final day of the season',
			status: 'approved' as const,
			animationData: {
				duration: 5000,
				pitch: { width: 100, height: 65 },
				players: [
					{ id: 'dejong', imageUrl: 'https://flagcdn.com/w80/nl.png' }, // De Jong - Netherlands
					{ id: 'balotelli', imageUrl: 'https://flagcdn.com/w80/it.png' }, // Balotelli - Italy
					{ id: 'aguero', imageUrl: 'https://flagcdn.com/w80/ar.png' } // Aguero - Argentina
				],
				keyframes: [
					{
						time: 0,
						positions: {
							dejong: { x: 68, y: 25 },
							balotelli: { x: 82, y: 32 },
							aguero: { x: 75, y: 40 },
							ball: { x: 68, y: 25, holder: 'dejong' }
						}
					},
					{
						time: 1500,
						positions: {
							dejong: { x: 72, y: 28 },
							balotelli: { x: 88, y: 32 },
							aguero: { x: 80, y: 38 },
							ball: { x: 88, y: 32, holder: 'balotelli' }
						}
					},
					{
						time: 3000,
						positions: {
							dejong: { x: 78, y: 30 },
							balotelli: { x: 90, y: 30 },
							aguero: { x: 88, y: 35 },
							ball: { x: 88, y: 35, holder: 'aguero' }
						}
					},
					{
						time: 5000,
						positions: {
							dejong: { x: 82, y: 32 },
							balotelli: { x: 92, y: 28 },
							aguero: { x: 92, y: 34 },
							ball: { x: 99, y: 32 }
						}
					}
				],
				events: [
					{ time: 1000, type: 'pass', from: 'dejong', to: 'balotelli' },
					{ time: 2500, type: 'pass', from: 'balotelli', to: 'aguero' },
					{ time: 4500, type: 'shot', from: 'aguero', result: 'goal' }
				]
			}
		},
		// Zidane's volley - Real Madrid vs Bayer Leverkusen, 2002 Champions League Final
		// Roberto Carlos (Brazil) crosses, Zidane (France) volleys
		{
			id: generateId(),
			team: 'Real Madrid',
			year: 2002,
			scorer: 'Zinedine Zidane',
			competition: 'Champions League Final',
			opponent: 'Bayer Leverkusen',
			matchContext: 'Stunning left-foot volley to win the Champions League',
			status: 'approved' as const,
			animationData: {
				duration: 5000,
				pitch: { width: 100, height: 65 },
				players: [
					{ id: 'carlos', imageUrl: 'https://flagcdn.com/w80/br.png' }, // Roberto Carlos - Brazil
					{ id: 'zidane', imageUrl: 'https://flagcdn.com/w80/fr.png' } // Zidane - France
				],
				keyframes: [
					{
						time: 0,
						positions: {
							carlos: { x: 75, y: 8 },
							zidane: { x: 82, y: 38 },
							ball: { x: 75, y: 8, holder: 'carlos' }
						}
					},
					{
						time: 2000,
						positions: {
							carlos: { x: 78, y: 6 },
							zidane: { x: 86, y: 32 },
							ball: { x: 85, y: 20 }
						}
					},
					{
						time: 3500,
						positions: {
							carlos: { x: 80, y: 8 },
							zidane: { x: 88, y: 28 },
							ball: { x: 88, y: 28, holder: 'zidane' }
						}
					},
					{
						time: 5000,
						positions: {
							carlos: { x: 82, y: 10 },
							zidane: { x: 90, y: 30 },
							ball: { x: 99, y: 30 }
						}
					}
				],
				events: [
					{ time: 1500, type: 'pass', from: 'carlos', to: 'zidane', curve: 0.4 },
					{ time: 4200, type: 'shot', from: 'zidane', result: 'goal' }
				]
			}
		},
		// Messi's solo goal vs Getafe - Barcelona, 2007
		// Just Messi (Argentina) - solo run
		{
			id: generateId(),
			team: 'Barcelona',
			year: 2007,
			scorer: 'Lionel Messi',
			competition: 'Copa del Rey Semi-final',
			opponent: 'Getafe',
			matchContext: 'Maradona-esque solo run from the halfway line',
			status: 'approved' as const,
			animationData: {
				duration: 7000,
				pitch: { width: 100, height: 65 },
				players: [
					{ id: 'messi', imageUrl: 'https://flagcdn.com/w80/ar.png' } // Messi - Argentina
				],
				keyframes: [
					{
						time: 0,
						positions: {
							messi: { x: 50, y: 42 },
							ball: { x: 50, y: 42, holder: 'messi' }
						}
					},
					{
						time: 1500,
						positions: {
							messi: { x: 58, y: 38 },
							ball: { x: 58, y: 38, holder: 'messi' }
						}
					},
					{
						time: 3000,
						positions: {
							messi: { x: 68, y: 35 },
							ball: { x: 68, y: 35, holder: 'messi' }
						}
					},
					{
						time: 4500,
						positions: {
							messi: { x: 78, y: 36 },
							ball: { x: 78, y: 36, holder: 'messi' }
						}
					},
					{
						time: 5500,
						positions: {
							messi: { x: 88, y: 34 },
							ball: { x: 88, y: 34, holder: 'messi' }
						}
					},
					{
						time: 7000,
						positions: {
							messi: { x: 93, y: 33 },
							ball: { x: 99, y: 32 }
						}
					}
				],
				events: [
					{ time: 1200, type: 'dribble', from: 'messi' },
					{ time: 2700, type: 'dribble', from: 'messi' },
					{ time: 4200, type: 'dribble', from: 'messi' },
					{ time: 5200, type: 'dribble', from: 'messi' },
					{ time: 6500, type: 'shot', from: 'messi', result: 'goal' }
				]
			}
		}
	];

	for (const goalData of sampleGoalsData) {
		await db.insert(goals).values(goalData);
	}
}
