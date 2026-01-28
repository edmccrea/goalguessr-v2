import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').unique(),
	email: text('email').unique(),
	passwordHash: text('password_hash'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
	avatarColor: text('avatar_color')
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => users.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const goals = sqliteTable('goals', {
	id: text('id').primaryKey(),
	team: text('team').notNull(),
	year: integer('year').notNull(),
	scorer: text('scorer').notNull(),
	competition: text('competition'),
	opponent: text('opponent'),
	matchContext: text('match_context'),
	videoUrl: text('video_url'),
	isInternational: integer('is_international', { mode: 'boolean' }).default(false),
	animationData: text('animation_data', { mode: 'json' }).notNull(),
	status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
	rejectionReason: text('rejection_reason'),
	submittedBy: text('submitted_by').references(() => users.id),
	submittedByUsername: text('submitted_by_username'),
	reviewedBy: text('reviewed_by').references(() => users.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const dailyGames = sqliteTable('daily_games', {
	id: text('id').primaryKey(),
	date: text('date').unique().notNull(),
	goal1Id: text('goal_1_id').references(() => goals.id),
	goal2Id: text('goal_2_id').references(() => goals.id),
	goal3Id: text('goal_3_id').references(() => goals.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const goalQueue = sqliteTable('goal_queue', {
	id: text('id').primaryKey(),
	goalId: text('goal_id').references(() => goals.id),
	scheduledDate: text('scheduled_date').notNull(),
	position: integer('position').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const gameResults = sqliteTable('game_results', {
	id: text('id').primaryKey(),
	dailyGameId: text('daily_game_id').references(() => dailyGames.id),
	sessionId: text('session_id').references(() => sessions.id),
	round1Score: integer('round_1_score').default(0),
	round2Score: integer('round_2_score').default(0),
	round3Score: integer('round_3_score').default(0),
	totalScore: integer('total_score').default(0),
	timeTakenMs: integer('time_taken_ms'),
	round1StartedAt: integer('round_1_started_at', { mode: 'timestamp' }),
	round2StartedAt: integer('round_2_started_at', { mode: 'timestamp' }),
	round3StartedAt: integer('round_3_started_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const guesses = sqliteTable('guesses', {
	id: text('id').primaryKey(),
	gameResultId: text('game_result_id').references(() => gameResults.id),
	goalId: text('goal_id').references(() => goals.id),
	roundNumber: integer('round_number'),
	guessedTeam: text('guessed_team'),
	guessedYear: integer('guessed_year'),
	guessedScorer: text('guessed_scorer'),
	teamCorrect: integer('team_correct', { mode: 'boolean' }),
	yearCorrect: integer('year_correct', { mode: 'boolean' }),
	scorerCorrect: integer('scorer_correct', { mode: 'boolean' }),
	timeTakenMs: integer('time_taken_ms'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Teams table for autocomplete suggestions
export const teams = sqliteTable('teams', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	shortName: text('short_name'),
	code: text('code'),
	country: text('country'),
	isNationalTeam: integer('is_national_team', { mode: 'boolean' }).default(false),
	logoUrl: text('logo_url'),
	externalId: text('external_id'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Team aliases for fuzzy matching (Man U, ManUtd, Red Devils, etc.)
export const teamAliases = sqliteTable('team_aliases', {
	id: text('id').primaryKey(),
	teamId: text('team_id')
		.references(() => teams.id)
		.notNull(),
	alias: text('alias').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Players table for autocomplete suggestions
export const players = sqliteTable('players', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	nationality: text('nationality'),
	position: text('position'),
	externalId: text('external_id'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Player-team associations (many-to-many with years)
export const playerTeams = sqliteTable('player_teams', {
	id: text('id').primaryKey(),
	playerId: text('player_id')
		.references(() => players.id)
		.notNull(),
	teamId: text('team_id')
		.references(() => teams.id)
		.notNull(),
	startYear: integer('start_year'),
	endYear: integer('end_year'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Player aliases (nicknames, alternate spellings)
export const playerAliases = sqliteTable('player_aliases', {
	id: text('id').primaryKey(),
	playerId: text('player_id')
		.references(() => players.id)
		.notNull(),
	alias: text('alias').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Competitions table for autocomplete suggestions
export const competitions = sqliteTable('competitions', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	shortName: text('short_name'),
	type: text('type', { enum: ['league', 'cup', 'international'] }).notNull(),
	country: text('country'),
	isInternational: integer('is_international', { mode: 'boolean' }).default(false),
	logoUrl: text('logo_url'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Sync metadata for tracking API imports
export const syncLogs = sqliteTable('sync_logs', {
	id: text('id').primaryKey(),
	syncType: text('sync_type').notNull(),
	status: text('status', { enum: ['started', 'completed', 'failed'] }).notNull(),
	recordsProcessed: integer('records_processed').default(0),
	errorMessage: text('error_message'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Type exports for use in the app
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type DailyGame = typeof dailyGames.$inferSelect;
export type GameResult = typeof gameResults.$inferSelect;
export type Guess = typeof guesses.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamAlias = typeof teamAliases.$inferSelect;
export type Player = typeof players.$inferSelect;
export type PlayerTeam = typeof playerTeams.$inferSelect;
export type PlayerAlias = typeof playerAliases.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type SyncLog = typeof syncLogs.$inferSelect;

// Animation data type
export interface AnimationData {
	duration: number;
	pitch: { width: number; height: number };
	players: {
		id: string;
		imageUrl?: string; // Club badge (international games) or nationality flag (club games)
	}[];
	keyframes: {
		time: number;
		positions: Record<string, { x: number; y: number; holder?: string }>;
	}[];
	events: {
		time: number;
		type: 'pass' | 'shot' | 'dribble';
		from: string;
		to?: string;
		result?: 'goal' | 'save' | 'miss';
		curve?: number; // Perpendicular offset for curved paths (-1 to 1, 0 = straight)
	}[];
}
