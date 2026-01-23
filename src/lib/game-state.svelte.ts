import { browser } from '$app/environment';
import type { GuessResult } from './scoring';

export interface RoundState {
	completed: boolean;
	guess?: {
		team: string;
		year: number;
		scorer: string;
	};
	result?: GuessResult;
	goalId?: string;
}

export interface GameState {
	date: string; // YYYY-MM-DD format
	dailyGameId: string | null;
	sessionId: string | null;
	rounds: [RoundState, RoundState, RoundState];
	totalScore: number;
}

const STORAGE_KEY = 'goal-guessr-game-state';

function getToday(): string {
	return new Date().toISOString().split('T')[0];
}

function createEmptyState(): GameState {
	return {
		date: getToday(),
		dailyGameId: null,
		sessionId: null,
		rounds: [
			{ completed: false },
			{ completed: false },
			{ completed: false }
		],
		totalScore: 0
	};
}

function loadState(): GameState {
	if (!browser) return createEmptyState();

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const state = JSON.parse(stored) as GameState;
			// Reset state if it's from a different day
			if (state.date !== getToday()) {
				return createEmptyState();
			}
			return state;
		}
	} catch {
		// Ignore errors, return empty state
	}
	return createEmptyState();
}

function saveState(state: GameState): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Create reactive game state
function createGameState() {
	let state = $state<GameState>(loadState());

	// Save state whenever it changes
	$effect(() => {
		saveState(state);
	});

	return {
		get state() {
			return state;
		},

		get date() {
			return state.date;
		},

		get dailyGameId() {
			return state.dailyGameId;
		},

		get sessionId() {
			return state.sessionId;
		},

		get rounds() {
			return state.rounds;
		},

		get totalScore() {
			return state.totalScore;
		},

		get allRoundsCompleted() {
			return state.rounds.every((r) => r.completed);
		},

		get nextIncompleteRound(): number | null {
			const idx = state.rounds.findIndex((r) => !r.completed);
			return idx >= 0 ? idx + 1 : null;
		},

		setDailyGameId(id: string) {
			state.dailyGameId = id;
		},

		setSessionId(id: string) {
			state.sessionId = id;
		},

		completeRound(roundNumber: number, guess: { team: string; year: number; scorer: string }, result: GuessResult, goalId: string) {
			const idx = roundNumber - 1;
			if (idx < 0 || idx > 2) return;

			state.rounds[idx] = {
				completed: true,
				guess,
				result,
				goalId
			};

			state.totalScore = state.rounds.reduce((sum, r) => sum + (r.result?.totalPoints ?? 0), 0);
		},

		getRound(roundNumber: number): RoundState | null {
			const idx = roundNumber - 1;
			if (idx < 0 || idx > 2) return null;
			return state.rounds[idx];
		},

		isRoundCompleted(roundNumber: number): boolean {
			return this.getRound(roundNumber)?.completed ?? false;
		},

		reset() {
			state = createEmptyState();
		}
	};
}

export const gameState = createGameState();
