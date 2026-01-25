import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { goals, guesses } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import {
	getTodaysDailyGame,
	getOrCreateGameResult,
	getGuessesForGame
} from '$lib/server/game';

interface CommunityStats {
	totalGuesses: number;
	teamCorrectPercent: number;
	yearCorrectPercent: number;
	scorerCorrectPercent: number;
	mostGuessedTeam: string | null;
	mostGuessedYear: number | null;
	mostGuessedScorer: string | null;
}

async function getCommunityStats(goalId: string): Promise<CommunityStats> {
	// Get all guesses for this goal
	const allGuesses = await db
		.select({
			guessedTeam: guesses.guessedTeam,
			guessedYear: guesses.guessedYear,
			guessedScorer: guesses.guessedScorer,
			teamCorrect: guesses.teamCorrect,
			yearCorrect: guesses.yearCorrect,
			scorerCorrect: guesses.scorerCorrect
		})
		.from(guesses)
		.where(eq(guesses.goalId, goalId))
		.all();

	const totalGuesses = allGuesses.length;

	if (totalGuesses === 0) {
		return {
			totalGuesses: 0,
			teamCorrectPercent: 0,
			yearCorrectPercent: 0,
			scorerCorrectPercent: 0,
			mostGuessedTeam: null,
			mostGuessedYear: null,
			mostGuessedScorer: null
		};
	}

	// Calculate correct percentages
	const teamCorrect = allGuesses.filter((g) => g.teamCorrect).length;
	const yearCorrect = allGuesses.filter((g) => g.yearCorrect).length;
	const scorerCorrect = allGuesses.filter((g) => g.scorerCorrect).length;

	// Find most guessed values
	const teamCounts = new Map<string, number>();
	const yearCounts = new Map<number, number>();
	const scorerCounts = new Map<string, number>();

	allGuesses.forEach((g) => {
		if (g.guessedTeam) {
			teamCounts.set(g.guessedTeam, (teamCounts.get(g.guessedTeam) ?? 0) + 1);
		}
		if (g.guessedYear) {
			yearCounts.set(g.guessedYear, (yearCounts.get(g.guessedYear) ?? 0) + 1);
		}
		if (g.guessedScorer) {
			scorerCounts.set(g.guessedScorer, (scorerCounts.get(g.guessedScorer) ?? 0) + 1);
		}
	});

	const mostGuessedTeam = [...teamCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
	const mostGuessedYear = [...yearCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
	const mostGuessedScorer = [...scorerCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

	return {
		totalGuesses,
		teamCorrectPercent: Math.round((teamCorrect / totalGuesses) * 100),
		yearCorrectPercent: Math.round((yearCorrect / totalGuesses) * 100),
		scorerCorrectPercent: Math.round((scorerCorrect / totalGuesses) * 100),
		mostGuessedTeam,
		mostGuessedYear,
		mostGuessedScorer
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	const dailyGame = await getTodaysDailyGame();

	// No game available - redirect to play which will show the error
	if (!dailyGame) {
		throw redirect(303, '/play');
	}

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
					guess: null,
					communityStats: null
				};
			}

			const goal = await db.select().from(goals).where(eq(goals.id, goalId)).get();
			const communityStats = await getCommunityStats(goalId);

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
								matchContext: goal.matchContext,
								animationData: goal.animationData
							}
						: null,
					guess: null,
					communityStats
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
							matchContext: goal.matchContext,
							animationData: goal.animationData
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
				},
				communityStats
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
