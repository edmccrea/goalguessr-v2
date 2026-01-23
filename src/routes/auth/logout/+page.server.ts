import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { unlinkSession } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ locals }) => {
		await unlinkSession(locals.sessionId);
		redirect(303, '/');
	}
};
