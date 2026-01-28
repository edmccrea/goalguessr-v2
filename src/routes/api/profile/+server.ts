import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export const PATCH: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		return json({ error: 'You must be logged in' }, { status: 401 });
	}

	const body = await request.json();
	const { avatarColor } = body;

	if (typeof avatarColor !== 'string' || !HEX_COLOR_REGEX.test(avatarColor)) {
		return json({ error: 'Invalid color. Must be a hex color like #FF5500.' }, { status: 400 });
	}

	await db.update(users).set({ avatarColor }).where(eq(users.id, locals.user.id));

	return json({ success: true, avatarColor });
};
