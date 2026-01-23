import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { registerUser, linkSessionToUser } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirm')?.toString() ?? '';

		// Check passwords match
		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Passwords do not match',
				username,
				email
			});
		}

		const result = await registerUser(username, email, password);

		if (!result.success || !result.user) {
			return fail(400, {
				error: result.error ?? 'Registration failed',
				username,
				email
			});
		}

		// Link current session to the new user
		await linkSessionToUser(locals.sessionId, result.user.id);

		redirect(303, '/profile');
	}
};
