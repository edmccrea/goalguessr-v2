import { db } from '$lib/server/db';
import { rateLimits } from '$lib/server/db/schema';
import { and, eq, lt } from 'drizzle-orm';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const SUBMISSION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_HOUR = 10;

const SEARCH_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_SEARCH_PER_MINUTE = 60;

function getTypeFromIdentifier(identifier: string): 'login' | 'register' | 'submission' | 'search' {
	if (identifier.startsWith('register:')) return 'register';
	if (identifier.startsWith('search:')) return 'search';
	return 'login';
}

function getWindowForType(type: string): number {
	if (type === 'submission') return SUBMISSION_WINDOW_MS;
	if (type === 'search') return SEARCH_WINDOW_MS;
	return WINDOW_MS;
}

function getMaxForType(type: string): number {
	if (type === 'submission') return MAX_SUBMISSIONS_PER_HOUR;
	if (type === 'search') return MAX_SEARCH_PER_MINUTE;
	return MAX_ATTEMPTS;
}

async function probabilisticCleanup(): Promise<void> {
	if (Math.random() < 0.01) {
		const now = Date.now();
		// Delete all expired entries — use a generous cutoff (oldest possible window)
		const cutoff = now - Math.max(WINDOW_MS, SUBMISSION_WINDOW_MS, SEARCH_WINDOW_MS);
		await db.delete(rateLimits).where(lt(rateLimits.windowStart, cutoff));
	}
}

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remainingAttempts: number; resetInMs: number }> {
	const now = Date.now();
	const type = getTypeFromIdentifier(identifier);
	const windowMs = getWindowForType(type);
	const maxAttempts = getMaxForType(type);

	const entry = await db
		.select()
		.from(rateLimits)
		.where(and(eq(rateLimits.key, identifier), eq(rateLimits.type, type)))
		.get();

	if (!entry) {
		await probabilisticCleanup();
		return { allowed: true, remainingAttempts: maxAttempts, resetInMs: 0 };
	}

	// Check if window has expired
	if (now - entry.windowStart > windowMs) {
		await db
			.delete(rateLimits)
			.where(and(eq(rateLimits.key, identifier), eq(rateLimits.type, type)));
		await probabilisticCleanup();
		return { allowed: true, remainingAttempts: maxAttempts, resetInMs: 0 };
	}

	const remainingAttempts = Math.max(0, maxAttempts - entry.count);
	const resetInMs = windowMs - (now - entry.windowStart);

	return {
		allowed: entry.count < maxAttempts,
		remainingAttempts,
		resetInMs
	};
}

export async function recordFailedAttempt(identifier: string): Promise<void> {
	const now = Date.now();
	const type = getTypeFromIdentifier(identifier);
	const windowMs = getWindowForType(type);

	const entry = await db
		.select()
		.from(rateLimits)
		.where(and(eq(rateLimits.key, identifier), eq(rateLimits.type, type)))
		.get();

	if (!entry || now - entry.windowStart > windowMs) {
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
	const type = getTypeFromIdentifier(identifier);
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

export async function checkSearchRateLimit(ip: string): Promise<{ allowed: boolean; resetInMs: number }> {
	const identifier = `search:${ip}`;
	const { allowed, resetInMs } = await checkRateLimit(identifier);

	if (allowed) {
		// Record the request
		await recordFailedAttempt(identifier);
	}

	return { allowed, resetInMs };
}
