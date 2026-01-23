import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { loginUser, linkSessionToUser } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const result = await loginUser(email, password);

		if (!result.success || !result.user) {
			return fail(400, {
				error: result.error ?? 'Login failed',
				email
			});
		}

		// Link current session to the user
		await linkSessionToUser(locals.sessionId, result.user.id);

		redirect(303, '/profile');
	}
};
