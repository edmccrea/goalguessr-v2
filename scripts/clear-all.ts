/**
 * Clear All Database Script
 *
 * Usage:
 *   DATABASE_URL="..." DATABASE_AUTH_TOKEN="..." npx tsx scripts/clear-all.ts
 *
 * This script clears ALL data from the database, including:
 * - Game data (guesses, results, daily games, goals)
 * - User data (users, sessions)
 * - Reference data (teams, players, competitions, aliases)
 * - Sync logs
 *
 * WARNING: This is destructive and irreversible!
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import {
	guesses,
	gameResults,
	dailyGames,
	goalQueue,
	goals,
	sessions,
	users,
	playerAliases,
	playerTeams,
	teamAliases,
	players,
	teams,
	competitions,
	syncLogs
} from '../src/lib/server/db/schema';

const client = createClient({
	url: process.env.DATABASE_URL ?? 'file:local.db',
	authToken: process.env.DATABASE_AUTH_TOKEN
});

const db = drizzle(client);

async function clearAll() {
	console.log('⚠️  Clearing ALL data from the database...\n');

	// Delete in order respecting foreign key constraints

	// 1. Game-related data (most dependent first)
	const guessCount = (await db.select().from(guesses).all()).length;
	await db.delete(guesses);
	console.log(`✓ Deleted ${guessCount} guesses`);

	const gameResultCount = (await db.select().from(gameResults).all()).length;
	await db.delete(gameResults);
	console.log(`✓ Deleted ${gameResultCount} game results`);

	const dailyGameCount = (await db.select().from(dailyGames).all()).length;
	await db.delete(dailyGames);
	console.log(`✓ Deleted ${dailyGameCount} daily games`);

	const queueCount = (await db.select().from(goalQueue).all()).length;
	await db.delete(goalQueue);
	console.log(`✓ Deleted ${queueCount} queued goals`);

	const goalCount = (await db.select().from(goals).all()).length;
	await db.delete(goals);
	console.log(`✓ Deleted ${goalCount} goals`);

	// 2. User data
	const sessionCount = (await db.select().from(sessions).all()).length;
	await db.delete(sessions);
	console.log(`✓ Deleted ${sessionCount} sessions`);

	const userCount = (await db.select().from(users).all()).length;
	await db.delete(users);
	console.log(`✓ Deleted ${userCount} users`);

	// 3. Player data (aliases first, then junction table, then players)
	const playerAliasCount = (await db.select().from(playerAliases).all()).length;
	await db.delete(playerAliases);
	console.log(`✓ Deleted ${playerAliasCount} player aliases`);

	const playerTeamCount = (await db.select().from(playerTeams).all()).length;
	await db.delete(playerTeams);
	console.log(`✓ Deleted ${playerTeamCount} player-team associations`);

	const playerCount = (await db.select().from(players).all()).length;
	await db.delete(players);
	console.log(`✓ Deleted ${playerCount} players`);

	// 4. Team data (aliases first)
	const teamAliasCount = (await db.select().from(teamAliases).all()).length;
	await db.delete(teamAliases);
	console.log(`✓ Deleted ${teamAliasCount} team aliases`);

	const teamCount = (await db.select().from(teams).all()).length;
	await db.delete(teams);
	console.log(`✓ Deleted ${teamCount} teams`);

	// 5. Competitions
	const competitionCount = (await db.select().from(competitions).all()).length;
	await db.delete(competitions);
	console.log(`✓ Deleted ${competitionCount} competitions`);

	// 6. Sync logs
	const syncLogCount = (await db.select().from(syncLogs).all()).length;
	await db.delete(syncLogs);
	console.log(`✓ Deleted ${syncLogCount} sync logs`);

	console.log('\n✅ Database cleared successfully!');
}

clearAll()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Clear failed:', err);
		process.exit(1);
	});
