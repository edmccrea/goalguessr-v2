import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import {
	getTodaysDailyGame,
	getGoalForRound,
	getOrCreateGameResult,
	getGuessesForGame,
	saveGuess
} from '$lib/server/game';
import { calculateScore } from '$lib/scoring';

export const load: PageServerLoad = async ({ params, locals }) => {
	const roundNumber = parseInt(params.round);

	if (isNaN(roundNumber) || roundNumber < 1 || roundNumber > 3) {
		throw redirect(303, '/play/1');
	}

	const dailyGame = await getTodaysDailyGame();
	const gameResult = await getOrCreateGameResult(locals.sessionId, dailyGame.id);
	const existingGuesses = await getGuessesForGame(gameResult.id);

	// Check if this round is already completed
	const thisRoundGuess = existingGuesses.find((g) => g.roundNumber === roundNumber);
	if (thisRoundGuess) {
		// Round already completed, redirect to results or next round
		const nextRound = roundNumber + 1;
		if (nextRound <= 3) {
			const nextRoundGuess = existingGuesses.find((g) => g.roundNumber === nextRound);
			if (!nextRoundGuess) {
				throw redirect(303, `/play/${nextRound}`);
			}
		}
		throw redirect(303, '/results');
	}

	// Check if previous round is completed (except for round 1)
	if (roundNumber > 1) {
		const prevRoundGuess = existingGuesses.find((g) => g.roundNumber === roundNumber - 1);
		if (!prevRoundGuess) {
			throw redirect(303, `/play/${roundNumber - 1}`);
		}
	}

	// Get the goal for this round (only return animation data, not answers)
	const goal = await getGoalForRound(dailyGame.id, roundNumber);

	if (!goal) {
		throw redirect(303, '/play/1');
	}

	return {
		roundNumber,
		dailyGameId: dailyGame.id,
		goalId: goal.id,
		animationData: goal.animationData,
		isInternational: goal.isInternational
	};
};

export const actions: Actions = {
	submit: async ({ request, params, locals }) => {
		const roundNumber = parseInt(params.round);

		if (isNaN(roundNumber) || roundNumber < 1 || roundNumber > 3) {
			return fail(400, { error: 'Invalid round number' });
		}

		const formData = await request.formData();
		const team = (formData.get('team') as string)?.trim();
		const yearStr = formData.get('year') as string;
		const scorer = (formData.get('scorer') as string)?.trim();
		const timeTakenMs = parseInt(formData.get('timeTakenMs') as string) || 0;

		// Validate inputs
		if (!team) {
			return fail(400, { error: 'Please enter a team name', team, year: yearStr, scorer });
		}
		if (!yearStr) {
			return fail(400, { error: 'Please enter a year', team, year: yearStr, scorer });
		}
		const year = parseInt(yearStr);
		if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
			return fail(400, { error: 'Please enter a valid year', team, year: yearStr, scorer });
		}
		if (!scorer) {
			return fail(400, { error: 'Please enter a goalscorer name', team, year: yearStr, scorer });
		}

		const dailyGame = await getTodaysDailyGame();
		const gameResult = await getOrCreateGameResult(locals.sessionId, dailyGame.id);

		// Check if already submitted
		const existingGuesses = await getGuessesForGame(gameResult.id);
		if (existingGuesses.find((g) => g.roundNumber === roundNumber)) {
			return fail(400, { error: 'You have already submitted a guess for this round' });
		}

		// Get the correct answer
		const goal = await getGoalForRound(dailyGame.id, roundNumber);
		if (!goal) {
			return fail(500, { error: 'Goal not found' });
		}

		// Calculate score
		const result = calculateScore(
			{ team, year, scorer, timeTakenMs },
			{ team: goal.team, year: goal.year, scorer: goal.scorer }
		);

		// Save the guess
		await saveGuess(gameResult.id, goal.id, roundNumber, { team, year, scorer }, {
			teamCorrect: result.teamCorrect,
			yearCorrect: result.yearCorrect || result.yearClose,
			scorerCorrect: result.scorerCorrect,
			totalPoints: result.totalPoints,
			timeTakenMs
		});

		// Return result for display
		return {
			success: true,
			result: {
				...result,
				correctAnswer: {
					team: goal.team,
					year: goal.year,
					scorer: goal.scorer,
					competition: goal.competition,
					opponent: goal.opponent,
					matchContext: goal.matchContext
				}
			},
			nextRound: roundNumber < 3 ? roundNumber + 1 : null
		};
	}
};
