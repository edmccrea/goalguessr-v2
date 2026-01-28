import { db } from '$lib/server/db';
import { rateLimits } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const SUBMISSION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_HOUR = 10;

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remainingAttempts: number; resetInMs: number }> {
	const now = Date.now();
	const type = identifier.startsWith('register:') ? 'register' as const : 'login' as const;
	const entry = await db
		.select()
		.from(rateLimits)
		.where(and(eq(rateLimits.key, identifier), eq(rateLimits.type, type)))
		.get();

	if (!entry) {
		return { allowed: true, remainingAttempts: MAX_ATTEMPTS, resetInMs: 0 };
	}

	// Check if window has expired
	if (now - entry.windowStart > WINDOW_MS) {
		await db
			.delete(rateLimits)
			.where(and(eq(rateLimits.key, identifier), eq(rateLimits.type, type)));
		return { allowed: true, remainingAttempts: MAX_ATTEMPTS, resetInMs: 0 };
	}

	const remainingAttempts = Math.max(0, MAX_ATTEMPTS - entry.count);
	const resetInMs = WINDOW_MS - (now - entry.windowStart);

	return {
		allowed: entry.count < MAX_ATTEMPTS,
		remainingAttempts,
		resetInMs
	};
}

export async function recordFailedAttempt(identifier: string): Promise<void> {
	const now = Date.now();
	// Determine the type from the identifier prefix
	const type = identifier.startsWith('register:') ? 'register' as const : 'login' as const;

	const entry = await db
		.select()
		.from(rateLimits)
		.where(and(eq(rateLimits.key, identifier), eq(rateLimits.type, type)))
		.get();

	if (!entry || now - entry.windowStart > WINDOW_MS) {
		await db
			.insert(rateLimits)
			.values({ key: identifier, type, count: 1, windowStart: now })
			.onConflictDoUpdate({
				target: [rateLimits.key, rateLimits.type],
				set: { count: 1, windowStart: now }
			});
	} else {
		await db
			.update(rateLimits)
			.set({ count: entry.count + 1 })
			.where(and(eq(rateLimits.key, identifier), eq(rateLimits.type, type)));
	}
}

export async function clearAttempts(identifier: string): Promise<void> {
	const type = identifier.startsWith('register:') ? 'register' as const : 'login' as const;
	await db
		.delete(rateLimits)
		.where(and(eq(rateLimits.key, identifier), eq(rateLimits.type, type)));
}

export async function checkSubmissionLimit(userId: string): Promise<{
	allowed: boolean;
	remaining: number;
	resetInMs: number;
}> {
	const now = Date.now();
	const entry = await db
		.select()
		.from(rateLimits)
		.where(and(eq(rateLimits.key, userId), eq(rateLimits.type, 'submission')))
		.get();

	if (!entry) {
		return { allowed: true, remaining: MAX_SUBMISSIONS_PER_HOUR, resetInMs: 0 };
	}

	if (now - entry.windowStart > SUBMISSION_WINDOW_MS) {
		await db
			.delete(rateLimits)
			.where(and(eq(rateLimits.key, userId), eq(rateLimits.type, 'submission')));
		return { allowed: true, remaining: MAX_SUBMISSIONS_PER_HOUR, resetInMs: 0 };
	}

	const remaining = Math.max(0, MAX_SUBMISSIONS_PER_HOUR - entry.count);
	const resetInMs = SUBMISSION_WINDOW_MS - (now - entry.windowStart);

	return {
		allowed: entry.count < MAX_SUBMISSIONS_PER_HOUR,
		remaining,
		resetInMs
	};
}

export async function recordSubmission(userId: string): Promise<void> {
	const now = Date.now();
	const entry = await db
		.select()
		.from(rateLimits)
		.where(and(eq(rateLimits.key, userId), eq(rateLimits.type, 'submission')))
		.get();

	if (!entry || now - entry.windowStart > SUBMISSION_WINDOW_MS) {
		await db
			.insert(rateLimits)
			.values({ key: userId, type: 'submission', count: 1, windowStart: now })
			.onConflictDoUpdate({
				target: [rateLimits.key, rateLimits.type],
				set: { count: 1, windowStart: now }
			});
	} else {
		await db
			.update(rateLimits)
			.set({ count: entry.count + 1 })
			.where(and(eq(rateLimits.key, userId), eq(rateLimits.type, 'submission')));
	}
}
