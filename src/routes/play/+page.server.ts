import type { PageServerLoad, Actions } from './$types';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { gameResults, guesses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getTodaysDailyGame, getOrCreateGameResult, getGuessesForGame } from '$lib/server/game';

export const load: PageServerLoad = async ({ locals }) => {
	const dailyGame = await getTodaysDailyGame();
	const gameResult = await getOrCreateGameResult(locals.sessionId, dailyGame.id);
	const existingGuesses = await getGuessesForGame(gameResult.id);

	// Determine round status
	const roundStatus = [1, 2, 3].map((roundNumber) => {
		const guess = existingGuesses.find((g) => g.roundNumber === roundNumber);
		return {
			roundNumber,
			completed: !!guess,
			score: guess
				? (guess.teamCorrect ? 10 : 0) +
					(guess.yearCorrect ? 10 : 0) +
					(guess.scorerCorrect ? 10 : 0)
				: null
		};
	});

	return {
		dailyGameId: dailyGame.id,
		sessionId: locals.sessionId,
		roundStatus,
		totalScore: gameResult.totalScore ?? 0,
		allCompleted: roundStatus.every((r) => r.completed),
		isDev: dev
	};
};

export const actions: Actions = {
	reset: async ({ locals }) => {
		// Only allow in dev mode
		if (!dev) {
			return { error: 'Reset only available in dev mode' };
		}

		const dailyGame = await getTodaysDailyGame();
		const gameResult = await db
			.select()
			.from(gameResults)
			.where(eq(gameResults.sessionId, locals.sessionId))
			.get();

		if (gameResult) {
			// Delete guesses first (foreign key constraint)
			await db.delete(guesses).where(eq(guesses.gameResultId, gameResult.id));
			// Delete game result
			await db.delete(gameResults).where(eq(gameResults.id, gameResult.id));
		}

		return { success: true };
	}
};
