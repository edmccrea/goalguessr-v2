import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE = 'top-bins-daily-session';

function generateId(): string {
	return crypto.randomUUID();
}

export const handle: Handle = async ({ event, resolve }) => {
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
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		event.locals.sessionId = sessionId;
		event.locals.user = null;
	} else {
		// Get session and user if linked
		const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();

		if (!session) {
			// Session doesn't exist, create it
			await db.insert(sessions).values({
				id: sessionId,
				userId: null
			});
			event.locals.sessionId = sessionId;
			event.locals.user = null;
		} else {
			event.locals.sessionId = sessionId;

			// Load user if session is linked to one
			if (session.userId) {
				const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
				event.locals.user = user ?? null;
			} else {
				event.locals.user = null;
			}
		}

		// Refresh cookie expiry on each request (sliding expiration)
		event.cookies.set(SESSION_COOKIE, sessionId, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});
	}

	return resolve(event);
};
