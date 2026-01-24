import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Require authenticated user
	if (!locals.user) {
		throw redirect(303, '/auth/login?redirect=/admin');
	}

	// Require admin privileges
	if (!locals.user.isAdmin) {
		throw redirect(303, '/?error=unauthorized');
	}

	return {
		user: locals.user
	};
};
