import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { goals } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	getTodaysDailyGame,
	getOrCreateGameResult,
	getGuessesForGame
} from '$lib/server/game';

export const load: PageServerLoad = async ({ locals }) => {
	const dailyGame = await getTodaysDailyGame();
	const gameResult = await getOrCreateGameResult(locals.sessionId, dailyGame.id);
	const existingGuesses = await getGuessesForGame(gameResult.id);

	// Check if user has completed at least one round
	if (existingGuesses.length === 0) {
		throw redirect(303, '/play');
	}

	// Get goal IDs from daily game
	const goalIds = [dailyGame.goal1Id, dailyGame.goal2Id, dailyGame.goal3Id];

	// Build round results
	const roundResults = await Promise.all(
		[1, 2, 3].map(async (roundNumber) => {
			const goalId = goalIds[roundNumber - 1];
			const guess = existingGuesses.find((g) => g.roundNumber === roundNumber);

			if (!goalId) {
				return {
					roundNumber,
					completed: false,
					goal: null,
					guess: null
				};
			}

			const goal = await db.select().from(goals).where(eq(goals.id, goalId)).get();

			if (!guess) {
				return {
					roundNumber,
					completed: false,
					goal: goal
						? {
								team: goal.team,
								year: goal.year,
								scorer: goal.scorer,
								competition: goal.competition,
								opponent: goal.opponent,
								matchContext: goal.matchContext
							}
						: null,
					guess: null
				};
			}

			// Calculate individual scores
			const teamPoints = guess.teamCorrect ? 10 : 0;
			const yearPoints = guess.yearCorrect ? 10 : 0;
			const scorerPoints = guess.scorerCorrect ? 10 : 0;

			// Estimate speed bonus (total - other points)
			const guessScore = teamPoints + yearPoints + scorerPoints;

			return {
				roundNumber,
				completed: true,
				goal: goal
					? {
							team: goal.team,
							year: goal.year,
							scorer: goal.scorer,
							competition: goal.competition,
							opponent: goal.opponent,
							matchContext: goal.matchContext
						}
					: null,
				guess: {
					team: guess.guessedTeam,
					year: guess.guessedYear,
					scorer: guess.guessedScorer,
					teamCorrect: guess.teamCorrect,
					yearCorrect: guess.yearCorrect,
					scorerCorrect: guess.scorerCorrect,
					timeTakenMs: guess.timeTakenMs,
					score: guessScore
				}
			};
		})
	);

	const completedRounds = roundResults.filter((r) => r.completed).length;
	const allCompleted = completedRounds === 3;

	return {
		dailyGameId: dailyGame.id,
		roundResults,
		totalScore: gameResult.totalScore ?? 0,
		round1Score: gameResult.round1Score ?? 0,
		round2Score: gameResult.round2Score ?? 0,
		round3Score: gameResult.round3Score ?? 0,
		completedRounds,
		allCompleted
	};
};
