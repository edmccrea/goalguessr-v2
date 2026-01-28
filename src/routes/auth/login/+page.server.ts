import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { loginUser, linkSessionToUser } from '$lib/server/auth';
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '$lib/server/rate-limit';

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress }) => {
		const clientIp = getClientAddress();
		const rateLimitKey = `login:${clientIp}`;

		// Check rate limit
		const { allowed, remainingAttempts, resetInMs } = await checkRateLimit(rateLimitKey);
		if (!allowed) {
			const resetInMinutes = Math.ceil(resetInMs / 60000);
			return fail(429, {
				error: `Too many login attempts. Please try again in ${resetInMinutes} minute${resetInMinutes === 1 ? '' : 's'}.`,
				email: ''
			});
		}

		const formData = await request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const result = await loginUser(email, password);

		if (!result.success || !result.user) {
			await recordFailedAttempt(rateLimitKey);
			const { remainingAttempts: attemptsLeft } = await checkRateLimit(rateLimitKey);

			let errorMsg = result.error ?? 'Login failed';
			if (attemptsLeft > 0 && attemptsLeft <= 3) {
				errorMsg += ` (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining)`;
			}

			return fail(400, {
				error: errorMsg,
				email
			});
		}

		// Clear rate limit on successful login
		await clearAttempts(rateLimitKey);

		// Link current session to the user
		await linkSessionToUser(locals.sessionId, result.user.id);

		redirect(303, '/profile');
	}
};
