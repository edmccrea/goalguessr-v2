import type { Config } from '@netlify/functions';
import { createClient } from '@libsql/client';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export default async function handler() {
	const client = createClient({
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN
	});

	const now = Date.now();
	const sessionCutoff = new Date(now - THIRTY_DAYS_MS);
	const rateLimitCutoff = now - TWENTY_FOUR_HOURS_MS;

	// Convert to unix timestamp in seconds for comparison with SQLite timestamp columns
	const sessionCutoffEpoch = Math.floor(sessionCutoff.getTime() / 1000);

	// 1. Nullify session_id on game_results referencing expired sessions
	await client.execute({
		sql: `UPDATE game_results SET session_id = NULL
		      WHERE session_id IN (
		        SELECT id FROM sessions
		        WHERE last_active_at < ?
		           OR (last_active_at IS NULL AND created_at < ?)
		      )`,
		args: [sessionCutoffEpoch, sessionCutoffEpoch]
	});

	// 2. Delete expired rate_limits rows (older than 24 hours)
	await client.execute({
		sql: `DELETE FROM rate_limits WHERE window_start < ?`,
		args: [rateLimitCutoff]
	});

	// 3. Delete expired sessions
	const result = await client.execute({
		sql: `DELETE FROM sessions
		      WHERE last_active_at < ?
		         OR (last_active_at IS NULL AND created_at < ?)`,
		args: [sessionCutoffEpoch, sessionCutoffEpoch]
	});

	return new Response(
		JSON.stringify({
			message: 'Cleanup complete',
			deletedSessions: result.rowsAffected
		}),
		{ status: 200, headers: { 'Content-Type': 'application/json' } }
	);
}

export const config: Config = {
	schedule: '0 3 * * *' // Daily at 3 AM UTC
};
