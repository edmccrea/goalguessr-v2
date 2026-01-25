/**
 * Production Setup Script
 *
 * Usage:
 *   DATABASE_URL="..." DATABASE_AUTH_TOKEN="..." npx tsx scripts/setup-production.ts
 *
 * This script:
 * - Makes all existing users admins
 * - Clears all goals and game data
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { users, goals, dailyGames, gameResults, guesses, goalQueue } from '../src/lib/server/db/schema';

// Database connection
const client = createClient({
	url: process.env.DATABASE_URL ?? 'file:local.db',
	authToken: process.env.DATABASE_AUTH_TOKEN
});

const db = drizzle(client);

async function setup() {
	console.log('Setting up production database...\n');

	// 1. Make all users admins
	console.log('Making all users admins...');
	const allUsers = await db.select().from(users).all();
	console.log(`  Found ${allUsers.length} user(s)`);

	for (const user of allUsers) {
		await db.update(users).set({ isAdmin: true }).where((await import('drizzle-orm')).eq(users.id, user.id));
		console.log(`  ✓ Made ${user.username || user.email} an admin`);
	}

	// 2. Clear all game data (in order due to foreign keys)
	console.log('\nClearing game data...');

	const guessCount = (await db.select().from(guesses).all()).length;
	await db.delete(guesses);
	console.log(`  ✓ Deleted ${guessCount} guesses`);

	const gameResultCount = (await db.select().from(gameResults).all()).length;
	await db.delete(gameResults);
	console.log(`  ✓ Deleted ${gameResultCount} game results`);

	const dailyGameCount = (await db.select().from(dailyGames).all()).length;
	await db.delete(dailyGames);
	console.log(`  ✓ Deleted ${dailyGameCount} daily games`);

	const queueCount = (await db.select().from(goalQueue).all()).length;
	await db.delete(goalQueue);
	console.log(`  ✓ Deleted ${queueCount} queued goals`);

	const goalCount = (await db.select().from(goals).all()).length;
	await db.delete(goals);
	console.log(`  ✓ Deleted ${goalCount} goals`);

	console.log('\nProduction setup complete!');
}

setup()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Setup failed:', err);
		process.exit(1);
	});
