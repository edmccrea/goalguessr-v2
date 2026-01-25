type RateLimitEntry = {
	count: number;
	firstAttempt: number;
};

const attempts = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; resetInMs: number } {
	const now = Date.now();
	const entry = attempts.get(identifier);

	// Clean up old entries periodically
	if (Math.random() < 0.01) {
		cleanupOldEntries(now);
	}

	if (!entry) {
		return { allowed: true, remainingAttempts: MAX_ATTEMPTS, resetInMs: 0 };
	}

	// Check if window has expired
	if (now - entry.firstAttempt > WINDOW_MS) {
		attempts.delete(identifier);
		return { allowed: true, remainingAttempts: MAX_ATTEMPTS, resetInMs: 0 };
	}

	const remainingAttempts = Math.max(0, MAX_ATTEMPTS - entry.count);
	const resetInMs = WINDOW_MS - (now - entry.firstAttempt);

	return {
		allowed: entry.count < MAX_ATTEMPTS,
		remainingAttempts,
		resetInMs
	};
}

export function recordFailedAttempt(identifier: string): void {
	const now = Date.now();
	const entry = attempts.get(identifier);

	if (!entry || now - entry.firstAttempt > WINDOW_MS) {
		attempts.set(identifier, { count: 1, firstAttempt: now });
	} else {
		entry.count++;
	}
}

export function clearAttempts(identifier: string): void {
	attempts.delete(identifier);
}

function cleanupOldEntries(now: number): void {
	for (const [key, entry] of attempts.entries()) {
		if (now - entry.firstAttempt > WINDOW_MS) {
			attempts.delete(key);
		}
	}
}
