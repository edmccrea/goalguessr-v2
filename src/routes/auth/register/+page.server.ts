import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { registerUser, linkSessionToUser } from '$lib/server/auth';
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '$lib/server/rate-limit';

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress }) => {
		const clientIp = getClientAddress();
		const rateLimitKey = `register:${clientIp}`;

		// Check rate limit
		const { allowed, resetInMs } = checkRateLimit(rateLimitKey);
		if (!allowed) {
			const resetInMinutes = Math.ceil(resetInMs / 60000);
			return fail(429, {
				error: `Too many registration attempts. Please try again in ${resetInMinutes} minute${resetInMinutes === 1 ? '' : 's'}.`,
				username: '',
				email: ''
			});
		}

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
			recordFailedAttempt(rateLimitKey);
			return fail(400, {
				error: result.error ?? 'Registration failed',
				username,
				email
			});
		}

		// Clear rate limit on successful registration
		clearAttempts(rateLimitKey);

		// Link current session to the new user
		await linkSessionToUser(locals.sessionId, result.user.id);

		redirect(303, '/profile');
	}
};
