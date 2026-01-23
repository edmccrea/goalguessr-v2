// Scoring constants
export const POINTS = {
	TEAM_CORRECT: 10,
	YEAR_CORRECT: 10,
	YEAR_CLOSE: 5, // ±1 year
	SCORER_CORRECT: 10,
	SPEED_BONUS_MAX: 10,
	SPEED_BONUS_FULL_TIME: 60_000, // Full bonus if answered within 60 seconds
	SPEED_BONUS_CUTOFF: 120_000 // No bonus after 120 seconds
} as const;

export const MAX_ROUND_SCORE = 40;
export const MAX_DAILY_SCORE = 120;

export interface GuessResult {
	teamCorrect: boolean;
	yearCorrect: boolean;
	yearClose: boolean; // Within ±1 year
	scorerCorrect: boolean;
	teamPoints: number;
	yearPoints: number;
	scorerPoints: number;
	speedBonus: number;
	totalPoints: number;
	timeTakenMs: number;
}

export interface CorrectAnswer {
	team: string;
	year: number;
	scorer: string;
}

export interface UserGuess {
	team: string;
	year: number;
	scorer: string;
	timeTakenMs: number;
}

/**
 * Normalize text for comparison:
 * - Lowercase
 * - Remove accents/diacritics
 * - Remove extra whitespace
 * - Handle common punctuation
 */
export function normalizeText(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.normalize('NFD') // Decompose accents
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[''`]/g, "'") // Normalize apostrophes
		.replace(/[-–—]/g, ' ') // Normalize dashes to spaces
		.replace(/[.]/g, '') // Remove periods (F.C. -> FC)
		.replace(/\s+/g, ' '); // Collapse whitespace
}

/**
 * Common team aliases and abbreviations
 */
const TEAM_ALIASES: Record<string, string[]> = {
	'manchester united': ['man utd', 'man u', 'manu', 'mufc', 'red devils', 'united'],
	'manchester city': ['man city', 'city', 'mcfc', 'cityzens'],
	'tottenham hotspur': ['tottenham', 'spurs', 'thfc'],
	arsenal: ['gunners', 'afc'],
	liverpool: ['lfc', 'reds', 'pool'],
	chelsea: ['cfc', 'blues'],
	'real madrid': ['real', 'rmcf', 'los blancos'],
	barcelona: ['barca', 'fcb', 'blaugrana'],
	'bayern munich': ['bayern', 'bayern munchen', 'fcb munich'],
	'paris saint germain': ['psg', 'paris', 'paris sg'],
	juventus: ['juve', 'jfc', 'old lady'],
	'inter milan': ['inter', 'internazionale'],
	'ac milan': ['milan', 'rossoneri'],
	'borussia dortmund': ['dortmund', 'bvb'],
	'atletico madrid': ['atletico', 'atleti'],
	// National teams
	'united states': ['usa', 'us', 'usmnt'],
	england: ['three lions'],
	germany: ['deutschland', 'die mannschaft'],
	brazil: ['brasil', 'selecao'],
	argentina: ['albiceleste'],
	netherlands: ['holland', 'dutch', 'oranje'],
	france: ['les bleus']
};

/**
 * Common player name variations
 */
const PLAYER_ALIASES: Record<string, string[]> = {
	'cristiano ronaldo': ['ronaldo', 'cr7', 'cristiano'],
	'lionel messi': ['messi', 'leo messi', 'la pulga'],
	'diego maradona': ['maradona', 'el pibe de oro'],
	pele: ['edson arantes', 'o rei'],
	'thierry henry': ['henry', 'titi'],
	'zinedine zidane': ['zidane', 'zizou'],
	'ronaldo nazario': ['ronaldo', 'r9', 'ronaldo brazil', 'ronaldo fenomeno'],
	'ole gunnar solskjaer': ['solskjaer', 'ole'],
	'steven gerrard': ['gerrard', 'stevie g'],
	'david beckham': ['beckham', 'becks'],
	'wayne rooney': ['rooney', 'wazza'],
	'frank lampard': ['lampard', 'lamps'],
	'alan shearer': ['shearer'],
	'gary lineker': ['lineker'],
	'michael owen': ['owen'],
	'paul gascoigne': ['gazza', 'gascoigne']
};

/**
 * Levenshtein edit distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
	const matrix: number[][] = [];

	for (let i = 0; i <= str2.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= str1.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= str2.length; i++) {
		for (let j = 1; j <= str1.length; j++) {
			if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1, // substitution
					matrix[i][j - 1] + 1, // insertion
					matrix[i - 1][j] + 1 // deletion
				);
			}
		}
	}

	return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
	const longer = str1.length > str2.length ? str1 : str2;
	const shorter = str1.length > str2.length ? str2 : str1;

	if (longer.length === 0) return 1.0;

	const distance = levenshteinDistance(longer, shorter);
	return (longer.length - distance) / longer.length;
}

/**
 * Check if two team names match (including aliases and fuzzy matching)
 */
export function teamsMatch(guess: string, correct: string): boolean {
	const normalizedGuess = normalizeText(guess);
	const normalizedCorrect = normalizeText(correct);

	// Direct match
	if (normalizedGuess === normalizedCorrect) return true;

	// Check if guess matches any alias of the correct team
	const correctAliases = TEAM_ALIASES[normalizedCorrect] || [];
	if (correctAliases.includes(normalizedGuess)) return true;

	// Check if correct matches any alias that the guess could be
	for (const [canonical, aliases] of Object.entries(TEAM_ALIASES)) {
		if (aliases.includes(normalizedGuess) && canonical === normalizedCorrect) {
			return true;
		}
		// Also check if the guess is a canonical name and correct is an alias
		if (normalizedGuess === canonical && aliases.includes(normalizedCorrect)) {
			return true;
		}
	}

	// Check similarity score for typos (85% threshold)
	const similarity = calculateSimilarity(normalizedGuess, normalizedCorrect);
	return similarity >= 0.85;
}

/**
 * Check if two player names match (including last name, aliases, and fuzzy matching)
 */
export function playersMatch(guess: string, correct: string): boolean {
	const normalizedGuess = normalizeText(guess);
	const normalizedCorrect = normalizeText(correct);

	// Direct match
	if (normalizedGuess === normalizedCorrect) return true;

	// Check last name match (common for players)
	const guessWords = normalizedGuess.split(' ');
	const correctWords = normalizedCorrect.split(' ');
	const guessLastName = guessWords[guessWords.length - 1];
	const correctLastName = correctWords[correctWords.length - 1];

	// Last name exact match (for names >= 4 chars to avoid false positives)
	if (guessLastName === correctLastName && guessLastName.length >= 4) {
		return true;
	}

	// Check known aliases
	const correctAliases = PLAYER_ALIASES[normalizedCorrect] || [];
	if (correctAliases.includes(normalizedGuess)) return true;

	// Check reverse - if guess is canonical and correct is alias
	for (const [canonical, aliases] of Object.entries(PLAYER_ALIASES)) {
		if (aliases.includes(normalizedGuess) && canonical === normalizedCorrect) {
			return true;
		}
		if (normalizedGuess === canonical && aliases.includes(normalizedCorrect)) {
			return true;
		}
	}

	// Check similarity (80% threshold for players - names vary more)
	const similarity = calculateSimilarity(normalizedGuess, normalizedCorrect);
	return similarity >= 0.8;
}

/**
 * Calculate base speed bonus based on time taken (before multiplier)
 * Full 10 points if answered within 60 seconds
 * Linear decrease from 60s to 120s (0 points at 120s+)
 */
export function calculateBaseSpeedBonus(timeTakenMs: number): number {
	if (timeTakenMs <= POINTS.SPEED_BONUS_FULL_TIME) {
		return POINTS.SPEED_BONUS_MAX;
	}

	if (timeTakenMs >= POINTS.SPEED_BONUS_CUTOFF) {
		return 0;
	}

	// Linear interpolation between 60s and 120s
	const timeInRange = timeTakenMs - POINTS.SPEED_BONUS_FULL_TIME;
	const rangeSize = POINTS.SPEED_BONUS_CUTOFF - POINTS.SPEED_BONUS_FULL_TIME;
	const progress = timeInRange / rangeSize;

	return Math.round(POINTS.SPEED_BONUS_MAX * (1 - progress));
}

/**
 * Calculate speed bonus with multiplier based on correct answers
 * Speed bonus is proportional to how many answers you got right
 * 0 correct = 0 bonus, 1 correct = 1/3 bonus, 2 correct = 2/3 bonus, 3 correct = full bonus
 */
export function calculateSpeedBonus(timeTakenMs: number, correctCount: number): number {
	if (correctCount === 0) return 0;

	const baseBonus = calculateBaseSpeedBonus(timeTakenMs);
	const multiplier = correctCount / 3;

	return Math.round(baseBonus * multiplier);
}

/**
 * Calculate the score for a single guess
 */
export function calculateScore(guess: UserGuess, correct: CorrectAnswer): GuessResult {
	const teamCorrect = teamsMatch(guess.team, correct.team);
	const yearCorrect = guess.year === correct.year;
	const yearClose = !yearCorrect && Math.abs(guess.year - correct.year) === 1;
	const scorerCorrect = playersMatch(guess.scorer, correct.scorer);

	const teamPoints = teamCorrect ? POINTS.TEAM_CORRECT : 0;
	const yearPoints = yearCorrect ? POINTS.YEAR_CORRECT : yearClose ? POINTS.YEAR_CLOSE : 0;
	const scorerPoints = scorerCorrect ? POINTS.SCORER_CORRECT : 0;

	// Count correct answers for speed bonus multiplier
	// Year close counts as 0.5 for the multiplier
	const correctCount =
		(teamCorrect ? 1 : 0) + (yearCorrect ? 1 : yearClose ? 0.5 : 0) + (scorerCorrect ? 1 : 0);

	const speedBonus = calculateSpeedBonus(guess.timeTakenMs, correctCount);

	const totalPoints = teamPoints + yearPoints + scorerPoints + speedBonus;

	return {
		teamCorrect,
		yearCorrect,
		yearClose,
		scorerCorrect,
		teamPoints,
		yearPoints,
		scorerPoints,
		speedBonus,
		totalPoints,
		timeTakenMs: guess.timeTakenMs
	};
}
