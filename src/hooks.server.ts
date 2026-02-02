import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import { eq, lt, sql } from 'drizzle-orm';

const SESSION_COOKIE = 'top-bins-daily-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SLIDING_REFRESH_THRESHOLD = 60 * 60 * 24 * 23; // 23 days — only refresh cookie within last 7 days

function generateId(): string {
	return crypto.randomUUID();
}

function getAppOrigin(url: URL): string {
	return url.origin;
}

export const handle: Handle = async ({ event, resolve }) => {
	// --- CSRF protection for mutating JSON requests ---
	if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
		const contentType = event.request.headers.get('content-type') ?? '';
		if (contentType.includes('application/json')) {
			const origin = event.request.headers.get('origin');
			const appOrigin = getAppOrigin(event.url);
			if (!origin || origin !== appOrigin) {
				return new Response(JSON.stringify({ error: 'CSRF validation failed' }), {
					status: 403,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}
	}

	let sessionId = event.cookies.get(SESSION_COOKIE);

	if (!sessionId) {
		// Create new anonymous session
		sessionId = generateId();
		await db.insert(sessions).values({
			id: sessionId,
			userId: null
		});

		event.cookies.set(SESSION_COOKIE, sessionId, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: SESSION_MAX_AGE
		});

		event.locals.sessionId = sessionId;
		event.locals.user = null;
	} else {
		// Get session and user in a single JOIN query
		const result = await db
			.select({
				sessionId: sessions.id,
				sessionUserId: sessions.userId,
				sessionLastActiveAt: sessions.lastActiveAt,
				userId: users.id,
				username: users.username,
				email: users.email,
				passwordHash: users.passwordHash,
				userCreatedAt: users.createdAt,
				isAdmin: users.isAdmin,
				avatarColor: users.avatarColor,
				hasSeenEditorTutorial: users.hasSeenEditorTutorial
			})
			.from(sessions)
			.leftJoin(users, eq(sessions.userId, users.id))
			.where(eq(sessions.id, sessionId))
			.get();

		if (!result) {
			// Session doesn't exist — generate a NEW session ID (prevent session fixation)
			sessionId = generateId();
			await db.insert(sessions).values({
				id: sessionId,
				userId: null
			});

			event.cookies.set(SESSION_COOKIE, sessionId, {
				path: '/',
				httpOnly: true,
				secure: !dev,
				sameSite: 'lax',
				maxAge: SESSION_MAX_AGE
			});

			event.locals.sessionId = sessionId;
			event.locals.user = null;
		} else {
			event.locals.sessionId = sessionId;

			// Build user object if session is linked to a user
			if (result.sessionUserId && result.userId) {
				event.locals.user = {
					id: result.userId,
					username: result.username,
					email: result.email,
					passwordHash: result.passwordHash,
					createdAt: result.userCreatedAt,
					isAdmin: result.isAdmin,
					avatarColor: result.avatarColor,
					hasSeenEditorTutorial: result.hasSeenEditorTutorial
				};
			} else {
				event.locals.user = null;
			}

			// Update last active timestamp
			await db
				.update(sessions)
				.set({ lastActiveAt: new Date() })
				.where(eq(sessions.id, sessionId));

			// Sliding cookie refresh — only re-set cookie if near expiry (within last 7 days)
			const lastActiveAt = result.sessionLastActiveAt;
			const ageMs = lastActiveAt ? Date.now() - lastActiveAt.getTime() : Infinity;
			if (ageMs > SLIDING_REFRESH_THRESHOLD * 1000) {
				event.cookies.set(SESSION_COOKIE, sessionId, {
					path: '/',
					httpOnly: true,
					secure: !dev,
					sameSite: 'lax',
					maxAge: SESSION_MAX_AGE
				});
			}
		}
	}

	// Probabilistic session cleanup (~1% of requests)
	if (Math.random() < 0.01) {
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		await db.delete(sessions).where(lt(sessions.lastActiveAt, thirtyDaysAgo));
	}

	return resolve(event);
};
