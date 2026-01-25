import type { PageServerLoad, Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { gameResults, guesses } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTodaysDailyGame, getOrCreateGameResult, getGuessesForGame, clearAllGameData } from '$lib/server/game';

export const load: PageServerLoad = async ({ locals, url }) => {
	const dailyGame = await getTodaysDailyGame();

	// No game available - show error page
	if (!dailyGame) {
		throw error(503, {
			message: 'No game available today',
			details: 'There are no approved goals in the system yet. Check back later!'
		});
	}

	// Allow dev tools page to be accessed directly
	if (url.searchParams.has('dev') && dev) {
		const gameResult = await getOrCreateGameResult(locals.sessionId, dailyGame.id);
		return { isDev: dev };
	}

	const gameResult = await getOrCreateGameResult(locals.sessionId, dailyGame.id);
	const existingGuesses = await getGuessesForGame(gameResult.id);

	// Determine round status
	const roundStatus = [1, 2, 3].map((roundNumber) => {
		const guess = existingGuesses.find((g) => g.roundNumber === roundNumber);
		return {
			roundNumber,
			completed: !!guess
		};
	});

	const allCompleted = roundStatus.every((r) => r.completed);

	// Redirect to first incomplete round or results if all done
	if (allCompleted) {
		throw redirect(303, '/results');
	}

	const firstIncompleteRound = roundStatus.find((r) => !r.completed);
	throw redirect(303, `/play/${firstIncompleteRound?.roundNumber ?? 1}`);
};

export const actions: Actions = {
	reset: async ({ locals }) => {
		// Only allow in dev mode
		if (!dev) {
			return { error: 'Reset only available in dev mode' };
		}

		const dailyGame = await getTodaysDailyGame();
		if (!dailyGame) {
			return { error: 'No game available' };
		}

		const gameResult = await db
			.select()
			.from(gameResults)
			.where(and(eq(gameResults.sessionId, locals.sessionId), eq(gameResults.dailyGameId, dailyGame.id)))
			.get();

		if (gameResult) {
			// Delete guesses first (foreign key constraint)
			await db.delete(guesses).where(eq(guesses.gameResultId, gameResult.id));
			// Delete game result
			await db.delete(gameResults).where(eq(gameResults.id, gameResult.id));
		}

		return { success: true };
	},

	resetAll: async () => {
		// Only allow in dev mode
		if (!dev) {
			return { error: 'Reset only available in dev mode' };
		}

		// Clear all game data and goals - new sample goals will be created on next load
		await clearAllGameData();

		return { success: true };
	}
};
