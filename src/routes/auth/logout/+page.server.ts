import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE = 'top-bins-daily-session';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		// Unlink user from session (can't delete — gameResults references session_id)
		await db.update(sessions).set({ userId: null }).where(eq(sessions.id, locals.sessionId));

		// Clear the cookie
		cookies.set(SESSION_COOKIE, '', {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: 0
		});

		redirect(303, '/');
	}
};
