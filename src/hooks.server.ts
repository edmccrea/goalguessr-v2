import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE = 'goal-guessr-session';

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
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365 // 1 year
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
	}

	return resolve(event);
};
